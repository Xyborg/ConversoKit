# CRM assistant (post-MVP stub)

Not implemented in 0.1.x. The Dashboard widget category (KPIGrid, AnalyticsPanel, TrendChart, AlertFeed) is post-MVP per PRD §22 Phase 2/3.

## What you can build today

Use the SaaS onboarding template as a starting point — it covers lead capture and CRM sync. The MockCrmProvider can be swapped for a real HubSpot or Salesforce implementation.

```bash
npx conversokit create my-crm --template saas-onboarding
```

## Want to contribute?

Dashboard widgets + a `salesforce.ts` integration are good first PRs. Open an issue from the "Feature request" template to scope it.
