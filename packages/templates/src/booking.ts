import { EXAMPLE_AVAILABILITY } from '@conversokit/shared';
import type { AppTemplate } from './types.js';

export function createBookingTemplate(): AppTemplate {
  return {
    name: 'booking',
    description:
      'Booking assistant: pick a date, choose a slot, confirm a reservation.',
    tools: ['get_availability', 'create_reservation', 'cancel_reservation'],
    widgets: [
      'AvailabilityCalendar',
      'TimeSlotSelector',
      'BookingCard',
      'CTABanner',
      'ConsentBanner'
    ],
    integrations: [],
    auth: { default: 'anonymous' },
    compliance: {
      requiresConsent: true,
      consentScopes: ['personalData']
    },
    exampleData: {
      availability: EXAMPLE_AVAILABILITY
    }
  };
}
