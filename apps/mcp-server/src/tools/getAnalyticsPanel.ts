import { z } from 'zod';
import {
  EXAMPLE_ANALYTICS_PANEL,
  analyticsPanelSchema,
  defineTool
} from '@conversokit/shared';

export const getAnalyticsPanelTool = defineTool({
  name: 'get_analytics_panel',
  description:
    'Return the assembled analytics panel (title + KPIs + optional trend series).',
  inputSchema: z.object({}),
  outputSchema: z.object({ panel: analyticsPanelSchema }),
  permissions: { requiresAuth: true },
  async handler() {
    return { panel: EXAMPLE_ANALYTICS_PANEL };
  }
});
