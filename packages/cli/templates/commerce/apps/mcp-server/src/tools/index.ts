import { getCartTool } from './getCart.js';
import { setCartTool } from './setCart.js';
import { createCheckoutTool } from './createCheckout.js';
import { z } from 'zod';
import { defineTool } from '@conversokit/shared';
import type { Tool } from '@conversokit/shared';
import { searchProductsTool } from './searchProducts.js';

// Generated commerce template. Wire your additional tools here.
export const tools: Tool[] = [
  searchProductsTool,
  getCartTool,
  setCartTool,
  createCheckoutTool
];

// Rendering does not perform a business mutation. Widgets call the data tools through MCP.
tools.push(
  defineTool({
    name: 'show_app',
    description: 'Open the interactive app to browse data and perform actions.',
    inputSchema: z.object({}),
    outputSchema: z.object({ ready: z.boolean() }),
    permissions: {},
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    widget: 'ui://conversokit/app-v1.html',
    async handler() {
      return { ready: true };
    }
  })
);
