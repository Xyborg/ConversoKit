# Integrations

Wire ConversoKit to external services (payments, CRMs, calendars, …).

## How an integration works

Each integration is a small interface in `@conversokit/integrations` plus one or more implementations:

```ts
// packages/integrations/src/types.ts
interface PaymentProvider {
  id: string;
  createCheckoutSession(opts): Promise<CheckoutSession>;
}

// packages/integrations/src/stripe.ts
class StripeProvider implements PaymentProvider { ... }
```

Consumers (MCP tools, CLI templates) import the **interface** and pick an implementation at runtime, usually keyed off env vars:

```ts
import { MockPaymentProvider, createStripeProvider } from '@conversokit/integrations';
const stripe = createStripeProvider(process.env);
const provider = stripe ?? new MockPaymentProvider();
```

This is the **fallback pattern**. Set the integration's env keys and you get the real provider; leave them unset and you get a Mock that keeps the dev loop unblocked.

## What ships in 0.1.x

| Domain | Real provider | Mock fallback |
| --- | --- | --- |
| Payments | `StripeProvider` (Stripe Checkout + webhooks) | `MockPaymentProvider` |
| CRM | `HubspotProvider` (stub — throws "not implemented") | `MockCrmProvider` |
| Auth (OAuth) | `GoogleOAuthProvider` | `googleProvider(env) → null` |

The PRD calls out more (Shopify, Supabase, Airtable, Notion, Salesforce, Resend, Zapier, Webhooks). Each has the same shape: a provider interface in `packages/integrations/src/<domain>.ts`, factory keyed off env.

## Stripe

```bash
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

- `create_checkout` MCP tool builds a Stripe Checkout session, returns the URL.
- `POST /webhooks/stripe` verifies the signature and records orders in `OrderStore` (in-memory; swap for a DB-backed store before production).
- Idempotency key = `${sessionId}:${cartHash}`.

To test webhooks locally:

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
stripe trigger checkout.session.completed
curl localhost:3000/admin/orders
```

## Adding a new integration

1. Write the interface in `packages/integrations/src/<domain>.ts`.
2. Implement at least one **real** provider and a **mock** fallback.
3. Add `create<Provider>(env)` factory that returns `null` when env is missing.
4. Re-export from `packages/integrations/src/index.ts`.
5. Update the integration's MCP tool to use the fallback pattern above.
6. Document the env keys in `.env.example`.
7. Add it to the relevant template's `integrations: [...]` field in `@conversokit/templates`.

## Persistence (Supabase recipe)

The default stores under `apps/mcp-server/src/store/*` are `InMemory*` — fine for dev but lose data on restart. To swap for Supabase:

1. Create a Supabase project; export `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
2. Implement `CartStore`, `OrderStore`, `LeadStore`, `ReservationStore` against `@supabase/supabase-js` in a new `packages/integrations/src/supabase.ts`.
3. Replace the `defaultXStore` exports with environment-aware factories.

This lives outside MVP — the interfaces let you do it without touching tools.
