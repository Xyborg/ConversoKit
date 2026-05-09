import { z } from 'zod';
import {
  EXAMPLE_TREND_SERIES,
  defineTool,
  trendSeriesSchema
} from '@conversokit/shared';

export const getTrendSeriesTool = defineTool({
  name: 'get_trend_series',
  description: 'Return a time-series trend for a given metric. Returns the demo MRR series in dev.',
  inputSchema: z.object({
    metric: z.string().optional().describe("Metric id, e.g. 'mrr', 'active', 'churn'"),
    range: z.enum(['7d', '30d', '12w', '12m']).optional()
  }),
  outputSchema: z.object({ series: trendSeriesSchema }),
  permissions: { requiresAuth: true },
  async handler() {
    return { series: EXAMPLE_TREND_SERIES };
  }
});
