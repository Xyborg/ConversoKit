import React, { useEffect, useState } from 'react';
import {
  AddToCartPanel,
  AlertFeed,
  AnalyticsPanel,
  AvailabilityCalendar,
  BookingCard,
  CTABanner,
  CheckoutSummary,
  ConsentBanner,
  DestinationRecommendations,
  FlightSummary,
  HotelCard,
  ItineraryTimeline,
  MultiStepForm,
  ProductCarousel,
  TimeSlotSelector,
  type ProductCardProps
} from '@conversokit/widgets';
import {
  EXAMPLE_AVAILABILITY,
  EXAMPLE_CHECKOUT_SUMMARY,
  EXAMPLE_LEAD_FORM,
  type Alert,
  type AnalyticsPanel as AnalyticsPanelData,
  type CartItem,
  type Destination,
  type FlightSummary as FlightSummaryData,
  type Hotel,
  type Itinerary,
  type Reservation,
  type TimeSlot
} from '@conversokit/shared';
import {
  ThemeProvider,
  themes,
  type Theme
} from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

type TabKey = 'commerce' | 'booking' | 'leadgen' | 'travel' | 'dashboard';

const themeNames = Object.keys(themes);

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '8px 14px',
  borderRadius: 'var(--ck-radius-sm)',
  border: '1px solid var(--ck-border)',
  backgroundColor: active ? 'var(--ck-primary)' : 'var(--ck-surface)',
  color: active ? 'var(--ck-primary-foreground)' : 'var(--ck-text)',
  cursor: 'pointer'
});

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ck-spacing-4)'
};

const CommerceTab: React.FC = () => {
  const bridge = useBridge();
  const [items, setItems] = useState<ProductCardProps[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [stage, setStage] = useState<'browse' | 'cart'>('browse');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = (await bridge.callTool('search_products', {
          query: '',
          limit: 10
        })) as { items: ProductCardProps[] };
        if (!cancelled) setItems(result.items);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  const handleCheckout = async () => {
    setCheckoutError(null);
    try {
      // Persist cart server-side, then start checkout.
      await bridge.callTool('set_cart', { items: cart, currency: 'USD' });
      const result = (await bridge.callTool('create_checkout', {
        successUrl: window.location.origin + '/?status=success',
        cancelUrl: window.location.origin + '/?status=cancelled'
      })) as { url: string; provider: string };
      const opener = window.openai?.openExternalUrl;
      if (opener) {
        await opener(result.url);
      } else {
        window.location.href = result.url;
      }
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : 'Checkout failed'
      );
    }
  };

  if (stage === 'cart') {
    return (
      <div style={sectionStyle}>
        {checkoutError && (
          <CTABanner
            title="Checkout failed"
            description={checkoutError}
            variant="danger"
          />
        )}
        <CheckoutSummary
          summary={{
            ...EXAMPLE_CHECKOUT_SUMMARY,
            items: cart.length ? cart : EXAMPLE_CHECKOUT_SUMMARY.items
          }}
          onBack={() => setStage('browse')}
          onCheckout={handleCheckout}
        />
      </div>
    );
  }

  return (
    <div style={sectionStyle}>
      <ProductCarousel items={items} />
      {items[0] && (
        <AddToCartPanel
          product={items[0]}
          onAdd={(item) => {
            setCart((c) => [...c, item]);
            setStage('cart');
          }}
        />
      )}
    </div>
  );
};

const BookingTab: React.FC = () => {
  const bridge = useBridge();
  const [date, setDate] = useState<string | undefined>(undefined);
  const [slot, setSlot] = useState<TimeSlot | undefined>(undefined);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the example date as the only "available" date for the demo.
  const availableDates = [EXAMPLE_AVAILABILITY.date];

  const handleConfirm = async () => {
    if (!slot) return;
    setError(null);
    try {
      const result = (await bridge.callTool('create_reservation', {
        resourceId: EXAMPLE_AVAILABILITY.resourceId,
        slotId: slot.id,
        customer: { name: 'Demo User' }
      })) as { reservation: Reservation };
      setReservation(result.reservation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reservation failed');
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;
    try {
      const result = (await bridge.callTool('cancel_reservation', {
        reservationId: reservation.id
      })) as { reservation: Reservation };
      setReservation(result.reservation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancellation failed');
    }
  };

  if (reservation) {
    return (
      <div style={sectionStyle}>
        <BookingCard reservation={reservation} onCancel={handleCancel} />
        {error && <CTABanner title="Error" description={error} variant="danger" />}
        <CTABanner
          title="Need another time?"
          primaryLabel="Start over"
          onPrimary={() => {
            setReservation(null);
            setSlot(undefined);
            setDate(undefined);
            setError(null);
          }}
        />
      </div>
    );
  }

  return (
    <div style={sectionStyle}>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      <AvailabilityCalendar
        availableDates={availableDates}
        selectedDate={date}
        onSelect={setDate}
      />
      {date && (
        <TimeSlotSelector
          slots={EXAMPLE_AVAILABILITY.slots}
          selectedSlotId={slot?.id}
          onSelect={setSlot}
        />
      )}
      {slot && (
        <CTABanner
          title="Confirm reservation"
          description={`${EXAMPLE_AVAILABILITY.resourceName} on ${date}`}
          primaryLabel="Confirm"
          onPrimary={handleConfirm}
        />
      )}
    </div>
  );
};

const LeadGenTab: React.FC = () => {
  const bridge = useBridge();
  const [submitted, setSubmitted] = useState<{
    leadId: string;
    provider: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <div style={sectionStyle}>
        <CTABanner
          title="Thanks — we'll be in touch."
          description={`Lead ${submitted.leadId} synced via ${submitted.provider}.`}
          variant="success"
          primaryLabel="Submit another"
          onPrimary={() => setSubmitted(null)}
        />
      </div>
    );
  }
  return (
    <div style={sectionStyle}>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      <MultiStepForm
        form={EXAMPLE_LEAD_FORM}
        onComplete={async (values) => {
          setError(null);
          try {
            const result = (await bridge.callTool('submit_lead', {
              formId: EXAMPLE_LEAD_FORM.id,
              values,
              submittedAt: new Date().toISOString()
            })) as { leadId: string; provider: string };
            setSubmitted(result);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Submission failed');
          }
        }}
      />
    </div>
  );
};

const TravelTab: React.FC = () => {
  const bridge = useBridge();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [flight, setFlight] = useState<FlightSummaryData | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [picked, setPicked] = useState<Destination | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = (await bridge.callTool('list_destinations', {})) as {
          items: Destination[];
        };
        if (!cancelled) setDestinations(r.items);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load destinations');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  const handlePick = async (dest: Destination) => {
    setPicked(dest);
    setError(null);
    try {
      const [hotelRes, flightRes] = await Promise.all([
        bridge.callTool('search_hotels', { query: dest.name }) as Promise<{
          items: Hotel[];
        }>,
        bridge.callTool('search_flights', {
          origin: 'BER',
          destination: dest.name.slice(0, 3).toUpperCase()
        }) as Promise<{ items: FlightSummaryData[] }>
      ]);
      setHotels(hotelRes.items);
      setFlight(flightRes.items[0] ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Travel lookup failed');
    }
  };

  const handleBuildItinerary = async () => {
    setError(null);
    try {
      const r = (await bridge.callTool('get_itinerary', {
        itineraryId: 'demo'
      })) as { itinerary: Itinerary };
      setItinerary(r.itinerary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Itinerary failed');
    }
  };

  return (
    <div style={sectionStyle}>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      <DestinationRecommendations
        destinations={destinations}
        onSelect={handlePick}
      />
      {picked && (
        <CTABanner
          title={`Plan a trip to ${picked.name}`}
          description="Hotels and flights below — click 'Build itinerary' to assemble a sample plan."
          primaryLabel="Build itinerary"
          onPrimary={handleBuildItinerary}
        />
      )}
      {hotels.length > 0 && (
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
      )}
      {flight && <FlightSummary flight={flight} />}
      {itinerary && <ItineraryTimeline itinerary={itinerary} />}
    </div>
  );
};

const DashboardTab: React.FC = () => {
  const bridge = useBridge();
  const [panel, setPanel] = useState<AnalyticsPanelData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [panelRes, alertsRes] = await Promise.all([
          bridge.callTool('get_analytics_panel', {}) as Promise<{
            panel: AnalyticsPanelData;
          }>,
          bridge.callTool('get_alerts', {}) as Promise<{ items: Alert[] }>
        ]);
        if (!cancelled) {
          setPanel(panelRes.panel);
          setAlerts(alertsRes.items);
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Dashboard load failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  return (
    <div style={sectionStyle}>
      {error && (
        <CTABanner
          title="Dashboard tools require auth"
          description={`${error} — set CONVERSOKIT_API_KEYS in apps/mcp-server/.env and pass it via VITE_CONVERSOKIT_API_KEY.`}
          variant="danger"
        />
      )}
      {panel && <AnalyticsPanel panel={panel} />}
      <h3 style={{ margin: 0 }}>Alerts</h3>
      <AlertFeed
        alerts={alerts}
        onAcknowledge={(a) =>
          setAlerts((current) => current.filter((x) => x.id !== a.id))
        }
      />
    </div>
  );
};

const App: React.FC = () => {
  const [themeName, setThemeName] = useState<string>('light');
  const [tab, setTab] = useState<TabKey>('commerce');
  const theme: Theme = themes[themeName];
  const apiKey = (import.meta.env?.VITE_CONVERSOKIT_API_KEY as string) || undefined;

  return (
    <BridgeProvider baseUrl="http://localhost:3000" apiKey={apiKey}>
      <ThemeProvider
        theme={theme}
        style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--ck-spacing-4)',
            gap: 'var(--ck-spacing-4)',
            flexWrap: 'wrap'
          }}
        >
          <h1 style={{ margin: 0 }}>ConversoKit Widgets</h1>
          <label
            style={{ fontSize: 'var(--ck-font-size-sm)', color: 'var(--ck-muted)' }}
          >
            Theme:{' '}
            <select
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              style={{
                padding: '6px 8px',
                borderRadius: 'var(--ck-radius-sm)',
                border: '1px solid var(--ck-border)',
                backgroundColor: 'var(--ck-surface)',
                color: 'var(--ck-text)'
              }}
            >
              {themeNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </header>

        <nav
          style={{
            display: 'flex',
            gap: 'var(--ck-spacing-2)',
            marginBottom: 'var(--ck-spacing-4)'
          }}
        >
          {(
            [
              ['commerce', 'Commerce'],
              ['booking', 'Booking'],
              ['leadgen', 'Lead Gen'],
              ['travel', 'Travel'],
              ['dashboard', 'Dashboard']
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

        <ConsentBanner
          scopes={['analytics', 'personalData']}
          message="ConversoKit demo. Click accept so the booking + lead-gen flows can submit personal data."
        >
          {tab === 'commerce' && <CommerceTab />}
          {tab === 'booking' && <BookingTab />}
          {tab === 'leadgen' && <LeadGenTab />}
          {tab === 'travel' && <TravelTab />}
          {tab === 'dashboard' && <DashboardTab />}
        </ConsentBanner>
      </ThemeProvider>
    </BridgeProvider>
  );
};

export default App;
