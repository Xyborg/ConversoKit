# Compliance guidance for widget authors

ConversoKit widgets are designed to run inside ChatGPT — a context where users
expect strong privacy guarantees. Follow these rules when authoring or
configuring widgets.

## Categories the boilerplate discourages collecting

Per PRD §14, do **not** collect any of the following without explicit purpose,
documented retention, and a separate legal review:

1. **Medical data** beyond what the user volunteers in conversation.
2. **Financial credentials** — card numbers, CVV, full bank credentials.
   Use a redirect-style payment provider (Stripe Checkout) instead.
3. **Government IDs** — SSN, passport numbers, driver licenses.
4. **Hidden data collection** — anything not surfaced in the consent banner
   and the widget's `WidgetConfig.permissions` block.

## What every personal-data-touching widget must declare

In `WidgetMeta.config.permissions`:

```ts
{
  collectPersonalData: true,
  requiresConsent: true
}
```

The corresponding MCP tool's `permissions.requiresConsent` must also be `true`,
so the server rejects calls without an `x-conversokit-consent` header that
covers the relevant scopes.

## What the host app must surface

- `<ConsentBanner scopes={[...]} privacyUrl termsUrl />` mounted above any
  consent-gated widget.
- Privacy URL and Terms URL configurable via the template's `compliance` block.
- `/userdata/export` and `/userdata` (DELETE) routes on the MCP server, gated
  by the user's auth identity.

## What lives where

| Concern | Location |
| --- | --- |
| `ConsentRecord` / `ConsentScope` schema | `@conversokit/shared/compliance` |
| Consent banner widget | `@conversokit/widgets` (`ConsentBanner`) |
| Consent header parsing + enforcement | `apps/mcp-server/src/middleware/consent` |
| User data export/delete endpoints | `apps/mcp-server/src/routes/userdata` |
| In-memory user data store | `apps/mcp-server/src/store/userData` (swap for DB-backed) |

## Not legal advice

This file describes scaffolding only. Consult counsel for jurisdiction-specific
requirements (GDPR, CCPA, HIPAA, etc.) before shipping in production.
