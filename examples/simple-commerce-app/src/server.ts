import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import {
  defineTool,
  productSchema,
  type CartItem,
  type Product,
  type Tool
} from '@conversokit/shared';
import {
  createStripeProvider,
  MockPaymentProvider,
  type PaymentProvider
} from '@conversokit/integrations';

// 6-item coffee catalog. Replace with your own data source / DB query.
const CATALOG: Product[] = [
  {
    id: 'beans-ethiopia',
    title: 'Ethiopia Yirgacheffe',
    subtitle: 'Floral, lemon, jasmine · 250g whole bean',
    price: '$18.00',
    imageUrl: 'https://example.com/coffee/yirgacheffe.jpg'
  },
  {
    id: 'beans-colombia',
    title: 'Colombia Huila',
    subtitle: 'Cocoa, red apple, brown sugar · 250g whole bean',
    price: '$16.00',
    imageUrl: 'https://example.com/coffee/huila.jpg'
  },
  {
    id: 'beans-kenya',
    title: 'Kenya AA Nyeri',
    subtitle: 'Black currant, grapefruit, syrupy · 250g whole bean',
    price: '$22.00',
    imageUrl: 'https://example.com/coffee/nyeri.jpg'
  },
  {
    id: 'gear-aeropress',
    title: 'AeroPress Original',
    subtitle: 'Single-cup immersion brewer',
    price: '$40.00',
    imageUrl: 'https://example.com/gear/aeropress.jpg'
  },
  {
    id: 'gear-grinder',
    title: 'Hand grinder · steel burrs',
    subtitle: 'Adjustable, 30g hopper',
    price: '$95.00',
    imageUrl: 'https://example.com/gear/grinder.jpg'
  },
  {
    id: 'subscription-monthly',
    title: 'Monthly subscription',
    subtitle: '500g of fresh beans, free shipping',
    price: '$32.00',
    imageUrl: 'https://example.com/subscription.jpg'
  }
];

const PRICE_CENTS: Record<string, number> = {
  'beans-ethiopia': 1800,
  'beans-colombia': 1600,
  'beans-kenya': 2200,
  'gear-aeropress': 4000,
  'gear-grinder': 9500,
  'subscription-monthly': 3200
};

// In-memory cart per session — fine for the example. Use Supabase stores
// from @conversokit/integrations in production.
const carts = new Map<string, CartItem[]>();

const stripe = createStripeProvider(process.env);
const payments: PaymentProvider = stripe ?? new MockPaymentProvider();

const searchProducts = defineTool({
  name: 'search_products',
  description: 'Free-text search over the Bean & Brew catalog.',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(50).optional()
  }),
  outputSchema: z.object({ items: z.array(productSchema) }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const lower = input.query.toLowerCase();
    const matches = lower
      ? CATALOG.filter(
          (p) =>
            p.title.toLowerCase().includes(lower) ||
            (p.subtitle?.toLowerCase().includes(lower) ?? false)
        )
      : CATALOG;
    return { items: matches.slice(0, input.limit ?? 10) };
  }
});

const setCart = defineTool({
  name: 'set_cart',
  description: 'Persist the cart for the current session.',
  inputSchema: z.object({
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1)
      })
    )
  }),
  outputSchema: z.object({ ok: z.boolean() }),
  permissions: { requiresAuth: false },
  async handler(input, ctx) {
    carts.set(ctx.sessionId, input.items);
    return { ok: true };
  }
});

const createCheckout = defineTool({
  name: 'create_checkout',
  description: 'Start a Stripe (or mock) checkout session for the current cart.',
  inputSchema: z.object({
    successUrl: z.string().url(),
    cancelUrl: z.string().url()
  }),
  outputSchema: z.object({
    url: z.string().url(),
    provider: z.string()
  }),
  permissions: { requiresAuth: false },
  async handler(input, ctx) {
    const items = carts.get(ctx.sessionId) ?? [];
    const session = await payments.createCheckoutSession({
      items: items.map((i) => ({ id: i.productId, quantity: i.quantity })),
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl
    });
    return { url: session.url, provider: payments.id };
  }
});

const tools: Tool[] = [searchProducts, setCart, createCheckout];

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/tools', (_req, res) => {
  res.json({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      permissions: t.permissions
    }))
  });
});

app.post('/tools/:name', async (req, res) => {
  const tool = tools.find((t) => t.name === req.params.name);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  try {
    const input = tool.inputSchema.parse(req.body);
    const sessionId = req.header('x-conversokit-session') ?? 'demo-session';
    const output = await tool.handler(input, { sessionId, logger: console });
    res.json(output);
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Tool execution failed'
    });
  }
});

// Optional: expose a static price lookup for the Stripe priceLookup callback.
// In production, Stripe price IDs come from your dashboard, not env.
export { PRICE_CENTS };

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bean & Brew MCP server listening on :${PORT} (payments: ${payments.id})`);
});
