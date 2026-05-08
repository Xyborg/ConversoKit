import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import {
  consentRecordSchema,
  defaultWidgetConfig,
  type ConsentRecord,
  type ConsentScope,
  type WidgetMeta
} from '@conversokit/shared';

const STORAGE_KEY = 'conversokit:consent';

function readStored(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return consentRecordSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeStored(record: ConsentRecord): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export interface ConsentBannerProps {
  scopes: ConsentScope[];
  privacyUrl?: string;
  termsUrl?: string;
  message?: string;
  onAccept?: (record: ConsentRecord) => void;
  children: React.ReactNode;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  scopes,
  privacyUrl,
  termsUrl,
  message = 'This app may collect personal data to provide the requested experience.',
  onAccept,
  children
}) => {
  const [record, setRecord] = useState<ConsentRecord | null>(() => readStored());

  useEffect(() => {
    if (record && onAccept) onAccept(record);
  }, [record, onAccept]);

  if (record) return <>{children}</>;

  const handleAccept = () => {
    const next: ConsentRecord = {
      scopes,
      acceptedAt: new Date().toISOString()
    };
    writeStored(next);
    setRecord(next);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 'auto 16px 16px 16px',
        zIndex: 9999,
        backgroundColor: 'var(--ck-surface)',
        color: 'var(--ck-text)',
        border: '1px solid var(--ck-border)',
        borderRadius: 'var(--ck-radius-md)',
        padding: 'var(--ck-spacing-4)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ck-spacing-2)'
      }}
    >
      <p style={{ margin: 0, fontSize: 'var(--ck-font-size-sm)' }}>{message}</p>
      <p style={{ margin: 0, fontSize: 'var(--ck-font-size-sm)', color: 'var(--ck-muted)' }}>
        Scopes: {scopes.join(', ')}
        {privacyUrl && (
          <>
            {' · '}
            <a href={privacyUrl} target="_blank" rel="noreferrer">
              Privacy
            </a>
          </>
        )}
        {termsUrl && (
          <>
            {' · '}
            <a href={termsUrl} target="_blank" rel="noreferrer">
              Terms
            </a>
          </>
        )}
      </p>
      <button
        type="button"
        onClick={handleAccept}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 14px',
          borderRadius: 'var(--ck-radius-sm)',
          border: 'none',
          backgroundColor: 'var(--ck-primary)',
          color: 'var(--ck-primary-foreground)',
          cursor: 'pointer'
        }}
      >
        Accept and continue
      </button>
    </div>
  );
};

export const consentBannerSchema = z.object({
  scopes: z.array(z.string()),
  privacyUrl: z.string().url().optional(),
  termsUrl: z.string().url().optional(),
  message: z.string().optional()
});

export const ConsentBannerMeta: WidgetMeta = {
  name: 'ConsentBanner',
  category: 'core',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: {
      collectPersonalData: false,
      requiresConsent: false,
      allowsExternalLinks: true
    }
  },
  schema: consentBannerSchema
};
