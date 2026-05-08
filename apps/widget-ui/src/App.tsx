import React, { useEffect, useState } from 'react';
import {
  ConsentBanner,
  ProductCarousel,
  type ProductCardProps
} from '@conversokit/widgets';
import {
  ThemeProvider,
  themes,
  type Theme
} from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

const themeNames = Object.keys(themes);

const Catalog: React.FC = () => {
  const bridge = useBridge();
  const [items, setItems] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = (await bridge.callTool('search_products', {
          query: '',
          limit: 10
        })) as { items: ProductCardProps[] };
        if (!cancelled) setItems(result.items);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = (await bridge.callTool('search_products', {
        query,
        limit: 10
      })) as { items: ProductCardProps[] };
      setItems(result.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSearch}
        style={{ marginBottom: 'var(--ck-spacing-4)' }}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            padding: '8px 10px',
            width: 240,
            marginRight: 'var(--ck-spacing-2)',
            borderRadius: 'var(--ck-radius-sm)',
            border: '1px solid var(--ck-border)',
            backgroundColor: 'var(--ck-surface)',
            color: 'var(--ck-text)'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--ck-radius-sm)',
            border: 'none',
            backgroundColor: 'var(--ck-primary)',
            color: 'var(--ck-primary-foreground)',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </form>
      {loading ? (
        <p style={{ color: 'var(--ck-muted)' }}>Loading products…</p>
      ) : (
        <ProductCarousel items={items} />
      )}
    </>
  );
};

const App: React.FC = () => {
  const [themeName, setThemeName] = useState<string>('light');
  const theme: Theme = themes[themeName];
  const apiKey = (import.meta.env?.VITE_CONVERSOKIT_API_KEY as string) || undefined;

  return (
    <BridgeProvider baseUrl="http://localhost:3000" apiKey={apiKey}>
      <ThemeProvider
        theme={theme}
        style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--ck-spacing-4)',
            gap: 'var(--ck-spacing-4)',
            flexWrap: 'wrap'
          }}
        >
          <h1 style={{ margin: 0 }}>ConversoKit Widget Demo</h1>
          <label
            style={{ fontSize: 'var(--ck-font-size-sm)', color: 'var(--ck-muted)' }}
          >
            Theme:{' '}
            <select
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              style={{
                padding: '6px 8px',
                borderRadius: 'var(--ck-radius-sm)',
                border: '1px solid var(--ck-border)',
                backgroundColor: 'var(--ck-surface)',
                color: 'var(--ck-text)'
              }}
            >
              {themeNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </header>

        <ConsentBanner
          scopes={['analytics']}
          message="ConversoKit demo. Click accept to enable analytics consent and unlock consent-gated tools."
        >
          <Catalog />
        </ConsentBanner>
      </ThemeProvider>
    </BridgeProvider>
  );
};

export default App;
