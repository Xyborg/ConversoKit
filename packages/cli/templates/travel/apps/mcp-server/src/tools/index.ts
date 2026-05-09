import type { Tool } from '@conversokit/shared';
import { listDestinationsTool } from './listDestinations.js';
import { searchHotelsTool } from './searchHotels.js';
import { searchFlightsTool } from './searchFlights.js';
import { getItineraryTool } from './getItinerary.js';

export const tools: Tool[] = [
  listDestinationsTool,
  searchHotelsTool,
  searchFlightsTool,
  getItineraryTool
];
