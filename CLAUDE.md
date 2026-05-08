# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository orientation

This repo **is** ConversoKit — a boilerplate for building **ChatGPT Apps** (Apps SDK / MCP). The product vision is documented in `ChatGPT App Boilerplate Platform - PRD.md` at the repo root — read it before making architectural decisions, since most subdirectories are stubs that must grow toward the PRD's structure (widget categories, integrations, auth providers, themes, templates, CLI).

The PRD's north star: a developer launches their first ChatGPT App in <30 minutes by composing prebuilt widgets + MCP tools + a template. Treat that goal as the design constraint when adding features — favor reusability, declarative configuration, and minimal MCP knowledge required from end users.

## Common commands

The repo uses **pnpm workspaces** (defined in `pnpm-workspace.yaml`) orchestrated by **Turborepo** (`turbo.json`). Node ≥18, pnpm ≥8.

```bash
pnpm install                          # install all workspace deps
pnpm dev                              # turbo run dev (parallel, persistent)
pnpm build                            # turbo run build (respects ^build deps)
pnpm typecheck                        # turbo run typecheck
pnpm --filter mcp-server dev          # MCP server on :3000 (ts-node-dev)
pnpm --filter widget-ui dev           # Widget UI on :5173 (vite)
pnpm --filter @conversokit/widgets dev  # watch-build a single package
```

`pnpm lint` and `pnpm test` are wired in `turbo.json` but **no package defines lint/test scripts yet** — they are placeholders. There is no test runner configured. If asked to run tests, surface this and propose one (vitest fits Vite + TS workspace).

## Architecture

### Two-app + shared-package model

```
apps/mcp-server   →  Express server, exposes tools to ChatGPT (port 3000)
apps/widget-ui    →  React + Vite UI rendered inside ChatGPT (port 5173)
packages/*        →  Shared building blocks consumed by both apps
```

Data flow (per PRD §5): `Frontend Widgets → Widget Bridge → MCP Server → Business Logic → DB/APIs/Integrations`. The widget UI currently calls the MCP server with plain `fetch` (`apps/widget-ui/src/App.tsx`) as a placeholder for the production `window.openai` Apps SDK bridge — preserve this seam when extending.

### Package responsibilities

- **`packages/shared`** — Zod schemas + TS types both apps consume (`Product`, `EXAMPLE_PRODUCTS`). **Single source of truth for cross-package types.** Note: `apps/mcp-server/src/tools/searchProducts.ts` currently re-declares `productSchema` locally — when adding new tools that share types with widgets, import from `@conversokit/shared` instead of duplicating.
- **`packages/widgets`** — React components (`ProductCard`, `ProductCarousel`). Currently inline-styled; the PRD expects them to consume `packages/themes` tokens. Export every public component from `src/index.ts`.
- **`packages/themes`** — Theme tokens (`lightTheme`, `darkTheme`). Not yet wired into widgets.
- **`packages/auth`** — `createAuthMiddleware` (Express). Not yet mounted in `apps/mcp-server/src/index.ts`. PRD §13 specifies OAuth/JWT/session/API-key/anonymous modes with Google/GitHub/Microsoft/Auth0/Clerk/Supabase providers — extend here, not inline in the server.
- **`packages/integrations`** — Provider abstractions (`PaymentProvider`, `MockPaymentProvider`). PRD §12 lists target integrations (Stripe, Shopify, Supabase, Airtable, Notion, HubSpot, Salesforce, Resend, Zapier, Webhooks). Each integration goes in its own file behind a small interface so it can be mocked/swapped.
- **`packages/templates`** — `AppTemplate` factories (`createCommerceTemplate`). Templates intentionally **reference tools/widgets by string name**, not by import — this keeps templates decoupled. A future scaffolder will resolve those names to concrete implementations.

### How widgets reach packages

`apps/widget-ui/tsconfig.json` aliases `@conversokit/*` → `../../packages/*/src` so dev-mode imports skip the build step. `apps/widget-ui/package.json` also lists `@conversokit/widgets` as a workspace dep. When adding a new package consumed by widget-ui, update **both** the tsconfig path and the package.json dep.

### MCP tool pattern (canonical)

A tool = `{ name, description, inputSchema (zod), outputSchema (zod), async handler(input) }`. See `apps/mcp-server/src/tools/searchProducts.ts`. To add one:

1. Create `apps/mcp-server/src/tools/<toolName>.ts` exporting the tool object.
2. Import and append to the `tools` array in `apps/mcp-server/src/tools/index.ts`.
3. The `/tools` and `/tools/:name` endpoints in `src/index.ts` pick it up automatically.

`inputSchema.parse()` runs in the POST handler — schema errors surface as 400s. PRD §11 prescribes this exact tool shape; keep it.

### TypeScript / module conventions

All packages are `"type": "module"` ESM. **Imports of local `.ts` files use `.js` extensions** (e.g. `import { tools } from './tools/index.js'`) because of ES module resolution under `tsc`. Match this when adding files.

Each package builds with its own `tsc --project tsconfig.json` to a `dist/` folder; `main`/`types` point at `dist/`. The widget-ui consumes packages directly from `src/` via path aliases, so you usually don't need to rebuild dependencies during UI dev.

## Working in this repo

- **The PRD is the spec.** When adding a widget, integration, auth provider, theme, or template, check whether the PRD already names it (§7–§16) and use that exact name — the CLI scaffolder (`conversokit add widget …`, PRD §17) will key off these names.
- **Templates reference by name.** When a template lists `tools: ['search_products']`, the MCP server must implement a tool with that exact name. Don't hardcode imports across the template/server boundary.
- **Compliance matters (PRD §14).** Any new widget that touches personal data needs a `permissions` block in its config (`collectPersonalData`, `requiresConsent`, etc., per PRD §9 `WidgetConfig`). Don't silently collect PII in widget code.
- **Examples are runnable.** `examples/simple-commerce-app/` is currently README-only; treat new examples as production-grade demos (PRD §18 lists the target apps).
- **Open-core licensing.** The repo is Apache 2.0. Premium features (visual builder, premium widgets, hosted cloud) are intended to live in a separate closed-source project, not here.
