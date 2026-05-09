import React, { useEffect, useState } from 'react';
import {
  CTABanner,
  ConsentBanner,
  DestinationRecommendations,
  FlightSummary,
  HotelCard,
  ItineraryTimeline
} from '@conversokit/widgets';
import {
  type Destination,
  type FlightSummary as FlightSummaryData,
  type Hotel,
  type Itinerary
} from '@conversokit/shared';
import { ThemeProvider, travelTheme } from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

const TravelPlanner: React.FC = () => {
  const bridge = useBridge();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [flight, setFlight] = useState<FlightSummaryData | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [picked, setPicked] = useState<Destination | null>(null);

  useEffect(() => {
    bridge
      .callTool('list_destinations', {})
      .then((r) => setDestinations((r as { items: Destination[] }).items))
      .catch(console.error);
  }, [bridge]);

  const pick = async (dest: Destination) => {
    setPicked(dest);
    const [h, f] = await Promise.all([
      bridge.callTool('search_hotels', { query: dest.name }) as Promise<{
        items: Hotel[];
      }>,
      bridge.callTool('search_flights', {
        origin: 'BER',
        destination: dest.name.slice(0, 3).toUpperCase()
      }) as Promise<{ items: FlightSummaryData[] }>
    ]);
    setHotels(h.items);
    setFlight(f.items[0] ?? null);
  };

  const buildItinerary = async () => {
    const r = (await bridge.callTool('get_itinerary', {
      itineraryId: 'demo'
    })) as { itinerary: Itinerary };
    setItinerary(r.itinerary);
  };

  return (
    <>
      <DestinationRecommendations destinations={destinations} onSelect={pick} />
      {picked && (
        <CTABanner
          title={`Plan a trip to ${picked.name}`}
          primaryLabel="Build itinerary"
          onPrimary={buildItinerary}
        />
      )}
      {hotels.map((h) => (
        <HotelCard key={h.id} hotel={h} />
      ))}
      {flight && <FlightSummary flight={flight} />}
      {itinerary && <ItineraryTimeline itinerary={itinerary} />}
    </>
  );
};

const App: React.FC = () => (
  <BridgeProvider baseUrl="http://localhost:3000">
    <ThemeProvider
      theme={travelTheme}
      style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
    >
      <h1>Welcome to <% projectName %></h1>
      <ConsentBanner scopes={['analytics']}>
        <TravelPlanner />
      </ConsentBanner>
    </ThemeProvider>
  </BridgeProvider>
);

export default App;
