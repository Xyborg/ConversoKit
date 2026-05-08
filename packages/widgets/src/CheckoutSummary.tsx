import React from 'react';
import {
  checkoutSummarySchema,
  defaultWidgetConfig,
  type CheckoutSummary as CheckoutSummaryData,
  type WidgetMeta
} from '@conversokit/shared';

export interface CheckoutSummaryProps {
  summary: CheckoutSummaryData;
  ctaLabel?: string;
  onCheckout?: () => void;
  onBack?: () => void;
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
  maxWidth: 480
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 'var(--ck-font-size-sm)'
};

const lineItemStyle: React.CSSProperties = {
  ...rowStyle,
  paddingBottom: 'var(--ck-spacing-1)',
  borderBottom: '1px dashed var(--ck-border)'
};

const totalStyle: React.CSSProperties = {
  ...rowStyle,
  fontSize: 'var(--ck-font-size-lg)',
  fontWeight: 'var(--ck-font-weight-bold)' as unknown as number,
  marginTop: 'var(--ck-spacing-2)'
};

const buttonRow: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--ck-spacing-2)',
  marginTop: 'var(--ck-spacing-2)'
};

const primaryBtn: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  borderRadius: 'var(--ck-radius-sm)',
  border: 'none',
  backgroundColor: 'var(--ck-primary)',
  color: 'var(--ck-primary-foreground)',
  cursor: 'pointer',
  fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
};

const secondaryBtn: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 'var(--ck-radius-sm)',
  border: '1px solid var(--ck-border)',
  backgroundColor: 'transparent',
  color: 'var(--ck-text)',
  cursor: 'pointer'
};

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  summary,
  ctaLabel = 'Checkout',
  onCheckout,
  onBack
}) => {
  return (
    <div style={containerStyle} data-testid="checkout-summary">
      <h3 style={{ margin: 0 }}>Order summary</h3>
      {summary.items.map((item) => (
        <div key={item.id} style={lineItemStyle}>
          <span>
            {item.title} × {item.quantity}
          </span>
          <span>{item.price ?? '—'}</span>
        </div>
      ))}
      {summary.taxes && (
        <div style={rowStyle}>
          <span style={{ color: 'var(--ck-muted)' }}>Taxes</span>
          <span>{summary.taxes}</span>
        </div>
      )}
      {summary.shipping && (
        <div style={rowStyle}>
          <span style={{ color: 'var(--ck-muted)' }}>Shipping</span>
          <span>{summary.shipping}</span>
        </div>
      )}
      <div style={totalStyle}>
        <span>Total</span>
        <span>{summary.total}</span>
      </div>
      <div style={buttonRow}>
        {onBack && (
          <button type="button" style={secondaryBtn} onClick={onBack}>
            Back
          </button>
        )}
        {onCheckout && (
          <button type="button" style={primaryBtn} onClick={onCheckout}>
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export const CheckoutSummaryMeta: WidgetMeta = {
  name: 'CheckoutSummary',
  category: 'commerce',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: {
      collectPersonalData: false,
      requiresConsent: true,
      allowsExternalLinks: true
    }
  },
  schema: checkoutSummarySchema
};
