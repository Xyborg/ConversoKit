import { z } from 'zod';
import {
  EXAMPLE_AVAILABILITY,
  defineTool,
  reservationSchema
} from '@conversokit/shared';

export const createReservationTool = defineTool({
  name: 'create_reservation',
  description: 'Reserve a time slot. Returns a synthetic Reservation in dev.',
  inputSchema: z.object({
    resourceId: z.string(),
    slotId: z.string(),
    customer: z.object({
      name: z.string(),
      email: z.string().email().optional()
    })
  }),
  outputSchema: z.object({ reservation: reservationSchema }),
  permissions: { requiresAuth: false, requiresConsent: true },
  async handler(input) {
    const slot =
      EXAMPLE_AVAILABILITY.slots.find((s) => s.id === input.slotId) ??
      EXAMPLE_AVAILABILITY.slots[0];
    return {
      reservation: {
        id: `res_${Math.random().toString(36).slice(2)}`,
        resourceId: input.resourceId,
        resourceName: EXAMPLE_AVAILABILITY.resourceName,
        slotId: slot.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        status: 'confirmed' as const,
        customer: input.customer
      }
    };
  }
});
