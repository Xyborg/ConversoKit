# ChatGPT App Boilerplate Platform — PRD

## Product Name

```txt id="b9w1ee"
ConversoKit
```

---

# 1. Product Vision

Build a modular, production-ready boilerplate for creating and launching ChatGPT Apps using the OpenAI Apps SDK + MCP architecture.

The platform should allow developers, startups, agencies, and internal teams to rapidly build conversational applications with reusable UI widgets, backend tools, integrations, and configurable business flows.

The product should abstract most of the complexity around:

* MCP servers
* widget rendering
* state handling
* conversational UX
* lead generation
* commerce flows
* booking flows
* auth
* integrations
* compliance patterns

Goal:

```txt id="zz9tm7"
Reduce time-to-market for ChatGPT Apps from weeks/months to hours.
```

---

# 2. Core Product Thesis

Current problem:

Building ChatGPT Apps today requires:

* understanding MCP
* building tool schemas
* widget rendering
* auth handling
* conversational UX design
* OpenAI app review requirements
* frontend/backend orchestration

This creates friction.

Opportunity:

Create the equivalent of:

```txt id="c8vqzh"
Next.js + Shopify + Stripe starter
for ChatGPT Apps
```

But focused on:

```txt id="prumjz"
Conversational UX
```

---

# 3. Target Users

## Primary

### AI developers

Need:

* fast scaffolding
* reusable widgets
* integrations
* monetizable apps

---

### Agencies

Need:

* reusable client projects
* white-label deployments
* multi-client support

---

### SaaS founders

Need:

* conversational onboarding
* recommendation systems
* lead generation
* booking experiences

---

### Internal enterprise teams

Need:

* internal assistants
* dashboards
* workflow apps
* secure forms

---

# 4. Product Goals

## Main Goals

```txt id="ls3y3w"
- Launch first app in <30 min
- Reusable modular widgets
- Minimal MCP knowledge required
- Production-grade architecture
- Commercially deployable
- Extensible by developers
```

---

## Secondary Goals

```txt id="pkicsp"
- Marketplace-ready components
- Multi-industry support
- White-label support
- Enterprise readiness
```

---

# 5. Product Architecture

## High-Level Structure

```txt id="evjv69"
Frontend Widgets
        ↓
Widget Bridge Layer
        ↓
MCP Server
        ↓
Business Logic
        ↓
Database / APIs / Integrations
```

---

# 6. Monorepo Structure

```txt id="5m0r1g"
conversokit-sdk/
├─ apps/
│  ├─ mcp-server/
│  └─ widget-ui/
│
├─ packages/
│  ├─ widgets/
│  ├─ integrations/
│  ├─ shared/
│  ├─ auth/
│  ├─ themes/
│  └─ templates/
│
├─ examples/
├─ docs/
└─ scripts/
```

---

# 7. Widget System

## Core Concept

Widgets are reusable conversational UI primitives.

Each widget contains:

```txt id="53s5is"
- UI component
- schema
- mock data
- config
- permissions
- events
- actions
```

---

# 8. Widget Categories

## Core Widgets

```txt id="df2yyl"
- Card
- List
- Carousel
- Grid
- Tabs
- Detail View
- Timeline
- Accordion
- Modal
- CTA Banner
```

---

## Commerce Widgets

```txt id="r4fyha"
- ProductCard
- ProductCarousel
- ProductComparison
- CheckoutSummary
- DiscountBanner
- RecommendationFeed
- AddToCartPanel
```

---

## Booking Widgets

```txt id="q6t8kx"
- AvailabilityCalendar
- BookingCard
- ReservationSummary
- DatePicker
- TimeSlotSelector
```

---

## Lead Generation Widgets

```txt id="t74wbm"
- LeadCaptureForm
- QualificationFlow
- MultiStepForm
- ContactRequest
- QuoteRequest
- WaitlistSignup
```

---

## Travel Widgets

```txt id="mjlwm4"
- HotelCard
- FlightSummary
- ItineraryTimeline
- DestinationRecommendations
```

---

## Dashboard Widgets

```txt id="zqfwec"
- KPIGrid
- AnalyticsPanel
- TrendChart
- AlertFeed
```

---

# 9. Widget Configuration Model

Each widget should support:

```ts id="m1jx7j"
type WidgetConfig = {
  permissions: {
    collectPersonalData?: boolean
    requiresConsent?: boolean
    supportsOAuth?: boolean
    allowsExternalLinks?: boolean
    allowsFileUpload?: boolean
  }

  appearance: {
    theme?: string
    density?: "compact" | "comfortable"
    style?: "modern" | "minimal" | "enterprise"
  }

  actions: {
    primaryCTA?: CTA
    secondaryCTA?: CTA
  }
}
```

---

# 10. Template System

## Goal

Allow developers to bootstrap industry-specific apps instantly.

---

## Example Templates

### Commerce Template

Includes:

```txt id="ecvjlwm"
- Product search tools
- Recommendation engine
- Product widgets
- Cart flow
- Checkout integration
```

---

### Booking Template

Includes:

```txt id="u1a1hj"
- Availability tools
- Booking widgets
- Reservation management
```

---

### SaaS Onboarding Template

Includes:

```txt id="v7f9m0"
- Qualification flow
- Lead capture
- CRM sync
```

---

# 11. MCP Tool Architecture

## Standard Tool Structure

Each tool must contain:

```txt id="xvjlwm"
- name
- description
- input schema
- output schema
- permissions
- auth requirements
- rate limits
```

---

## Example

```ts id="m0w70v"
export const searchProducts = {
  name: "search_products",

  description:
    "Search products based on filters and user intent.",

  inputSchema: SearchProductsSchema,

  outputSchema: ProductResultsSchema,

  permissions: {
    requiresAuth: false
  },

  async handler(input, context) {
    return service.search(input)
  }
}
```

---

# 12. Integrations Layer

## Core Integrations

```txt id="7r22c8"
- Stripe
- Shopify
- Supabase
- Airtable
- Notion
- HubSpot
- Salesforce
- Resend
- Zapier
- Webhooks
```

---

# 13. Authentication

## Support

```txt id="4zqizv"
- OAuth
- JWT
- Session auth
- API keys
- Anonymous sessions
```

---

## Providers

```txt id="g13l49"
- Google
- GitHub
- Microsoft
- Auth0
- Clerk
- Supabase Auth
```

---

# 14. Personal Data & Compliance

## Required Features

```txt id="4cgj0w"
- Consent banner
- Terms URL
- Privacy URL
- Data retention config
- GDPR helpers
- Export/delete user data
```

---

## Sensitive Data Rules

Boilerplate should discourage:

```txt id="zgo9aw"
- unnecessary medical data
- financial credentials
- government IDs
- hidden data collection
```

---

# 15. Themes System

## Themes

```txt id="3pffy7"
- Minimal
- Modern SaaS
- Enterprise
- Commerce
- Travel
- Dark
```

---

# 16. State Management

## State Layers

### UI State

```txt id="v5jl0u"
Temporary widget state
```

---

### Session State

```txt id="6yl5lt"
Conversation/session memory
```

---

### Persistent State

```txt id="n0hjlwm"
Database/business data
```

---

# 17. Developer Experience

## CLI

```bash id="m4by0h"
npx conversokit create my-app
```

---

## Commands

```bash id="e3d9fi"
conversokit add widget product-carousel
conversokit add integration stripe
conversokit add template commerce
```

---

# 18. Example Apps

Include production-like examples:

```txt id="m8zt6y"
- AI travel planner
- Ecommerce assistant
- Booking assistant
- CRM assistant
- SaaS onboarding flow
```

---

# 19. Documentation

## Must Include

```txt id="ep8nfi"
- setup guide
- deployment guide
- app review checklist
- widget authoring
- MCP basics
- integrations guide
- compliance guide
```

---

# 20. Deployment Targets

## Supported

```txt id="xjlwm1"
- Vercel
- Fly.io
- Railway
- Render
- Docker
```

---

# 21. Licensing Model

## Options

### Free

```txt id="jlwmq2"
Core SDK
```

---

### Pro

```txt id="jlwmq3"
Premium widgets
Templates
Integrations
```

---

### Agency

```txt id="jlwmq4"
Unlimited commercial usage
White-label rights
```

---

# 22. Future Roadmap

## Phase 1

```txt id="jlwmq5"
Core SDK
Basic widgets
Commerce template
```

---

## Phase 2

```txt id="jlwmq6"
CLI
Marketplace
Premium widget packs
```

---

## Phase 3

```txt id="jlwmq7"
Visual builder
Drag-and-drop flows
Hosted platform
```

---

# 23. Biggest Strategic Differentiator

Not just:

```txt id="jlwmq8"
“UI components”
```

But:

```txt id="jlwmq9"
Conversational business workflows
inside ChatGPT
```

That is the real moat.

---

# 24. Recommended MVP

Build first:

```txt id="jlwmqa"
- MCP server starter
- 10 widgets
- 2 templates
- Stripe integration
- Lead forms
- Product carousel
- Booking flow
- CLI
```

Avoid overbuilding initially.

---

# 25. Long-Term Vision

Potential evolution:

```txt id="jlwmqb"
ChatGPT App marketplace infrastructure
```

Where developers can:

* install widget packs
* share templates
* sell integrations
* deploy conversational apps quickly

Essentially:

```txt id="jlwmqc"
“WordPress + Shopify for ChatGPT Apps”
```
