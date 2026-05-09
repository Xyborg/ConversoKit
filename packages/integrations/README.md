# @conversokit/integrations

Real and mock integrations for ConversoKit: Stripe, HubSpot, Resend, Cloudflare Email, and Supabase persistent stores.

Part of [ConversoKit](https://github.com/Xyborg/ConversoKit) — a boilerplate for building ChatGPT Apps (Apps SDK / MCP) in <30 minutes.

## Install

```bash
pnpm add @conversokit/integrations
# or
npm install @conversokit/integrations
```

## Usage

```ts
import {
  StripeProvider,
  MockPaymentProvider,
  HubspotProvider,
  MockCrmProvider,
  SupabaseCartStore,
} from '@conversokit/integrations';

const payments = StripeProvider.fromEnv() ?? new MockPaymentProvider();
const crm = HubspotProvider.fromEnv() ?? new MockCrmProvider();
const cart = SupabaseCartStore.fromEnv() ?? undefined;
```

Real providers return `null` from `fromEnv()` when their env vars are missing, so callers can fall back to mocks. Stripe checkout sessions are signed with idempotency keys and verified webhooks; HubSpot CRM v3 does create-or-PATCH on email conflict.

## Documentation

Full docs and runnable examples live in the [main repo](https://github.com/Xyborg/ConversoKit#readme).

## License

Apache-2.0 © Martín Aberastegue
