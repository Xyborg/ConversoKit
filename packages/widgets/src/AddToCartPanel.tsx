import React, { useState } from 'react';
import {
  cartItemSchema,
  defaultWidgetConfig,
  type Product,
  type CartItem,
  type WidgetMeta
} from '@conversokit/shared';

export interface AddToCartPanelProps {
  product: Product;
  initialQuantity?: number;
  maxQuantity?: number;
  onAdd?: (item: CartItem) => void;
}

const containerStyle: React.CSSProperties = {
  border: '1px solid var(--ck-border)',
  borderRadius: 'var(--ck-radius-md)',
  padding: 'var(--ck-spacing-4)',
  backgroundColor: 'var(--ck-surface)',
  color: 'var(--ck-text)',
  fontFamily: 'var(--ck-font-family)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ck-spacing-2)',
  maxWidth: 320
};

const qtyRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ck-spacing-2)'
};

const qtyBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 'var(--ck-radius-sm)',
  border: '1px solid var(--ck-border)',
  backgroundColor: 'var(--ck-background)',
  color: 'var(--ck-text)',
  cursor: 'pointer'
};

const addBtn: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 'var(--ck-radius-sm)',
  border: 'none',
  backgroundColor: 'var(--ck-primary)',
  color: 'var(--ck-primary-foreground)',
  cursor: 'pointer',
  fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
};

export const AddToCartPanel: React.FC<AddToCartPanelProps> = ({
  product,
  initialQuantity = 1,
  maxQuantity = 99,
  onAdd
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const dec = () => setQuantity((q) => Math.max(1, q - 1));
  const inc = () => setQuantity((q) => Math.min(maxQuantity, q + 1));

  const handleAdd = () => {
    if (!onAdd) return;
    onAdd({ ...product, quantity });
  };

  return (
    <div style={containerStyle} data-testid="add-to-cart-panel">
      <div>
        <h3 style={{ margin: 0, fontSize: 'var(--ck-font-size-base)' }}>
          {product.title}
        </h3>
        {product.price && (
          <p
            style={{
              margin: 'var(--ck-spacing-1) 0 0 0',
              fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
            }}
          >
            {product.price}
          </p>
        )}
      </div>
      <div style={qtyRow}>
        <button
          type="button"
          style={qtyBtn}
          onClick={dec}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span aria-live="polite" data-testid="cart-quantity">
          {quantity}
        </span>
        <button
          type="button"
          style={qtyBtn}
          onClick={inc}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button type="button" style={addBtn} onClick={handleAdd}>
        Add to cart
      </button>
    </div>
  );
};

export const AddToCartPanelMeta: WidgetMeta = {
  name: 'AddToCartPanel',
  category: 'commerce',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: { allowsExternalLinks: true }
  },
  schema: cartItemSchema
};
