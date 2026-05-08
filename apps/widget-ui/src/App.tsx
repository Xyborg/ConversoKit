import React, { useEffect, useState } from 'react';
import {
  AddToCartPanel,
  AvailabilityCalendar,
  BookingCard,
  CTABanner,
  CheckoutSummary,
  ConsentBanner,
  MultiStepForm,
  ProductCarousel,
  TimeSlotSelector,
  type LeadFormValues,
  type ProductCardProps
} from '@conversokit/widgets';
import {
  EXAMPLE_AVAILABILITY,
  EXAMPLE_CHECKOUT_SUMMARY,
  EXAMPLE_LEAD_FORM,
  type CartItem,
  type Reservation,
  type TimeSlot
} from '@conversokit/shared';
import {
  ThemeProvider,
  themes,
  type Theme
} from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

type TabKey = 'commerce' | 'booking' | 'leadgen';

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

  if (stage === 'cart') {
    return (
      <div style={sectionStyle}>
        <CTABanner
          title="Order ready"
          description="This is mock data — Stripe wires up in Phase 3."
          variant="info"
        />
        <CheckoutSummary
          summary={{ ...EXAMPLE_CHECKOUT_SUMMARY, items: cart.length ? cart : EXAMPLE_CHECKOUT_SUMMARY.items }}
          onBack={() => setStage('browse')}
          onCheckout={() => alert('Checkout will redirect to Stripe in Phase 3')}
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
  const [date, setDate] = useState<string | undefined>(undefined);
  const [slot, setSlot] = useState<TimeSlot | undefined>(undefined);
  const [reservation, setReservation] = useState<Reservation | null>(null);

  if (reservation) {
    return (
      <div style={sectionStyle}>
        <BookingCard
          reservation={reservation}
          onCancel={() =>
            setReservation({ ...reservation, status: 'cancelled' })
          }
        />
        <CTABanner
          title="Need another time?"
          primaryLabel="Start over"
          onPrimary={() => {
            setReservation(null);
            setSlot(undefined);
            setDate(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div style={sectionStyle}>
      <AvailabilityCalendar
        availableDates={[EXAMPLE_AVAILABILITY.date]}
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
          onPrimary={() =>
            setReservation({
              id: `res-${Date.now()}`,
              resourceId: EXAMPLE_AVAILABILITY.resourceId,
              resourceName: EXAMPLE_AVAILABILITY.resourceName,
              slotId: slot.id,
              startsAt: slot.startsAt,
              endsAt: slot.endsAt,
              status: 'confirmed'
            })
          }
        />
      )}
    </div>
  );
};

const LeadGenTab: React.FC = () => {
  const [submitted, setSubmitted] = useState<LeadFormValues | null>(null);

  if (submitted) {
    return (
      <div style={sectionStyle}>
        <CTABanner
          title="Thanks — we'll be in touch."
          description={JSON.stringify(submitted)}
          variant="success"
          primaryLabel="Submit another"
          onPrimary={() => setSubmitted(null)}
        />
      </div>
    );
  }
  return (
    <MultiStepForm
      form={EXAMPLE_LEAD_FORM}
      onComplete={(values) => setSubmitted(values)}
    />
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
              ['leadgen', 'Lead Gen']
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
        </ConsentBanner>
      </ThemeProvider>
    </BridgeProvider>
  );
};

export default App;
