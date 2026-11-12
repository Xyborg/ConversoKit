import React, { useEffect, useState } from 'react';
import {
  AddToCartPanel,
  CTABanner,
  CheckoutSummary,
  ConsentBanner,
  ProductCarousel,
  type ProductCardProps
} from '@conversokit/widgets';
import { type CartItem } from '@conversokit/shared';
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

  const subtotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(
    cart.reduce(
      (sum, item) =>
        sum + Number((item.price ?? '0').replace(/[^0-9.]/g, '')) * item.quantity,
      0
    )
  );
  const checkout = async () => {
    await bridge.callTool('set_cart', { items: cart, currency: 'USD' });
    const result = (await bridge.callTool('create_checkout', {
      successUrl:
        (import.meta.env.VITE_PUBLIC_APP_URL || 'http://localhost:5173') +
        '/?status=success',
      cancelUrl:
        (import.meta.env.VITE_PUBLIC_APP_URL || 'http://localhost:5173') +
        '/?status=cancelled'
    })) as { url: string };
    await bridge.openLink(result.url);
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
          summary={{ items: cart, subtotal, total: subtotal, currency: 'USD' }}
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
      <h1>Welcome to {'<% projectName %>'}</h1>
      <CTABanner
        title="Commerce demo"
        description="Search → add to cart → checkout via Stripe (or MockPaymentProvider in dev)."
      />
      <ConsentBanner scopes={['personalData']}>
        <Catalog />
      </ConsentBanner>
    </ThemeProvider>
  </BridgeProvider>
);

export default App;
