import { z } from 'zod';
import {
  EXAMPLE_AVAILABILITY,
  availabilitySchema,
  defineTool
} from '@conversokit/shared';

export const getAvailabilityTool = defineTool({
  name: 'get_availability',
  description: 'Return available time slots for a resource within a date range.',
  inputSchema: z.object({
    resourceId: z.string(),
    from: z.string(),
    to: z.string()
  }),
  outputSchema: z.object({ days: z.array(availabilitySchema) }),
  permissions: { requiresAuth: false },
  async handler() {
    return { days: [EXAMPLE_AVAILABILITY] };
  }
});
