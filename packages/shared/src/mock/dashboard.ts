import type {
  Alert,
  AnalyticsPanel,
  KPI,
  TrendSeries
} from '../schemas/dashboard.js';

export const EXAMPLE_KPIS: KPI[] = [
  { id: 'mrr', label: 'MRR', value: '$48,210', delta: 8.4, trend: 'up' },
  { id: 'active', label: 'Active users', value: '1,284', delta: 2.1, trend: 'up' },
  { id: 'churn', label: 'Churn', value: '3.2%', delta: -0.4, trend: 'down' },
  { id: 'leads', label: 'New leads', value: '147', delta: 0, trend: 'flat' }
];

export const EXAMPLE_TREND_SERIES: TrendSeries = {
  label: 'MRR (last 12 weeks)',
  points: [
    { t: '2026-02-23', v: 38420 },
    { t: '2026-03-02', v: 39800 },
    { t: '2026-03-09', v: 40110 },
    { t: '2026-03-16', v: 41320 },
    { t: '2026-03-23', v: 42050 },
    { t: '2026-03-30', v: 43280 },
    { t: '2026-04-06', v: 43930 },
    { t: '2026-04-13', v: 44610 },
    { t: '2026-04-20', v: 45720 },
    { t: '2026-04-27', v: 46330 },
    { t: '2026-05-04', v: 47480 },
    { t: '2026-05-11', v: 48210 }
  ]
};

export const EXAMPLE_ANALYTICS_PANEL: AnalyticsPanel = {
  title: 'Revenue overview',
  totals: EXAMPLE_KPIS,
  series: [EXAMPLE_TREND_SERIES]
};

export const EXAMPLE_ALERTS: Alert[] = [
  {
    id: 'a1',
    severity: 'critical',
    message: 'Stripe webhook signature failed 3 times in the last 5 minutes.',
    createdAt: '2026-05-09T08:42:00Z',
    source: 'mcp-server'
  },
  {
    id: 'a2',
    severity: 'warning',
    message: 'CRM sync queue depth above threshold (148 items).',
    createdAt: '2026-05-09T08:30:00Z',
    source: 'submit_lead'
  },
  {
    id: 'a3',
    severity: 'info',
    message: 'Scheduled DB backup completed.',
    createdAt: '2026-05-09T03:00:00Z',
    source: 'platform'
  }
];
