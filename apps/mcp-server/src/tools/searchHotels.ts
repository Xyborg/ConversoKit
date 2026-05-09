import { z } from 'zod';
import {
  EXAMPLE_HOTELS,
  defineTool,
  hotelSchema
} from '@conversokit/shared';

export const searchHotelsTool = defineTool({
  name: 'search_hotels',
  description:
    'Search hotels by free-text query (matches city or hotel name). Returns mock results in dev.',
  inputSchema: z.object({
    query: z.string().describe('City, hotel name, or free-text phrase'),
    limit: z.number().int().min(1).max(50).optional()
  }),
  outputSchema: z.object({ items: z.array(hotelSchema) }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const { query, limit = 10 } = input;
    const lower = query.toLowerCase();
    const matches = lower
      ? EXAMPLE_HOTELS.filter(
          (h) =>
            h.name.toLowerCase().includes(lower) ||
            h.city.toLowerCase().includes(lower) ||
            (h.country?.toLowerCase().includes(lower) ?? false)
        )
      : EXAMPLE_HOTELS;
    return { items: matches.slice(0, limit) };
  }
});
