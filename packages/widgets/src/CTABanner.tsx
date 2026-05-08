import React from 'react';
import { z } from 'zod';
import { defaultWidgetConfig, type WidgetMeta } from '@conversokit/shared';

export type CTABannerVariant = 'info' | 'primary' | 'success' | 'danger';

export interface CTABannerProps {
  title: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  variant?: CTABannerVariant;
}

function bgFor(variant: CTABannerVariant): string {
  switch (variant) {
    case 'primary':
      return 'var(--ck-primary)';
    case 'success':
      return 'var(--ck-success)';
    case 'danger':
      return 'var(--ck-danger)';
    default:
      return 'var(--ck-surface)';
  }
}

function fgFor(variant: CTABannerVariant): string {
  switch (variant) {
    case 'primary':
    case 'success':
    case 'danger':
      return 'white';
    default:
      return 'var(--ck-text)';
  }
}

export const CTABanner: React.FC<CTABannerProps> = ({
  title,
  description,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  variant = 'info'
}) => {
  const bg = bgFor(variant);
  const fg = fgFor(variant);
  return (
    <div
      role="region"
      style={{
        backgroundColor: bg,
        color: fg,
        border: '1px solid var(--ck-border)',
        borderRadius: 'var(--ck-radius-md)',
        padding: 'var(--ck-spacing-4)',
        fontFamily: 'var(--ck-font-family)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ck-spacing-1)'
      }}
      data-testid="cta-banner"
    >
      <strong style={{ fontSize: 'var(--ck-font-size-lg)' }}>{title}</strong>
      {description && (
        <p style={{ margin: 0, fontSize: 'var(--ck-font-size-sm)', opacity: 0.9 }}>
          {description}
        </p>
      )}
      {(primaryLabel || secondaryLabel) && (
        <div style={{ display: 'flex', gap: 'var(--ck-spacing-2)', marginTop: 'var(--ck-spacing-2)' }}>
          {primaryLabel && (
            <button
              type="button"
              onClick={onPrimary}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--ck-radius-sm)',
                border: 'none',
                backgroundColor: variant === 'info' ? 'var(--ck-primary)' : 'white',
                color: variant === 'info' ? 'var(--ck-primary-foreground)' : bg,
                cursor: 'pointer',
                fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
              }}
            >
              {primaryLabel}
            </button>
          )}
          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--ck-radius-sm)',
                border: '1px solid currentColor',
                backgroundColor: 'transparent',
                color: fg,
                cursor: 'pointer'
              }}
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const ctaBannerSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  primaryLabel: z.string().optional(),
  secondaryLabel: z.string().optional(),
  variant: z.enum(['info', 'primary', 'success', 'danger']).optional()
});

export const CTABannerMeta: WidgetMeta = {
  name: 'CTABanner',
  category: 'core',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: { allowsExternalLinks: true }
  },
  schema: ctaBannerSchema
};
