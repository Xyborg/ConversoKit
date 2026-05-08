// Re‑export all available tool definitions from this directory.
// When you add new tools, import and append them to the `tools` array below.

import { searchProductsTool } from './searchProducts.js';

export const tools = [searchProductsTool];