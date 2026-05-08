import { z } from 'zod';
import { reservationSchema, defineTool } from '@conversokit/shared';
import { defaultReservationStore } from '../store/reservations.js';

export const cancelReservationTool = defineTool({
  name: 'cancel_reservation',
  description: 'Cancel an existing reservation by id.',
  inputSchema: z.object({ reservationId: z.string() }),
  outputSchema: z.object({ reservation: reservationSchema }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const reservation = await defaultReservationStore.cancel(input.reservationId);
    if (!reservation) {
      throw new Error(`Reservation ${input.reservationId} not found`);
    }
    return { reservation };
  }
});
