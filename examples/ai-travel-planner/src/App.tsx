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

type TabKey = 'discover' | 'hotels' | 'flights' | 'itinerary';

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ck-spacing-4)'
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '8px 14px',
  borderRadius: 'var(--ck-radius-sm)',
  border: '1px solid var(--ck-border)',
  backgroundColor: active ? 'var(--ck-primary)' : 'var(--ck-surface)',
  color: active ? 'var(--ck-primary-foreground)' : 'var(--ck-text)',
  cursor: 'pointer'
});

const Discover: React.FC<{ onPick: (d: Destination) => void }> = ({ onPick }) => {
  const bridge = useBridge();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bridge
      .callTool('list_destinations', {})
      .then((r) => setDestinations((r as { items: Destination[] }).items))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [bridge]);

  return (
    <div style={sectionStyle}>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      <DestinationRecommendations destinations={destinations} onSelect={onPick} />
    </div>
  );
};

const Hotels: React.FC<{ city?: string }> = ({ city }) => {
  const bridge = useBridge();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bridge
      .callTool('search_hotels', { query: city ?? '' })
      .then((r) => setHotels((r as { items: Hotel[] }).items))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [bridge, city]);

  return (
    <div style={sectionStyle}>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      <h2 style={{ margin: 0 }}>Hotels{city ? ` in ${city}` : ''}</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--ck-spacing-2)'
        }}
      >
        {hotels.map((h) => (
          <HotelCard key={h.id} hotel={h} />
        ))}
      </div>
    </div>
  );
};

const Flights: React.FC<{ destination?: Destination }> = ({ destination }) => {
  const bridge = useBridge();
  const [flight, setFlight] = useState<FlightSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dest = (destination?.name ?? 'LIS').slice(0, 3).toUpperCase();
    bridge
      .callTool('search_flights', { origin: 'BER', destination: dest })
      .then((r) => setFlight((r as { items: FlightSummaryData[] }).items[0] ?? null))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [bridge, destination]);

  return (
    <div style={sectionStyle}>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      <h2 style={{ margin: 0 }}>
        Flights{destination ? ` to ${destination.name}` : ''}
      </h2>
      {flight ? (
        <FlightSummary flight={flight} />
      ) : (
        <p style={{ color: 'var(--ck-muted)' }}>No flights yet — pick a destination first.</p>
      )}
    </div>
  );
};

const Itin: React.FC<{ destination?: Destination }> = ({ destination }) => {
  const bridge = useBridge();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const build = async () => {
    setError(null);
    try {
      const r = (await bridge.callTool('get_itinerary', {
        itineraryId: `demo-${destination?.id ?? 'lisbon'}`
      })) as { itinerary: Itinerary };
      setItinerary({
        ...r.itinerary,
        title: destination ? `${destination.name} long weekend` : r.itinerary.title
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div style={sectionStyle}>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      <CTABanner
        title={`Build itinerary${destination ? ` for ${destination.name}` : ''}`}
        description="Assembles a sample plan from the selected destination, hotels, and flights."
        primaryLabel="Build itinerary"
        onPrimary={build}
      />
      {itinerary && <ItineraryTimeline itinerary={itinerary} />}
    </div>
  );
};

const Planner: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('discover');
  const [picked, setPicked] = useState<Destination | undefined>();

  const handlePick = (d: Destination) => {
    setPicked(d);
    setTab('hotels');
  };

  return (
    <div style={sectionStyle}>
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 'var(--ck-spacing-2)',
          flexWrap: 'wrap'
        }}
      >
        <h1 style={{ margin: 0 }}>AI travel planner</h1>
        {picked && (
          <span style={{ color: 'var(--ck-muted)' }}>
            Planning a trip to <strong>{picked.name}</strong>
          </span>
        )}
      </header>

      <nav style={{ display: 'flex', gap: 'var(--ck-spacing-2)', flexWrap: 'wrap' }}>
        {(
          [
            ['discover', 'Discover'],
            ['hotels', 'Hotels'],
            ['flights', 'Flights'],
            ['itinerary', 'Itinerary']
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            style={tabBtn(tab === key)}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'discover' && <Discover onPick={handlePick} />}
      {tab === 'hotels' && <Hotels city={picked?.name} />}
      {tab === 'flights' && <Flights destination={picked} />}
      {tab === 'itinerary' && <Itin destination={picked} />}
    </div>
  );
};

const App: React.FC = () => (
  <BridgeProvider baseUrl="http://localhost:3000">
    <ThemeProvider
      theme={travelTheme}
      style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
    >
      <ConsentBanner scopes={['analytics']}>
        <Planner />
      </ConsentBanner>
    </ThemeProvider>
  </BridgeProvider>
);

export default App;
