import { z } from 'zod';
import { defineTool } from '@conversokit/shared';
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

// Rendering does not perform a business mutation. Widgets call the data tools through MCP.
tools.push(
  defineTool({
    name: 'show_app',
    description: 'Open the interactive app to browse data and perform actions.',
    inputSchema: z.object({}),
    outputSchema: z.object({ ready: z.boolean() }),
    permissions: {},
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    widget: 'ui://conversokit/app-v1.html',
    async handler() {
      return { ready: true };
    }
  })
);
