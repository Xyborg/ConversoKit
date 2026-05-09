# Deployment

ConversoKit is two deployable artifacts:

- **MCP server** (`apps/mcp-server`) — Express, Node ≥18.
- **Widget UI** (`apps/widget-ui`) — static Vite output.

The widget UI talks to the MCP server via HTTPS (or `window.openai` inside ChatGPT). Deploy them together or separately.

## Docker (works anywhere)

Multistage Dockerfiles ship in each app:

```bash
docker build -f apps/mcp-server/Dockerfile -t conversokit-mcp .
docker build -f apps/widget-ui/Dockerfile -t conversokit-ui .
docker run -p 3000:3000 --env-file .env conversokit-mcp
```

Or use the root `docker-compose.yml`:

```bash
docker compose up --build
# UI on :8080, MCP on :3000
```

## Vercel (serverless MCP + static UI)

`apps/mcp-server/vercel.json` configures `@vercel/node` for the Express handler. Run from each app:

```bash
cd apps/mcp-server && vercel --prod
cd apps/widget-ui  && vercel --prod
```

Set environment variables in the Vercel dashboard (`STRIPE_SECRET_KEY`, etc.).

## Fly.io

```bash
cd apps/mcp-server
fly launch --copy-config --no-deploy   # uses fly.toml
fly secrets set STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_...
fly deploy
```

## Railway

```bash
railway init
railway up
# config in apps/mcp-server/railway.json
```

## Render

`apps/mcp-server/render.yaml` is a Render Blueprint:

```bash
# Connect your repo to Render and pick "Blueprint" — it picks up render.yaml.
```

## Production reminders

- **Persistent stores.** The default `InMemory*` stores in `apps/mcp-server/src/store/` lose data on restart. Swap them for a DB-backed implementation before going live (see [`integrations.md`](./integrations.md)).
- **CORS.** `cors()` defaults to `*`. In production, restrict to your widget UI origin.
- **`COOKIE_SECRET`.** Set it. The dev fallback is intentionally weak.
- **Stripe webhooks.** Configure the live webhook URL in your Stripe dashboard and store the corresponding `STRIPE_WEBHOOK_SECRET`.
- **Rate limits.** Add `express-rate-limit` (or platform-level) on `/tools/:name` so a misbehaving caller can't burn through paid integrations.
- **Health checks.** Add `GET /health` returning 200 if you hit the MCP server.
