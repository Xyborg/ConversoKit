import React, { useState } from 'react';
import {
  AvailabilityCalendar,
  BookingCard,
  CTABanner,
  ConsentBanner,
  TimeSlotSelector
} from '@conversokit/widgets';
import {
  EXAMPLE_AVAILABILITY,
  type Reservation,
  type TimeSlot
} from '@conversokit/shared';
import { ThemeProvider, lightTheme } from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

const Booking: React.FC = () => {
  const bridge = useBridge();
  const [date, setDate] = useState<string | undefined>();
  const [slot, setSlot] = useState<TimeSlot | undefined>();
  const [reservation, setReservation] = useState<Reservation | null>(null);

  const confirm = async () => {
    if (!slot) return;
    const r = (await bridge.callTool('create_reservation', {
      resourceId: EXAMPLE_AVAILABILITY.resourceId,
      slotId: slot.id,
      customer: { name: 'Demo User' }
    })) as { reservation: Reservation };
    setReservation(r.reservation);
  };

  if (reservation) {
    return (
      <BookingCard
        reservation={reservation}
        onCancel={async () => {
          const r = (await bridge.callTool('cancel_reservation', {
            reservationId: reservation.id
          })) as { reservation: Reservation };
          setReservation(r.reservation);
        }}
      />
    );
  }

  return (
    <>
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
        <CTABanner title="Confirm reservation" primaryLabel="Confirm" onPrimary={confirm} />
      )}
    </>
  );
};

const App: React.FC = () => (
  <BridgeProvider baseUrl="http://localhost:3000">
    <ThemeProvider theme={lightTheme} style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}>
      <h1>Welcome to <% projectName %></h1>
      <ConsentBanner scopes={['personalData']}>
        <Booking />
      </ConsentBanner>
    </ThemeProvider>
  </BridgeProvider>
);

export default App;
