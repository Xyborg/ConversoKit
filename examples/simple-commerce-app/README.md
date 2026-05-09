# Simple commerce app

Minimal e-commerce assistant: search → add to cart → Stripe Checkout.

## Generate it

```bash
npx conversokit create my-shop --template commerce
cd my-shop
pnpm install
pnpm dev
```

## What ships

| Layer | Surface |
| --- | --- |
| MCP tools | `search_products` (use the `set_cart` / `create_checkout` tools from the main repo when you need real checkout) |
| Widgets | `ProductCarousel`, `AddToCartPanel`, `CheckoutSummary`, `CTABanner`, `ConsentBanner` |
| Theme | `commerceTheme` |
| Integrations | `StripeProvider` (falls back to `MockPaymentProvider` if `STRIPE_SECRET_KEY` is unset) |

## Customise

1. Replace `EXAMPLE_PRODUCTS` in `@conversokit/shared` with a real product source — or override the tool to hit your DB.
2. Add a `priceLookup` callback when constructing `StripeProvider` so cart items resolve to real Stripe prices.
3. Wire a persistent `OrderStore` (Supabase, Postgres) in `apps/mcp-server/src/store/orders.ts` before going live.
