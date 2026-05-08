import React from 'react';
import { z } from 'zod';
import {
  productSchema,
  defaultWidgetConfig,
  type WidgetMeta
} from '@conversokit/shared';
import { ProductCard, type ProductCardProps } from './ProductCard.js';

export interface ProductCarouselProps {
  items: ProductCardProps[];
  onItemAction?: (item: ProductCardProps) => void;
}

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  overflowX: 'auto',
  gap: 'var(--ck-spacing-4)',
  padding: 'var(--ck-spacing-2)',
  scrollSnapType: 'x mandatory'
};

const itemStyle: React.CSSProperties = {
  flex: '0 0 auto',
  scrollSnapAlign: 'start'
};

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  items,
  onItemAction
}) => {
  return (
    <div style={wrapperStyle}>
      {items.map((item) => (
        <div key={item.id} style={itemStyle}>
          <ProductCard
            {...item}
            onAction={onItemAction ? () => onItemAction(item) : item.onAction}
          />
        </div>
      ))}
    </div>
  );
};

export const productCarouselSchema = z.object({
  items: z.array(productSchema)
});

export const ProductCarouselMeta: WidgetMeta = {
  name: 'ProductCarousel',
  category: 'commerce',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: { allowsExternalLinks: true }
  },
  schema: productCarouselSchema
};
