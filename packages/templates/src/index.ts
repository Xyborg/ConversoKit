/**
 * Templates for bootstrapping complete ChatGPT Apps.
 *
 * A template bundles together tools, widgets, example flows and configuration
 * needed to build a specific type of app (e.g. e‑commerce, booking, travel).
 * Developers can import a template and use its exported values to configure
 * their MCP server and widget UI with minimal effort.
 */

// We deliberately avoid importing implementation code from the mcp-server here
// because templates should remain decoupled from specific app packages.
// Instead, templates refer to tools and widgets by name.  The application
// generator can map these names to concrete implementations at runtime.

import { EXAMPLE_PRODUCTS } from '@conversokit/shared';

// Type describing a template.  More fields can be added as the SDK evolves.
export interface AppTemplate {
  name: string;
  description: string;
  tools: any[];
  widgets: any[];
  exampleData: any;
}

/**
 * A basic commerce template.  This template wires up the `search_products`
 * tool, a product carousel widget and some example data.  Use it to
 * scaffold an assistant that helps users discover and browse products.
 */
export function createCommerceTemplate(): AppTemplate {
  return {
    name: 'commerce',
    description: 'Template for building a simple e‑commerce assistant',
    // Tools are referenced by name; the MCP server must implement a tool
    // called `search_products` with a compatible schema.
    tools: ['search_products'],
    // Widgets are referenced by name; the widget UI must register a
    // component called `ProductCarousel`.
    widgets: ['ProductCarousel'],
    exampleData: {
      products: EXAMPLE_PRODUCTS
    }
  };
}

// Future templates can be added here, e.g. createBookingTemplate(),
// createLeadGenTemplate(), createTravelTemplate(), etc.