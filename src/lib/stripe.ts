import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_xxx'
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true })
  : null;

export const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  portfolio: process.env.STRIPE_PORTFOLIO_PRICE_ID!,
} as const;

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  customerEmail: string,
  customerId?: string
) {
  if (!stripe) throw new Error("Stripe not configured");
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId || undefined,
    customer_email: customerId ? undefined : customerEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=canceled`,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function createBillingPortalSession(customerId: string) {
  if (!stripe) throw new Error("Stripe not configured");
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return session;
}

export async function getSubscription(subscriptionId: string) {
  if (!stripe) throw new Error("Stripe not configured");
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}
