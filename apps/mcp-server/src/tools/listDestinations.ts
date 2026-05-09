import { z } from 'zod';
import {
  EXAMPLE_DESTINATIONS,
  defineTool,
  destinationSchema
} from '@conversokit/shared';

export const listDestinationsTool = defineTool({
  name: 'list_destinations',
  description:
    'Return curated destination recommendations. Optional free-text filter by name or country.',
  inputSchema: z.object({
    query: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional()
  }),
  outputSchema: z.object({ items: z.array(destinationSchema) }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const lower = input.query?.toLowerCase();
    const matches = lower
      ? EXAMPLE_DESTINATIONS.filter(
          (d) =>
            d.name.toLowerCase().includes(lower) ||
            (d.country?.toLowerCase().includes(lower) ?? false)
        )
      : EXAMPLE_DESTINATIONS;
    return { items: matches.slice(0, input.limit ?? 20) };
  }
});
