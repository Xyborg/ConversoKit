import React, { useEffect, useState } from 'react';
import { ProductCarousel, ProductCardProps } from '@conversokit/widgets';

/**
 * Simple bridge function that calls the MCP server's tools API.  In a
 * production application you would use the official OpenAI Apps SDK bridge
 * (window.openai) instead of direct fetch calls.  For the purposes of this
 * example we perform a POST request to the local server defined in
 * `apps/mcp-server`.
 */
async function callTool<TInput extends object, TOutput>(name: string, input: TInput): Promise<TOutput> {
  const response = await fetch(`http://localhost:3000/tools/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw new Error(`Tool call failed with status ${response.status}`);
  }
  return (await response.json()) as TOutput;
}

const App: React.FC = () => {
  const [items, setItems] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Fetch initial products on mount.  We search with an empty query to
    // return all products from our example dataset.  You can modify this
    // behaviour to suit your application.
    async function fetchProducts() {
      try {
        const result = await callTool('search_products', { query: '', limit: 10 });
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
      const result = await callTool('search_products', { query, limit: 10 });
      setItems(result.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>ConversoKit Widget Demo</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: 8, width: 200, marginRight: 8 }}
        />
        <button type="submit" style={{ padding: '8px 12px' }}>Search</button>
      </form>
      {loading ? (
        <p>Loading products…</p>
      ) : (
        <ProductCarousel items={items} />
      )}
    </div>
  );
};

export default App;