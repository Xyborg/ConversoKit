import React, { useEffect, useState } from 'react';
import {
  AvailabilityCalendar,
  BookingCard,
  CTABanner,
  ConsentBanner,
  TimeSlotSelector
} from '@conversokit/widgets';
import { type Reservation, type TimeSlot } from '@conversokit/shared';
import { ThemeProvider, lightTheme } from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

const COACHES = [
  { id: 'coach-mira', label: 'Mira (eng. management)' },
  { id: 'coach-jules', label: 'Jules (product strategy)' },
  { id: 'coach-asha', label: 'Asha (career transitions)' }
];

const today = () => new Date().toISOString().slice(0, 10);

const Booking: React.FC = () => {
  const bridge = useBridge();
  const [coach, setCoach] = useState(COACHES[0].id);
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slot, setSlot] = useState<TimeSlot | undefined>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bridge
      .callTool('get_availability', {
        resourceId: coach,
        from: `${date}T00:00:00Z`,
        to: `${date}T23:59:59Z`
      })
      .then((r) =>
        setSlots((r as { days: Array<{ slots: TimeSlot[] }> }).days[0]?.slots ?? [])
      )
      .catch((e) => setError(String(e)));
  }, [bridge, coach, date]);

  const confirm = async () => {
    if (!slot) return;
    setError(null);
    try {
      const r = (await bridge.callTool('create_reservation', {
        resourceId: coach,
        slotId: slot.id,
        customer: { name: 'Demo User', email: 'demo@example.com' }
      })) as { reservation: Reservation };
      setReservation(r.reservation);
      const e = (await bridge.callTool('confirm_booking_email', {
        reservationId: r.reservation.id
      })) as { sentTo?: string; provider: string };
      setEmailSent(e.sentTo ? `${e.sentTo} (via ${e.provider})` : `(via ${e.provider})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirm failed');
    }
  };

  if (reservation) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ck-spacing-4)' }}>
        <BookingCard reservation={reservation} />
        <CTABanner
          title="Confirmation email sent"
          description={emailSent ?? 'No email available.'}
          variant="success"
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ck-spacing-4)' }}>
      <h1 style={{ margin: 0 }}>Book a coaching call</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {COACHES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCoach(c.id)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--ck-radius-sm)',
              border: '1px solid var(--ck-border)',
              backgroundColor: c.id === coach ? 'var(--ck-primary)' : 'var(--ck-surface)',
              color: c.id === coach ? 'var(--ck-primary-foreground)' : 'var(--ck-text)',
              cursor: 'pointer'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      <AvailabilityCalendar
        availableDates={[date]}
        selectedDate={date}
        onSelect={setDate}
      />
      <TimeSlotSelector slots={slots} selectedSlotId={slot?.id} onSelect={setSlot} />
      {slot && (
        <CTABanner
          title="Confirm reservation"
          description={`${slot.startsAt} with ${COACHES.find((c) => c.id === coach)?.label}`}
          primaryLabel="Confirm + send email"
          onPrimary={confirm}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <BridgeProvider baseUrl="http://localhost:3000">
    <ThemeProvider
      theme={lightTheme}
      style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
    >
      <ConsentBanner scopes={['personalData']}>
        <Booking />
      </ConsentBanner>
    </ThemeProvider>
  </BridgeProvider>
);

export default App;
