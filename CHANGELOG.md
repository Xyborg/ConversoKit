# Changelog

All notable changes to ConversoKit will be documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — Unreleased

The first publishable release. Everything below ships across the eight publishable packages: `@conversokit/{shared,themes,widgets,bridge,auth,integrations,templates}` and the `conversokit` CLI.

### Added

#### Widgets (19)
- Commerce: `ProductCard`, `ProductCarousel`, `AddToCartPanel`, `CheckoutSummary`
- Booking: `AvailabilityCalendar`, `TimeSlotSelector`, `BookingCard`
- Lead-gen: `LeadCaptureForm`, `MultiStepForm`, `CTABanner`
- Compliance: `ConsentBanner`
- Travel: `HotelCard`, `FlightSummary`, `ItineraryTimeline`, `DestinationRecommendations`
- Dashboard: `KPIGrid`, `TrendChart`, `AnalyticsPanel`, `AlertFeed`
- All themed via `--ck-*` CSS variables; no inline color literals.

#### MCP tools (16)
- Commerce: `search_products`, `get_cart`, `set_cart`, `create_checkout`
- Booking: `get_availability`, `create_reservation`, `cancel_reservation`
- Lead-gen: `submit_lead`
- Travel: `search_hotels`, `search_flights`, `get_itinerary`, `list_destinations`
- Dashboard: `get_kpis`, `get_trend_series`, `get_analytics_panel`, `get_alerts`

#### Templates (5)
`commerce`, `booking`, `saas-onboarding`, `travel`, `dashboard`. Each is an `AppTemplate` declaring its tools, widgets, integrations, auth defaults, and consent scopes.

#### Themes (7)
`light`, `dark`, `minimal`, `modern-saas`, `enterprise`, `commerce`, `travel`.

#### Integrations
- **Payments**: `StripeProvider` (Checkout sessions, signed webhooks, idempotency keys) + `MockPaymentProvider`.
- **CRM**: `HubspotProvider` (CRM v3 create-or-PATCH on email conflict) + `MockCrmProvider`.
- **Email**: `ResendEmailProvider`, `CloudflareEmailProvider` (beta) + `MockEmailProvider`.
- **Persistent stores**: `SupabaseCartStore` / `OrderStore` / `ReservationStore` / `LeadStore` / `UserDataStore` with `SUPABASE_SCHEMA_SQL` for one-shot setup, plus `InMemory*` defaults.

#### Auth (`@conversokit/auth`)
- API key (`apiKeyProvider`)
- Anonymous session (`anonymousSessionProvider`)
- JWT verify via `jose`: `bearerJwtProvider` (HS256 + JWKS), `clerkAuthProvider` (Clerk JWKS, derives frontend API from publishable key), `supabaseAuthProvider` (HS256 against `SUPABASE_JWT_SECRET`)
- OAuth flow: `GoogleOAuthProvider`, `GitHubOAuthProvider`, `MicrosoftOAuthProvider`, `Auth0Provider`
- `createAuthMiddleware` chains providers and short-circuits on first success.

#### MCP server (`apps/mcp-server`)
- Express + Zod tool dispatcher at `/tools` and `/tools/:name`
- `/auth/:provider/login|callback`, `/auth/me`, `/auth/logout` (signed-cookie sessions)
- `/userdata/export`, `/userdata` DELETE (GDPR)
- `/admin/*` (dev-only)
- `/webhooks/stripe` (raw body verified before `express.json()`)
- `GET /health` (unauthenticated, for platform probes)
- Module exports the `app` (Vercel adapter compatible) and skips `listen()` under `VERCEL=1`.

#### CLI (`conversokit`)
- `conversokit create <name> --template <name>` — scaffolds an app from any of the 5 templates.
- `conversokit add widget|integration|template <name>` — adds a widget skeleton, patches `.env.example` for known integrations (`stripe`, `hubspot`, `supabase`, `resend`, `cloudflare`), or applies a template overlay.
- `conversokit deploy <vercel|docker|railway>` — writes platform deployment configs into the project (vercel.json + api/mcp.ts adapter; multi-stage Dockerfile + docker-compose.yml + .dockerignore; railway.json + Procfile).

#### Compliance (PRD §14)
- `ConsentRecord` schema, `consentMiddleware`, `requireConsent` per-tool gate
- `ConsentBanner` widget
- GDPR endpoints (`/userdata/export`, `/userdata` DELETE)

#### Examples
Five runnable examples under `examples/` demonstrating each template end-to-end.

#### Documentation
- `docs/setup.md`, `docs/mcp-basics.md`, `docs/widget-authoring.md`, `docs/integrations.md`, `docs/compliance.md`, `docs/deployment.md`, `docs/app-review-checklist.md`
- `CLAUDE.md` for AI-assisted contributors
- `CONTRIBUTING.md`

### Notes

- Repo is Apache 2.0. Premium / hosted features are in a separate closed-source project.
- This entry covers Phases 0 through 7.7. See git history (`git log --oneline`) for per-phase commits.

[0.1.0]: https://github.com/Xyborg/ConversoKit/releases/tag/v0.1.0
