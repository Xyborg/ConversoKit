# AI travel planner — ConversoKit example

A runnable, four-tab travel planner built on top of `@conversokit/widgets` (`HotelCard`, `FlightSummary`, `ItineraryTimeline`, `DestinationRecommendations`) and a tiny Express MCP server that mocks the `list_destinations`, `search_hotels`, `search_flights`, and `get_itinerary` tools.

## Run it

```bash
pnpm install     # from the repo root
pnpm --filter example-ai-travel-planner dev
```

This starts both the MCP server (`http://localhost:3000`) and the Vite UI (`http://localhost:5173`).

## What's inside

- **`src/App.tsx`** — four tabs (Discover · Hotels · Flights · Itinerary). Picking a destination on Discover propagates to Hotels and Flights and seeds the itinerary.
- **`src/server.ts`** — Express server defining four tools backed by the example travel data exported from `@conversokit/shared` (`EXAMPLE_DESTINATIONS`, `EXAMPLE_HOTELS`, `EXAMPLE_FLIGHT`, `EXAMPLE_ITINERARY`).
- **Theme** — `travelTheme` from `@conversokit/themes`.
- **Consent** — wraps the UI in `ConsentBanner` with the `analytics` scope.

## Going further

Replace the in-memory data sources in `src/server.ts` with real APIs (Amadeus, Booking.com, Skyscanner, etc.). The widgets and the wire-format are unchanged — that's the point of the boilerplate.
