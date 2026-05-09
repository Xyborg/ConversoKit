# Compliance

Scaffolding ConversoKit gives you for personal data handling. **This is not legal advice** — consult counsel for jurisdiction-specific requirements (GDPR, CCPA, HIPAA, etc.) before shipping.

## What ships out of the box

| Concern | Where | What it does |
| --- | --- | --- |
| Consent capture | `<ConsentBanner>` (`@conversokit/widgets`) | Modal banner; persists acceptance to `sessionStorage`. |
| Consent transport | `x-conversokit-consent` header on `/tools/:name` | The `@conversokit/bridge` sends it automatically when configured. |
| Consent enforcement | `consentMiddleware` + `requireConsent` (`apps/mcp-server`) | Returns 412 if a consent-gated tool is called without scope coverage. |
| Data export | `GET /userdata/export?userId=…` | Returns the InMemoryUserDataStore record for the user. |
| Data deletion | `DELETE /userdata?userId=…` | Removes the user's record from the store. |
| Retention policy | `RetentionPolicy` (`@conversokit/shared`) | Type-only today; implement against your store of choice. |

## What every PII-touching widget must declare

In its `WidgetMeta.config.permissions`:

```ts
{
  collectPersonalData: true,
  requiresConsent: true
}
```

In the corresponding MCP tool's `permissions`:

```ts
{ requiresAuth: false, requiresConsent: true }
```

This pair triggers the 412-without-consent guard server-side.

## Categories the boilerplate discourages collecting

Per PRD §14, do **not** collect any of the following without explicit purpose, documented retention, and a separate legal review:

1. **Medical data** beyond what the user volunteers in conversation.
2. **Financial credentials** — card numbers, CVV, full bank credentials. Use redirect-style payment providers (Stripe Checkout) instead.
3. **Government IDs** — SSN, passport numbers, driver licenses.
4. **Hidden data collection** — anything not surfaced in `WidgetConfig.permissions` and the `<ConsentBanner>`.

## App-review checklist

A human-readable version of [`app-review-checklist.md`](./app-review-checklist.md) lives next to this doc. Walk through it before submitting to the OpenAI Apps SDK review.

## Common pitfalls

- **Forgetting to mount the consent middleware.** Tools with `requiresConsent: true` will silently let calls through if the middleware isn't wired in. Use the `apps/mcp-server/src/index.ts` reference as the source of truth.
- **Logging the consent payload.** Don't. The header is JSON-encoded acceptance metadata; treat it as PII-adjacent.
- **In-memory stores in production.** `InMemoryUserDataStore` resets on restart, so an "exported" copy may differ from "what the user actually had." Swap to a DB before shipping.
