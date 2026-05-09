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
  const [stage, setStage] = useState<'browse' | 'checkout'>('browse');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bridge
      .callTool('search_products', { query: '' })
      .then((r) => setItems((r as { items: ProductCardProps[] }).items))
      .catch((e) => setError(String(e)));
  }, [bridge]);

  const checkout = async () => {
    setError(null);
    try {
      await bridge.callTool('set_cart', {
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity }))
      });
      const r = (await bridge.callTool('create_checkout', {
        successUrl: window.location.origin + '/?status=success',
        cancelUrl: window.location.origin + '/?status=cancelled'
      })) as { url: string; provider: string };
      window.location.href = r.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ck-spacing-4)' }}>
      <h1 style={{ margin: 0 }}>Bean &amp; Brew</h1>
      <p style={{ color: 'var(--ck-muted)', margin: 0 }}>
        A 6-item coffee catalog wired to ConversoKit's commerce template.
      </p>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      {stage === 'browse' && (
        <>
          <ProductCarousel items={items} />
          {items[0] && (
            <AddToCartPanel
              product={items[0]}
              onAdd={(item) => {
                setCart((c) => [...c, item]);
                setStage('checkout');
              }}
            />
          )}
        </>
      )}
      {stage === 'checkout' && (
        <CheckoutSummary
          summary={{
            currency: 'USD',
            items: cart,
            subtotal: cart.reduce((s) => s + 0, 0).toString(),
            total: cart.reduce((s) => s + 0, 0).toString()
          }}
          onBack={() => setStage('browse')}
          onCheckout={checkout}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <BridgeProvider baseUrl="http://localhost:3000">
    <ThemeProvider
      theme={commerceTheme}
      style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
    >
      <ConsentBanner scopes={['analytics']}>
        <Catalog />
      </ConsentBanner>
    </ThemeProvider>
  </BridgeProvider>
);

export default App;
