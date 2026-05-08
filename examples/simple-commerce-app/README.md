# Simple Commerce App Example

This example demonstrates how to build a minimal e‑commerce assistant using the ConversoKit SDK.  It leverages the `search_products` tool defined in the MCP server and the `ProductCarousel` widget from the widgets package.

## Structure

```
examples/simple-commerce-app/
├─ mcp-server/   # Custom MCP server configuration
└─ widget-ui/    # Custom widget UI configuration
```

In this example the MCP server simply re‑exports the base implementation provided by the monorepo and adds no additional tools.  The widget UI imports the `ProductCarousel` component and uses it to render products returned from the server.

## Running the example

Make sure you have installed dependencies at the root of the monorepo:

```bash
pnpm install
```

Then run the server and the UI:

```bash
pnpm --filter mcp-server dev
pnpm --filter widget-ui dev
```

Open `http://localhost:5173` in your browser to see the app in action.

## Customising

To customise this example for your own products:

1. Update the `EXAMPLE_PRODUCTS` constant in `packages/shared/src/index.ts` with your own product data.
2. Add additional tools to `apps/mcp-server/src/tools` to support features like product recommendations, cart management or checkout creation.
3. Replace the `callTool` function in `apps/widget-ui/src/App.tsx` with the official Apps SDK bridge when running inside ChatGPT.