import { z } from 'zod';
import {
  EXAMPLE_FLIGHT,
  defineTool,
  flightSummarySchema
} from '@conversokit/shared';

export const searchFlightsTool = defineTool({
  name: 'search_flights',
  description: 'Search flights by IATA origin and destination.',
  inputSchema: z.object({
    origin: z.string(),
    destination: z.string(),
    departDate: z.string().optional(),
    returnDate: z.string().optional()
  }),
  outputSchema: z.object({ items: z.array(flightSummarySchema) }),
  permissions: { requiresAuth: false },
  async handler() {
    return { items: [EXAMPLE_FLIGHT] };
  }
});
