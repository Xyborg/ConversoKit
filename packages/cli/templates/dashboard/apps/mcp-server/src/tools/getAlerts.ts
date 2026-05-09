import { z } from 'zod';
import { EXAMPLE_ALERTS, alertSchema, defineTool } from '@conversokit/shared';

export const getAlertsTool = defineTool({
  name: 'get_alerts',
  description: 'Return active operational alerts.',
  inputSchema: z.object({
    severity: z.enum(['info', 'warning', 'critical']).optional()
  }),
  outputSchema: z.object({ items: z.array(alertSchema) }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const items = input.severity
      ? EXAMPLE_ALERTS.filter((a) => a.severity === input.severity)
      : EXAMPLE_ALERTS;
    return { items };
  }
});
