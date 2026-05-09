import { z } from 'zod';
import {
  EXAMPLE_AVAILABILITY,
  defineTool,
  reservationSchema
} from '@conversokit/shared';

export const cancelReservationTool = defineTool({
  name: 'cancel_reservation',
  description: 'Cancel an existing reservation by id.',
  inputSchema: z.object({ reservationId: z.string() }),
  outputSchema: z.object({ reservation: reservationSchema }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const slot = EXAMPLE_AVAILABILITY.slots[0];
    return {
      reservation: {
        id: input.reservationId,
        resourceId: EXAMPLE_AVAILABILITY.resourceId,
        resourceName: EXAMPLE_AVAILABILITY.resourceName,
        slotId: slot.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        status: 'cancelled' as const
      }
    };
  }
});
