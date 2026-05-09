import React from 'react';
import {
  defaultWidgetConfig,
  trendSeriesSchema,
  type TrendSeries,
  type WidgetMeta
} from '@conversokit/shared';

export interface TrendChartProps {
  series: TrendSeries;
  width?: number;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  series,
  width = 480,
  height = 160
}) => {
  if (series.points.length < 2) {
    return (
      <p style={{ color: 'var(--ck-muted)', padding: 'var(--ck-spacing-2)' }}>
        Not enough data to render a trend.
      </p>
    );
  }
  const padding = 16;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const values = series.points.map((p) => p.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = innerW / (series.points.length - 1);
  const path = series.points
    .map((p, i) => {
      const x = padding + i * stepX;
      const y = padding + innerH - ((p.v - min) / range) * innerH;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const last = series.points[series.points.length - 1];
  const lastX = padding + (series.points.length - 1) * stepX;
  const lastY = padding + innerH - ((last.v - min) / range) * innerH;

  return (
    <div
      data-testid="trend-chart"
      style={{
        border: '1px solid var(--ck-border)',
        borderRadius: 'var(--ck-radius-md)',
        backgroundColor: 'var(--ck-surface)',
        color: 'var(--ck-text)',
        fontFamily: 'var(--ck-font-family)',
        padding: 'var(--ck-spacing-3)',
        maxWidth: width
      }}
    >
      <div
        style={{
          fontSize: 'var(--ck-font-size-sm)',
          color: 'var(--ck-muted)',
          marginBottom: 'var(--ck-spacing-1)'
        }}
      >
        {series.label}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={`${series.label} trend, latest ${last.v}`}
      >
        <path
          d={path}
          fill="none"
          stroke="var(--ck-primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={lastX}
          cy={lastY}
          r={4}
          fill="var(--ck-primary)"
          stroke="var(--ck-surface)"
          strokeWidth={2}
        />
      </svg>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--ck-font-size-sm)',
          color: 'var(--ck-muted)'
        }}
      >
        <span>{series.points[0].t}</span>
        <span>{last.t}</span>
      </div>
    </div>
  );
};

export const TrendChartMeta: WidgetMeta = {
  name: 'TrendChart',
  category: 'dashboard',
  version: '0.1.0',
  config: { ...defaultWidgetConfig, permissions: {} },
  schema: trendSeriesSchema
};
