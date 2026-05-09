import React from 'react';
import {
  analyticsPanelSchema,
  defaultWidgetConfig,
  type AnalyticsPanel as AnalyticsPanelData,
  type WidgetMeta
} from '@conversokit/shared';
import { KPIGrid } from './KPIGrid.js';
import { TrendChart } from './TrendChart.js';

export interface AnalyticsPanelProps {
  panel: AnalyticsPanelData;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ panel }) => {
  return (
    <div
      data-testid="analytics-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ck-spacing-4)',
        fontFamily: 'var(--ck-font-family)',
        color: 'var(--ck-text)'
      }}
    >
      <h3 style={{ margin: 0 }}>{panel.title}</h3>
      <KPIGrid kpis={panel.totals} />
      {panel.series && panel.series.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 'var(--ck-spacing-2)'
          }}
        >
          {panel.series.map((s) => (
            <TrendChart key={s.label} series={s} />
          ))}
        </div>
      )}
    </div>
  );
};

export const AnalyticsPanelMeta: WidgetMeta = {
  name: 'AnalyticsPanel',
  category: 'dashboard',
  version: '0.1.0',
  config: { ...defaultWidgetConfig, permissions: {} },
  schema: analyticsPanelSchema
};
