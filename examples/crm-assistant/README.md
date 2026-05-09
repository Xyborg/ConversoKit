# CRM assistant — ConversoKit example

A four-tab CRM assistant built on top of `@conversokit/widgets` (`LeadCaptureForm`, `MultiStepForm`, `KPIGrid`, `TrendChart`, `AnalyticsPanel`, `AlertFeed`, `ConsentBanner`) and a tiny Express MCP server that mocks `submit_lead`, `get_kpis`, `get_trend_series`, `get_analytics_panel`, and `get_alerts`. Lead capture upserts into HubSpot when `HUBSPOT_API_KEY` is set; otherwise the `MockCrmProvider` returns a synthetic id.

## Run it

```bash
pnpm install     # from the repo root
pnpm --filter example-crm-assistant dev
```

This starts both the MCP server (`http://localhost:3000`) and the Vite UI (`http://localhost:5173`).

## What's inside

- **`src/App.tsx`** — four tabs (Capture · Pipeline · Insights · Consent). Capture has a quick `LeadCaptureForm` and a multi-step qualify flow. Pipeline pulls `AnalyticsPanel` + `AlertFeed`. Insights pulls `KPIGrid` + `TrendChart`. Consent is a `ConsentBanner` showcase.
- **`src/server.ts`** — Express MCP server. `submit_lead` calls `crm.upsertContact`; the dashboard tools return the `EXAMPLE_*` data exported from `@conversokit/shared`.
- **Theme** — `enterpriseTheme` from `@conversokit/themes`.
- **Consent** — the whole UI is wrapped in `ConsentBanner` with `personalData` + `analytics` scopes; `submit_lead` declares `requiresConsent: true`.

## Going further

Replace `HubspotProvider` with a Salesforce / Pipedrive provider by following the `CrmProvider` interface in `packages/integrations/src/crm.ts`. Replace the in-memory `EXAMPLE_*` returns with reads from your warehouse / Supabase store via the `@conversokit/integrations` Supabase helpers.
