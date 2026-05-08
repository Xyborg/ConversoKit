import React from 'react';
import {
  productSchema,
  defaultWidgetConfig,
  type WidgetConfig,
  type WidgetMeta
} from '@conversokit/shared';

export interface ProductCardProps {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  price?: string;
  badge?: string;
  rating?: number;
  ctaLabel?: string;
  onAction?: () => void;
  config?: WidgetConfig;
}

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--ck-border)',
  borderRadius: 'var(--ck-radius-md)',
  padding: 'var(--ck-spacing-4)',
  width: 220,
  boxSizing: 'border-box',
  backgroundColor: 'var(--ck-surface)',
  color: 'var(--ck-text)',
  fontFamily: 'var(--ck-font-family)'
};

const imgStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 'var(--ck-radius-sm)',
  marginBottom: 'var(--ck-spacing-2)',
  display: 'block'
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--ck-font-size-base)',
  fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
};

const subtitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 'var(--ck-font-size-sm)',
  color: 'var(--ck-muted)'
};

const badgeStyle: React.CSSProperties = {
  fontSize: 'var(--ck-font-size-sm)',
  backgroundColor: 'var(--ck-background)',
  border: '1px solid var(--ck-border)',
  color: 'var(--ck-muted)',
  borderRadius: 'var(--ck-radius-sm)',
  padding: '2px 6px',
  marginTop: 'var(--ck-spacing-1)',
  display: 'inline-block'
};

const priceStyle: React.CSSProperties = {
  margin: 'var(--ck-spacing-2) 0 0 0',
  fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
};

const ratingStyle: React.CSSProperties = {
  margin: 'var(--ck-spacing-1) 0 0 0',
  fontSize: 'var(--ck-font-size-sm)',
  color: 'var(--ck-muted)'
};

const buttonStyle: React.CSSProperties = {
  marginTop: 'var(--ck-spacing-2)',
  padding: '6px 12px',
  borderRadius: 'var(--ck-radius-sm)',
  border: 'none',
  backgroundColor: 'var(--ck-primary)',
  color: 'var(--ck-primary-foreground)',
  cursor: 'pointer',
  fontSize: 'var(--ck-font-size-sm)'
};

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
    <div style={cardStyle}>
      {imageUrl && <img src={imageUrl} alt={title} style={imgStyle} />}
      <h3 style={titleStyle}>{title}</h3>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      {badge && <span style={badgeStyle}>{badge}</span>}
      {price && <p style={priceStyle}>{price}</p>}
      {rating !== undefined && <p style={ratingStyle}>⭐ {rating.toFixed(1)}</p>}
      {onAction && (
        <button onClick={onAction} style={buttonStyle}>
          {ctaLabel}
        </button>
      )}
    </div>
  );
};

export const ProductCardMeta: WidgetMeta = {
  name: 'ProductCard',
  category: 'commerce',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: { allowsExternalLinks: true }
  },
  schema: productSchema
};
