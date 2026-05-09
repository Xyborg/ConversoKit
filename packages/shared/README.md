# @conversokit/shared

Shared Zod schemas, TypeScript types, and example fixtures consumed by every other ConversoKit package.

Part of [ConversoKit](https://github.com/Xyborg/ConversoKit) — a boilerplate for building ChatGPT Apps (Apps SDK / MCP) in <30 minutes.

## Install

```bash
pnpm add @conversokit/shared
# or
npm install @conversokit/shared
```

## Usage

```ts
import { defineTool, WidgetConfig } from '@conversokit/shared';
import { z } from 'zod';

export const searchProducts = defineTool({
  name: 'search_products',
  description: 'Search the catalog',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ products: z.array(z.any()) }),
  permissions: { requiresAuth: false, requiresConsent: false },
  handler: async ({ input }) => ({ products: [] }),
});
```

## Documentation

Full docs and runnable examples live in the [main repo](https://github.com/Xyborg/ConversoKit#readme).

## License

Apache-2.0 © Martín Aberastegue
