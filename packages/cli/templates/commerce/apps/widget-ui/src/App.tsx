import React, { useEffect, useState } from 'react';
import {
  AddToCartPanel,
  CTABanner,
  CheckoutSummary,
  ConsentBanner,
  ProductCarousel,
  type ProductCardProps
} from '@conversokit/widgets';
import {
  EXAMPLE_CHECKOUT_SUMMARY,
  type CartItem
} from '@conversokit/shared';
import { ThemeProvider, commerceTheme } from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

const Catalog: React.FC = () => {
  const bridge = useBridge();
  const [items, setItems] = useState<ProductCardProps[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    bridge
      .callTool('search_products', { query: '', limit: 10 })
      .then((r) => setItems((r as { items: ProductCardProps[] }).items))
      .catch(console.error);
  }, [bridge]);

  const checkout = async () => {
    await bridge.callTool('set_cart', { items: cart, currency: 'USD' });
    const result = (await bridge.callTool('create_checkout', {
      successUrl: window.location.origin + '/?status=success',
      cancelUrl: window.location.origin + '/?status=cancelled'
    })) as { url: string };
    window.location.href = result.url;
  };

  return (
    <>
      <ProductCarousel items={items} />
      {items[0] && (
        <AddToCartPanel
          product={items[0]}
          onAdd={(item) => setCart((c) => [...c, item])}
        />
      )}
      {cart.length > 0 && (
        <CheckoutSummary
          summary={{ ...EXAMPLE_CHECKOUT_SUMMARY, items: cart }}
          onCheckout={checkout}
        />
      )}
    </>
  );
};

const App: React.FC = () => (
  <BridgeProvider baseUrl="http://localhost:3000">
    <ThemeProvider
      theme={commerceTheme}
      style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
    >
      <h1>Welcome to <% projectName %></h1>
      <CTABanner
        title="Commerce demo"
        description="Search → add to cart → checkout via Stripe (or MockPaymentProvider in dev)."
      />
      <ConsentBanner scopes={['analytics']}>
        <Catalog />
      </ConsentBanner>
    </ThemeProvider>
  </BridgeProvider>
);

export default App;
