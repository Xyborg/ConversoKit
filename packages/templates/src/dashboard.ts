import {
  EXAMPLE_ALERTS,
  EXAMPLE_ANALYTICS_PANEL,
  EXAMPLE_KPIS,
  EXAMPLE_TREND_SERIES
} from '@conversokit/shared';
import type { AppTemplate } from './types.js';

export function createDashboardTemplate(): AppTemplate {
  return {
    name: 'dashboard',
    description:
      'Internal analytics dashboard: KPIs, trend charts, and an alert feed for ops.',
    tools: ['get_kpis', 'get_trend_series', 'get_analytics_panel', 'get_alerts'],
    widgets: ['KPIGrid', 'TrendChart', 'AnalyticsPanel', 'AlertFeed', 'CTABanner'],
    integrations: [],
    auth: { default: 'jwt' },
    compliance: {
      requiresConsent: false
    },
    exampleData: {
      kpis: EXAMPLE_KPIS,
      trendSeries: EXAMPLE_TREND_SERIES,
      panel: EXAMPLE_ANALYTICS_PANEL,
      alerts: EXAMPLE_ALERTS
    }
  };
}
