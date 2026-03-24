import { NextResponse } from "next/server";
import { stripe, PRICE_IDS } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";
import type { SubscriptionStatus } from "@/types/database";

function mapStripeStatus(status: string): SubscriptionStatus {
  if (status === "active") return "active";
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") return "canceled";
  if (status === "past_due") return "past_due";
  if (status === "trialing") return "trialing";
  return "active";
}

function getTierFromPriceId(priceId: string): "pro" | "portfolio" | "free" {
  if (priceId === PRICE_IDS.pro) return "pro";
  if (priceId === PRICE_IDS.portfolio) return "portfolio";
  return "free";
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  const supabase = createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId || !subscriptionId) break;

        // Retrieve the subscription to get the price ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as unknown as {
          id: string;
          status: string;
          items: { data: Array<{ price: { id: string } }> };
          current_period_start: number;
          current_period_end: number;
        };
        const priceId = subscription.items.data[0]?.price.id;
        const tier = getTierFromPriceId(priceId);

        // Upsert subscription record
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId,
          status: mapStripeStatus(subscription.status),
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        });

        // Update profile tier and customer ID
        await supabase
          .from("profiles")
          .update({
            subscription_tier: tier,
            stripe_customer_id: customerId,
          })
          .eq("id", userId);

        break;
      }

      case "customer.subscription.updated": {
        const subObj = event.data.object as unknown as {
          id: string;
          status: string;
          items: { data: Array<{ price: { id: string } }> };
          current_period_start: number;
          current_period_end: number;
        };
        const priceId = subObj.items.data[0]?.price.id;
        const tier = getTierFromPriceId(priceId);

        // Update subscription record
        await supabase
          .from("subscriptions")
          .update({
            stripe_price_id: priceId,
            status: mapStripeStatus(subObj.status),
            current_period_start: new Date(
              subObj.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subObj.current_period_end * 1000
            ).toISOString(),
          })
          .eq("stripe_subscription_id", subObj.id);

        // Update profile tier
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subObj.id)
          .single();

        if (sub?.user_id) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: tier })
            .eq("id", sub.user_id);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as unknown as { id: string };

        // Update subscription record
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled" as const,
          })
          .eq("stripe_subscription_id", deletedSub.id);

        // Set profile tier back to free
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", deletedSub.id)
          .single();

        if (sub?.user_id) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: "free" })
            .eq("id", sub.user_id);
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as unknown as { subscription?: string };
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);

          // Also update profile tier status
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (sub?.user_id) {
            await supabase
              .from("profiles")
              .update({ subscription_tier: "free" })
              .eq("id", sub.user_id);
          }
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
