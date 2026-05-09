import {
  EXAMPLE_DESTINATIONS,
  EXAMPLE_FLIGHT,
  EXAMPLE_HOTELS,
  EXAMPLE_ITINERARY
} from '@conversokit/shared';
import type { AppTemplate } from './types.js';

export function createTravelTemplate(): AppTemplate {
  return {
    name: 'travel',
    description:
      'Travel planning assistant: discover destinations, compare flights/hotels, build an itinerary.',
    tools: [
      'list_destinations',
      'search_hotels',
      'search_flights',
      'get_itinerary'
    ],
    widgets: [
      'DestinationRecommendations',
      'HotelCard',
      'FlightSummary',
      'ItineraryTimeline',
      'CTABanner',
      'ConsentBanner'
    ],
    integrations: [],
    auth: { default: 'anonymous' },
    compliance: {
      requiresConsent: true,
      consentScopes: ['analytics']
    },
    exampleData: {
      destinations: EXAMPLE_DESTINATIONS,
      hotels: EXAMPLE_HOTELS,
      flight: EXAMPLE_FLIGHT,
      itinerary: EXAMPLE_ITINERARY
    }
  };
}
