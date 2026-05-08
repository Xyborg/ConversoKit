import { z } from 'zod';
import { availabilitySchema, defineTool } from '@conversokit/shared';
import { defaultAvailabilityStore } from '../store/availability.js';

export const getAvailabilityTool = defineTool({
  name: 'get_availability',
  description:
    'Return available time slots for a resource within a date range (yyyy-MM-dd).',
  inputSchema: z.object({
    resourceId: z.string(),
    from: z.string(),
    to: z.string()
  }),
  outputSchema: z.object({
    days: z.array(availabilitySchema)
  }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const days = await defaultAvailabilityStore.get(
      input.resourceId,
      input.from,
      input.to
    );
    return { days };
  }
});
