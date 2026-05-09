import { z } from 'zod';

export const kpiSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  delta: z.number().optional(),
  trend: z.enum(['up', 'down', 'flat']).optional()
});

export type KPI = z.infer<typeof kpiSchema>;

export const trendPointSchema = z.object({
  t: z.string(),
  v: z.number()
});

export type TrendPoint = z.infer<typeof trendPointSchema>;

export const trendSeriesSchema = z.object({
  label: z.string(),
  points: z.array(trendPointSchema)
});

export type TrendSeries = z.infer<typeof trendSeriesSchema>;

export const analyticsPanelSchema = z.object({
  title: z.string(),
  totals: z.array(kpiSchema),
  series: z.array(trendSeriesSchema).optional()
});

export type AnalyticsPanel = z.infer<typeof analyticsPanelSchema>;

export const alertSchema = z.object({
  id: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),
  message: z.string(),
  createdAt: z.string(),
  source: z.string().optional()
});

export type Alert = z.infer<typeof alertSchema>;

export const alertFeedSchema = z.object({
  alerts: z.array(alertSchema)
});

export type AlertFeed = z.infer<typeof alertFeedSchema>;
