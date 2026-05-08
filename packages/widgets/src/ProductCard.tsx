import React from 'react';

/**
 * Props for the `ProductCard` component.  This component can represent a wide
 * variety of items, not just physical products – any entity with an id,
 * title and optional metadata (subtitle, image, price, badge, rating) can be
 * rendered using this component.
 */
export interface ProductCardProps {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  price?: string;
  badge?: string;
  rating?: number;
  /**
   * Label for the call‑to‑action button.  Defaults to `View` if omitted.
   */
  ctaLabel?: string;
  /**
   * Called when the call‑to‑action button is clicked.  Optional; if omitted
   * no button will be rendered.
   */
  onAction?: () => void;
}

/**
 * A simple card component to display summary information about a product or
 * service.  The card includes an image (optional), title, subtitle, price,
 * badge, rating and an optional call‑to‑action button.  Styling is kept
 * intentionally neutral so that themes can be applied at a higher level.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  subtitle,
  imageUrl,
  price,
  badge,
  rating,
  ctaLabel = 'View',
  onAction
}) => {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
        width: 200,
        boxSizing: 'border-box',
        backgroundColor: '#fff'
      }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
        />
      )}
      <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
      {subtitle && (
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>{
          subtitle
        }</p>
      )}
      {badge && (
        <span
          style={{
            fontSize: '0.75rem',
            backgroundColor: '#f3f4f6',
            borderRadius: 4,
            padding: '2px 4px',
            marginTop: 4,
            display: 'inline-block'
          }}
        >
          {badge}
        </span>
      )}
      {price && (
        <p style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>{price}</p>
      )}
      {rating !== undefined && (
        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem' }}>
          ⭐ {rating.toFixed(1)}
        </p>
      )}
      {onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: 8,
            padding: '6px 12px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: '#6366f1',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
};