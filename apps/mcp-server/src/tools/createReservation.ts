import { z } from 'zod';
import { reservationSchema, defineTool } from '@conversokit/shared';
import { defaultAvailabilityStore } from '../store/availability.js';
import { defaultReservationStore } from '../store/reservations.js';

export const createReservationTool = defineTool({
  name: 'create_reservation',
  description: 'Reserve a time slot for a resource. Requires consent.',
  inputSchema: z.object({
    resourceId: z.string(),
    slotId: z.string(),
    customer: z.object({
      name: z.string(),
      email: z.string().email().optional()
    }),
    notes: z.string().optional()
  }),
  outputSchema: z.object({ reservation: reservationSchema }),
  permissions: { requiresAuth: false, requiresConsent: true },
  async handler(input, _ctx) {
    // Find a slot across all known availability for the resource.
    const days = await defaultAvailabilityStore.get(
      input.resourceId,
      '0000-01-01',
      '9999-12-31'
    );
    const slot = days
      .flatMap((d) => d.slots)
      .find((s) => s.id === input.slotId);
    if (!slot) {
      throw new Error(`Slot ${input.slotId} not found`);
    }
    if (!slot.available) {
      throw new Error(`Slot ${input.slotId} is not available`);
    }
    const day = days.find((d) => d.slots.some((s) => s.id === input.slotId));
    const reservation = {
      id: `res_${Math.random().toString(36).slice(2)}`,
      resourceId: input.resourceId,
      resourceName: day?.resourceName,
      slotId: input.slotId,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      status: 'confirmed' as const,
      customer: input.customer,
      notes: input.notes
    };
    await defaultReservationStore.put(reservation);
    return { reservation };
  }
});
