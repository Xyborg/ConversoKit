import React from 'react';
import { format } from 'date-fns';
import {
  alertFeedSchema,
  defaultWidgetConfig,
  type Alert,
  type WidgetMeta
} from '@conversokit/shared';

export interface AlertFeedProps {
  alerts: Alert[];
  onAcknowledge?: (alert: Alert) => void;
}

const severityColor = (severity: Alert['severity']): string => {
  if (severity === 'critical') return 'var(--ck-danger)';
  if (severity === 'warning') return 'var(--ck-accent)';
  return 'var(--ck-muted)';
};

export const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  onAcknowledge
}) => {
  if (alerts.length === 0) {
    return (
      <p style={{ color: 'var(--ck-muted)', fontFamily: 'var(--ck-font-family)' }}>
        No active alerts.
      </p>
    );
  }
  return (
    <ul
      data-testid="alert-feed"
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ck-spacing-2)',
        fontFamily: 'var(--ck-font-family)'
      }}
    >
      {alerts.map((alert) => (
        <li
          key={alert.id}
          style={{
            border: '1px solid var(--ck-border)',
            borderLeft: `4px solid ${severityColor(alert.severity)}`,
            borderRadius: 'var(--ck-radius-md)',
            backgroundColor: 'var(--ck-surface)',
            color: 'var(--ck-text)',
            padding: 'var(--ck-spacing-3)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--ck-spacing-2)'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ck-spacing-2)',
                marginBottom: 4
              }}
            >
              <span
                style={{
                  fontSize: 'var(--ck-font-size-sm)',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: severityColor(alert.severity),
                  fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
                }}
              >
                {alert.severity}
              </span>
              {alert.source && (
                <span
                  style={{
                    fontSize: 'var(--ck-font-size-sm)',
                    color: 'var(--ck-muted)'
                  }}
                >
                  · {alert.source}
                </span>
              )}
              <span
                style={{
                  fontSize: 'var(--ck-font-size-sm)',
                  color: 'var(--ck-muted)'
                }}
              >
                · {format(new Date(alert.createdAt), 'MMM d, HH:mm')}
              </span>
            </div>
            <div>{alert.message}</div>
          </div>
          {onAcknowledge && (
            <button
              type="button"
              onClick={() => onAcknowledge(alert)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--ck-radius-sm)',
                border: '1px solid var(--ck-border)',
                backgroundColor: 'transparent',
                color: 'var(--ck-text)',
                cursor: 'pointer',
                fontSize: 'var(--ck-font-size-sm)'
              }}
            >
              Ack
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export const AlertFeedMeta: WidgetMeta = {
  name: 'AlertFeed',
  category: 'dashboard',
  version: '0.1.0',
  config: { ...defaultWidgetConfig, permissions: {} },
  schema: alertFeedSchema
};
