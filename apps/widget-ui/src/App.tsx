import React, { useEffect, useState } from 'react';
import {
  ProductCarousel,
  type ProductCardProps
} from '@conversokit/widgets';
import {
  ThemeProvider,
  themes,
  type Theme
} from '@conversokit/themes';

async function callTool<TInput extends object, TOutput>(
  name: string,
  input: TInput
): Promise<TOutput> {
  const response = await fetch(`http://localhost:3000/tools/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error(`Tool call failed with status ${response.status}`);
  }
  return (await response.json()) as TOutput;
}

const themeNames = Object.keys(themes);

const App: React.FC = () => {
  const [items, setItems] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [themeName, setThemeName] = useState<string>('light');
  const theme: Theme = themes[themeName];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const result = await callTool<
          { query: string; limit: number },
          { items: ProductCardProps[] }
        >('search_products', { query: '', limit: 10 });
        setItems(result.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await callTool<
        { query: string; limit: number },
        { items: ProductCardProps[] }
      >('search_products', { query, limit: 10 });
      setItems(result.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
    </ThemeProvider>
  );
};

export default App;
