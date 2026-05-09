import type { Tool } from '@conversokit/shared';
import { searchProductsTool } from './searchProducts.js';
import { getCartTool } from './getCart.js';
import { setCartTool } from './setCart.js';
import { createCheckoutTool } from './createCheckout.js';
import { getAvailabilityTool } from './getAvailability.js';
import { createReservationTool } from './createReservation.js';
import { cancelReservationTool } from './cancelReservation.js';
import { submitLeadTool } from './submitLead.js';
import { searchHotelsTool } from './searchHotels.js';
import { searchFlightsTool } from './searchFlights.js';
import { getItineraryTool } from './getItinerary.js';
import { listDestinationsTool } from './listDestinations.js';
import { getKpisTool } from './getKpis.js';
import { getTrendSeriesTool } from './getTrendSeries.js';
import { getAnalyticsPanelTool } from './getAnalyticsPanel.js';
import { getAlertsTool } from './getAlerts.js';

export const tools: Tool[] = [
  searchProductsTool,
  getCartTool,
  setCartTool,
  createCheckoutTool,
  getAvailabilityTool,
  createReservationTool,
  cancelReservationTool,
  submitLeadTool,
  searchHotelsTool,
  searchFlightsTool,
  getItineraryTool,
  listDestinationsTool,
  getKpisTool,
  getTrendSeriesTool,
  getAnalyticsPanelTool,
  getAlertsTool
];
