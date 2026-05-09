# SaaS onboarding

Multi-step qualification flow with CRM sync.

## Generate it

```bash
npx conversokit create my-saas --template saas-onboarding
cd my-saas
pnpm install
pnpm dev
```

## What ships

| Layer | Surface |
| --- | --- |
| MCP tools | `submit_lead` (CRM upsert is mocked by default) |
| Widgets | `MultiStepForm`, `LeadCaptureForm`, `CTABanner`, `ConsentBanner` |
| Theme | `modernSaasTheme` |
| Integrations | `MockCrmProvider` (swap to `HubspotProvider` once it's implemented) |

## Customise

1. Replace `EXAMPLE_LEAD_FORM` with the steps and fields your funnel actually needs.
2. Wire a real CRM by setting `HUBSPOT_API_KEY` (or implement `salesforce.ts` against the same `CrmProvider` interface).
3. Add post-submit automations (welcome email via Resend, scheduling a discovery call via the booking template's tools).
