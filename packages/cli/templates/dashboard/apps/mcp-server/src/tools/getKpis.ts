import { z } from 'zod';
import { EXAMPLE_KPIS, defineTool, kpiSchema } from '@conversokit/shared';

export const getKpisTool = defineTool({
  name: 'get_kpis',
  description: 'Return the headline KPIs for the dashboard.',
  inputSchema: z.object({}),
  outputSchema: z.object({ items: z.array(kpiSchema) }),
  permissions: { requiresAuth: false },
  async handler() {
    return { items: EXAMPLE_KPIS };
  }
});
