import React from 'react';
import { z } from 'zod';
import {
  defaultWidgetConfig,
  kpiSchema,
  type KPI,
  type WidgetMeta
} from '@conversokit/shared';

export interface KPIGridProps {
  kpis: KPI[];
}

function trendIcon(trend?: KPI['trend']): string {
  if (trend === 'up') return '▲';
  if (trend === 'down') return '▼';
  return '●';
}

function trendColor(trend?: KPI['trend']): string {
  if (trend === 'up') return 'var(--ck-success)';
  if (trend === 'down') return 'var(--ck-danger)';
  return 'var(--ck-muted)';
}

export const KPIGrid: React.FC<KPIGridProps> = ({ kpis }) => {
  return (
    <div
      data-testid="kpi-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 'var(--ck-spacing-2)',
        fontFamily: 'var(--ck-font-family)'
      }}
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          style={{
            border: '1px solid var(--ck-border)',
            borderRadius: 'var(--ck-radius-md)',
            backgroundColor: 'var(--ck-surface)',
            color: 'var(--ck-text)',
            padding: 'var(--ck-spacing-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <span
            style={{
              fontSize: 'var(--ck-font-size-sm)',
              color: 'var(--ck-muted)',
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}
          >
            {kpi.label}
          </span>
          <strong style={{ fontSize: 'var(--ck-font-size-xl)' }}>{kpi.value}</strong>
          {(kpi.delta !== undefined || kpi.trend) && (
            <span
              style={{
                fontSize: 'var(--ck-font-size-sm)',
                color: trendColor(kpi.trend),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span aria-hidden>{trendIcon(kpi.trend)}</span>
              {kpi.delta !== undefined ? `${kpi.delta > 0 ? '+' : ''}${kpi.delta.toFixed(1)}%` : ''}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export const kpiGridSchema = z.object({ kpis: z.array(kpiSchema) });

export const KPIGridMeta: WidgetMeta = {
  name: 'KPIGrid',
  category: 'dashboard',
  version: '0.1.0',
  config: { ...defaultWidgetConfig, permissions: {} },
  schema: kpiGridSchema
};
