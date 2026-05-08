import { EXAMPLE_PRODUCTS, EXAMPLE_CHECKOUT_SUMMARY } from '@conversokit/shared';
import type { AppTemplate } from './types.js';

export function createCommerceTemplate(): AppTemplate {
  return {
    name: 'commerce',
    description:
      'E-commerce assistant: search products, add to cart, redirect to Stripe Checkout.',
    tools: ['search_products', 'get_cart', 'set_cart', 'create_checkout'],
    widgets: [
      'ProductCarousel',
      'ProductCard',
      'AddToCartPanel',
      'CheckoutSummary',
      'CTABanner',
      'ConsentBanner'
    ],
    integrations: ['stripe'],
    auth: { default: 'anonymous' },
    compliance: {
      requiresConsent: true,
      consentScopes: ['analytics']
    },
    exampleData: {
      products: EXAMPLE_PRODUCTS,
      checkoutSummary: EXAMPLE_CHECKOUT_SUMMARY
    }
  };
}
