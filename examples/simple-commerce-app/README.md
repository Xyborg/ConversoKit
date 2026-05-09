# Simple commerce app — Bean & Brew

A runnable ConversoKit example: a 6-item coffee catalog wired to the **commerce template**'s widgets and tools. Defaults to `MockPaymentProvider`; flip a single env var to use real Stripe Checkout.

```bash
pnpm --filter example-simple-commerce-app dev
# MCP server on :3000, widget UI on :5173
```

## What this demonstrates

- Custom `Product[]` catalog instead of `EXAMPLE_PRODUCTS` from `@conversokit/shared`
- `search_products` + `set_cart` + `create_checkout` tools using `defineTool`
- `ProductCarousel`, `AddToCartPanel`, `CheckoutSummary`, `CTABanner`, `ConsentBanner` widgets
- `commerceTheme` from `@conversokit/themes`
- The fallback pattern: `createStripeProvider(env) ?? new MockPaymentProvider()`

## Switch to real Stripe

```bash
cp .env.example .env
# Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
pnpm --filter example-simple-commerce-app dev
```

The server logs `payments: stripe` instead of `payments: mock` when env is set.

## File map

```
examples/simple-commerce-app/
├── src/
│   ├── server.ts    # Express MCP server (3 tools)
│   ├── App.tsx      # Catalog + checkout UI
│   └── main.tsx     # React entry
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```
