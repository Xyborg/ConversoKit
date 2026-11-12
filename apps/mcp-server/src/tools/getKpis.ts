import { z } from 'zod';
import { EXAMPLE_KPIS, defineTool, kpiSchema } from '@conversokit/shared';

export const getKpisTool = defineTool({
  name: 'get_kpis',
  description: 'Return the headline KPIs for the dashboard. Returns mock values in dev.',
  inputSchema: z.object({}),
  outputSchema: z.object({ items: z.array(kpiSchema) }),
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  permissions: { requiresAuth: true },
  async handler() {
    return { items: EXAMPLE_KPIS };
  }
});
