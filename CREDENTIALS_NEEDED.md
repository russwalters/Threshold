# Threshold — Credentials & Setup Needed

Everything below needs to be provided before the app goes live. Each item has a placeholder in the codebase (environment variables in `.env.local`).

## 1. Supabase
- [ ] Create a Supabase project at https://supabase.com
- [ ] Run the migration SQL files in `supabase/migrations/` against your project
- [ ] Grab these values from Settings → API:
  - `NEXT_PUBLIC_SUPABASE_URL` — your project URL (e.g., `https://xxxxx.supabase.co`)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the `anon` / `public` key
  - `SUPABASE_SERVICE_ROLE_KEY` — the `service_role` key (server-side only, never expose to client)

## 2. Supabase Storage
- [ ] Create a storage bucket called `uploads` in Supabase Dashboard → Storage
- [ ] Set the bucket to **public** (for property/room/appliance photos) or configure signed URLs
- [ ] RLS policies are included in migrations — just run them

## 3. Stripe
- [ ] Create a Stripe account at https://stripe.com
- [ ] Create two Products with recurring Prices:
  - **Pro** — $9/month
  - **Portfolio** — $29/month
- [ ] Grab these values:
  - `STRIPE_SECRET_KEY` — from Developers → API keys
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from Developers → API keys
  - `STRIPE_PRO_PRICE_ID` — the Price ID for the Pro plan (starts with `price_`)
  - `STRIPE_PORTFOLIO_PRICE_ID` — the Price ID for the Portfolio plan
- [ ] Set up a webhook endpoint:
  - URL: `https://your-domain.com/api/stripe/webhook`
  - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
  - `STRIPE_WEBHOOK_SECRET` — from the webhook endpoint config (starts with `whsec_`)

## 4. Resend (Email)
- [ ] Create account at https://resend.com
- [ ] Verify your sending domain (or use the sandbox for testing)
- [ ] `RESEND_API_KEY` — from API Keys page
- [ ] `RESEND_FROM_EMAIL` — e.g., `hello@threshold.app` (must be from a verified domain, or `onboarding@resend.dev` for sandbox)

## 5. Vercel Deployment
- [ ] Connect the GitHub repo to Vercel
- [ ] Add ALL environment variables from `.env.local` to Vercel → Settings → Environment Variables
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g., `https://threshold.app`)
- [ ] After first deploy, update the Stripe webhook URL to point to your Vercel domain

## 6. Domain (Optional)
- [ ] Purchase domain and configure DNS to point to Vercel
- [ ] Update `NEXT_PUBLIC_APP_URL` accordingly

---

## Quick .env.local Template

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_PORTFOLIO_PRICE_ID=price_xxx

# Resend
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=hello@threshold.app

# App
NEXT_PUBLIC_APP_URL=http://localhost:3333
```
