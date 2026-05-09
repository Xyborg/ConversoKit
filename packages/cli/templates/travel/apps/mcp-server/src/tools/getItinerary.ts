import { z } from 'zod';
import {
  EXAMPLE_ITINERARY,
  defineTool,
  itinerarySchema
} from '@conversokit/shared';

export const getItineraryTool = defineTool({
  name: 'get_itinerary',
  description: 'Return a saved travel itinerary by id.',
  inputSchema: z.object({ itineraryId: z.string() }),
  outputSchema: z.object({ itinerary: itinerarySchema }),
  permissions: { requiresAuth: false },
  async handler() {
    return { itinerary: EXAMPLE_ITINERARY };
  }
});
