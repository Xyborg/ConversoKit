import React from 'react';
import { ProductCard, ProductCardProps } from './ProductCard';

/**
 * Props for the `ProductCarousel` component.  Accepts an array of
 * `ProductCardProps` and renders them horizontally with a scrollable container.
 */
export interface ProductCarouselProps {
  items: ProductCardProps[];
}

/**
 * A horizontally scrollable carousel of product cards.  This component simply
 * maps each item in the `items` array to a `ProductCard`.  Styling is
 * intentionally minimal; in production you might integrate a slider library
 * or add arrows for navigation.
 */
export const ProductCarousel: React.FC<ProductCarouselProps> = ({ items }) => {
  return (
    <div
      style={{
        display: 'flex',
        overflowX: 'auto',
        gap: 16,
        padding: 8,
        scrollSnapType: 'x mandatory'
      }}
    >
      {items.map((item) => (
        <div key={item.id} style={{ flex: '0 0 auto', scrollSnapAlign: 'start' }}>
          <ProductCard {...item} />
        </div>
      ))}
    </div>
  );
};