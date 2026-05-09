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

| Domain | Real providers | Mock / fallback |
| --- | --- | --- |
| Payments | `StripeProvider` (Stripe Checkout + webhooks + idempotency) | `MockPaymentProvider` |
| CRM | `HubspotProvider` (CRM v3 create-or-PATCH on email conflict) | `MockCrmProvider` |
| Email | `ResendEmailProvider`, `CloudflareEmailProvider` (beta) | `MockEmailProvider` |
| Persistent stores | `SupabaseCartStore` / `OrderStore` / `ReservationStore` / `LeadStore` / `UserDataStore` | `InMemory*` defaults in `apps/mcp-server/src/store/` |
| Auth — OAuth flow | `GoogleOAuthProvider`, `GitHubOAuthProvider`, `MicrosoftOAuthProvider`, `Auth0Provider` | factory `→ null` when env missing |
| Auth — JWT-verify | `bearerJwtProvider` (HS256 / JWKS), `clerkAuthProvider` (JWKS), `supabaseAuthProvider` (HS256) | — |

Each factory follows the same shape: `create<Provider>(env)` returns `null` when its env keys are missing, so consumers write `real ?? mock`.

### JWT-verify providers (Clerk, Supabase Auth)

`bearerJwtProvider({ secret? | jwksUri?, issuer?, audience? })` is the underlying primitive — it verifies bearer tokens from the `Authorization` header against either an HS256 shared secret or a remote JWKS.

- **Clerk** — `clerkAuthProvider(env)` derives the Clerk frontend API host from `CLERK_PUBLISHABLE_KEY` (or override via `CLERK_FRONTEND_API`) and verifies tokens against `https://<frontendApi>/.well-known/jwks.json` with the matching issuer.
- **Supabase Auth** — `supabaseAuthProvider(env)` reads `SUPABASE_JWT_SECRET` for HS256 verification; if `SUPABASE_URL` is also set, the issuer is pinned to `${SUPABASE_URL}/auth/v1`.

Both are `null` when their env is unset — wire them into `createAuthMiddleware({ providers })` alongside the other providers and the chain just skips them.

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
