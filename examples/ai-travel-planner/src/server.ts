import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import {
  defineTool,
  destinationSchema,
  flightSummarySchema,
  hotelSchema,
  itinerarySchema,
  EXAMPLE_DESTINATIONS,
  EXAMPLE_FLIGHT,
  EXAMPLE_HOTELS,
  EXAMPLE_ITINERARY,
  type Destination,
  type FlightSummary,
  type Hotel,
  type Itinerary,
  type Tool
} from '@conversokit/shared';

const DESTINATIONS: Destination[] = EXAMPLE_DESTINATIONS;
const HOTELS: Hotel[] = EXAMPLE_HOTELS;
const FLIGHT: FlightSummary = EXAMPLE_FLIGHT;
const ITINERARY: Itinerary = EXAMPLE_ITINERARY;

const listDestinations = defineTool({
  name: 'list_destinations',
  description: 'Curated travel destinations the planner can recommend.',
  inputSchema: z.object({ query: z.string().optional() }),
  outputSchema: z.object({ items: z.array(destinationSchema) }),
  permissions: { requiresAuth: false },
  async handler(input) {
    if (!input.query) return { items: DESTINATIONS };
    const q = input.query.toLowerCase();
    return {
      items: DESTINATIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.country?.toLowerCase().includes(q) ?? false) ||
          (d.tagline?.toLowerCase().includes(q) ?? false)
      )
    };
  }
});

const searchHotels = defineTool({
  name: 'search_hotels',
  description: 'Search hotels by free-text city or country.',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(20).optional()
  }),
  outputSchema: z.object({ items: z.array(hotelSchema) }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const q = input.query.toLowerCase();
    const matches = HOTELS.filter(
      (h) =>
        h.city.toLowerCase().includes(q) ||
        h.name.toLowerCase().includes(q) ||
        (h.country?.toLowerCase().includes(q) ?? false)
    );
    const items = matches.length ? matches : HOTELS;
    return { items: items.slice(0, input.limit ?? 10) };
  }
});

const searchFlights = defineTool({
  name: 'search_flights',
  description: 'Mock flight search returning a single round-trip option.',
  inputSchema: z.object({
    origin: z.string(),
    destination: z.string()
  }),
  outputSchema: z.object({ items: z.array(flightSummarySchema) }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const flight: FlightSummary = {
      ...FLIGHT,
      id: `flight-${input.origin}-${input.destination}`,
      outbound: {
        ...FLIGHT.outbound,
        origin: input.origin,
        destination: input.destination
      },
      return: FLIGHT.return && {
        ...FLIGHT.return,
        origin: input.destination,
        destination: input.origin
      }
    };
    return { items: [flight] };
  }
});

const getItinerary = defineTool({
  name: 'get_itinerary',
  description: 'Return a sample itinerary the planner can render in a timeline.',
  inputSchema: z.object({ itineraryId: z.string() }),
  outputSchema: z.object({ itinerary: itinerarySchema }),
  permissions: { requiresAuth: false },
  async handler(input) {
    return { itinerary: { ...ITINERARY, id: input.itineraryId } };
  }
});

const tools: Tool[] = [listDestinations, searchHotels, searchFlights, getItinerary];

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/tools', (_req, res) => {
  res.json({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      permissions: t.permissions
    }))
  });
});

app.post('/tools/:name', async (req, res) => {
  const tool = tools.find((t) => t.name === req.params.name);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  try {
    const input = tool.inputSchema.parse(req.body);
    const sessionId = req.header('x-conversokit-session') ?? 'demo-session';
    const output = await tool.handler(input, { sessionId, logger: console });
    res.json(output);
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Tool execution failed'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI travel planner MCP server listening on :${PORT}`);
});
