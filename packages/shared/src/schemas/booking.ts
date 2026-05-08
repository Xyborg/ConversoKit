import { z } from 'zod';

export const timeSlotSchema = z.object({
  id: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  available: z.boolean().default(true),
  price: z.string().optional()
});

export type TimeSlot = z.infer<typeof timeSlotSchema>;

export const availabilitySchema = z.object({
  resourceId: z.string(),
  resourceName: z.string().optional(),
  date: z.string(),
  slots: z.array(timeSlotSchema)
});

export type Availability = z.infer<typeof availabilitySchema>;

export const reservationSchema = z.object({
  id: z.string(),
  resourceId: z.string(),
  resourceName: z.string().optional(),
  slotId: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  status: z.enum(['confirmed', 'pending', 'cancelled']),
  customer: z
    .object({
      name: z.string(),
      email: z.string().email().optional()
    })
    .optional(),
  notes: z.string().optional()
});

export type Reservation = z.infer<typeof reservationSchema>;
