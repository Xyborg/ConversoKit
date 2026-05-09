import { z } from 'zod';
import {
  EXAMPLE_FLIGHT,
  defineTool,
  flightSummarySchema
} from '@conversokit/shared';

export const searchFlightsTool = defineTool({
  name: 'search_flights',
  description:
    'Search flights by IATA origin and destination. Returns mock results in dev.',
  inputSchema: z.object({
    origin: z.string().describe('IATA code, e.g. BER'),
    destination: z.string().describe('IATA code, e.g. LIS'),
    departDate: z.string().optional().describe('YYYY-MM-DD'),
    returnDate: z.string().optional()
  }),
  outputSchema: z.object({ items: z.array(flightSummarySchema) }),
  permissions: { requiresAuth: false },
  async handler() {
    return { items: [EXAMPLE_FLIGHT] };
  }
});
