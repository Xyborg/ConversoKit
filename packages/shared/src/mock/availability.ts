import type { Availability } from '../schemas/booking.js';

export const EXAMPLE_AVAILABILITY: Availability = {
  resourceId: 'studio-a',
  resourceName: 'Studio A',
  date: '2026-06-15',
  slots: [
    {
      id: 'slot-1',
      startsAt: '2026-06-15T09:00:00Z',
      endsAt: '2026-06-15T10:00:00Z',
      available: true,
      price: '$45'
    },
    {
      id: 'slot-2',
      startsAt: '2026-06-15T10:00:00Z',
      endsAt: '2026-06-15T11:00:00Z',
      available: false
    },
    {
      id: 'slot-3',
      startsAt: '2026-06-15T13:00:00Z',
      endsAt: '2026-06-15T14:00:00Z',
      available: true,
      price: '$45'
    },
    {
      id: 'slot-4',
      startsAt: '2026-06-15T15:00:00Z',
      endsAt: '2026-06-15T16:00:00Z',
      available: true,
      price: '$60'
    }
  ]
};
