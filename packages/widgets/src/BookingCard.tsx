import React from 'react';
import { format } from 'date-fns';
import {
  reservationSchema,
  defaultWidgetConfig,
  type Reservation,
  type WidgetMeta
} from '@conversokit/shared';

export interface BookingCardProps {
  reservation: Reservation;
  onCancel?: () => void;
}

const containerStyle: React.CSSProperties = {
  border: '1px solid var(--ck-border)',
  borderRadius: 'var(--ck-radius-md)',
  padding: 'var(--ck-spacing-4)',
  backgroundColor: 'var(--ck-surface)',
  color: 'var(--ck-text)',
  fontFamily: 'var(--ck-font-family)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ck-spacing-2)',
  maxWidth: 360
};

const statusBadge = (status: Reservation['status']): React.CSSProperties => {
  const colorMap = {
    confirmed: { bg: 'var(--ck-success)', fg: 'white' },
    pending: { bg: 'var(--ck-accent)', fg: 'var(--ck-text)' },
    cancelled: { bg: 'var(--ck-danger)', fg: 'white' }
  } as const;
  const c = colorMap[status];
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 'var(--ck-radius-sm)',
    backgroundColor: c.bg,
    color: c.fg,
    fontSize: 'var(--ck-font-size-sm)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    width: 'fit-content'
  };
};

const cancelBtn: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 'var(--ck-radius-sm)',
  border: '1px solid var(--ck-border)',
  backgroundColor: 'transparent',
  color: 'var(--ck-danger)',
  cursor: 'pointer',
  alignSelf: 'flex-start'
};

export const BookingCard: React.FC<BookingCardProps> = ({
  reservation,
  onCancel
}) => {
  const start = new Date(reservation.startsAt);
  const end = new Date(reservation.endsAt);
  return (
    <div style={containerStyle} data-testid="booking-card">
      <span style={statusBadge(reservation.status)}>{reservation.status}</span>
      <h3 style={{ margin: 0 }}>
        {reservation.resourceName ?? reservation.resourceId}
      </h3>
      <p style={{ margin: 0, color: 'var(--ck-muted)' }}>
        {format(start, 'EEEE, MMMM d')} · {format(start, 'HH:mm')}–
        {format(end, 'HH:mm')}
      </p>
      {reservation.customer && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--ck-font-size-sm)',
            color: 'var(--ck-muted)'
          }}
        >
          For {reservation.customer.name}
          {reservation.customer.email ? ` · ${reservation.customer.email}` : ''}
        </p>
      )}
      {reservation.notes && (
        <p style={{ margin: 0, fontSize: 'var(--ck-font-size-sm)' }}>
          {reservation.notes}
        </p>
      )}
      {reservation.status !== 'cancelled' && onCancel && (
        <button type="button" style={cancelBtn} onClick={onCancel}>
          Cancel reservation
        </button>
      )}
    </div>
  );
};

export const BookingCardMeta: WidgetMeta = {
  name: 'BookingCard',
  category: 'booking',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: { collectPersonalData: true, requiresConsent: true }
  },
  schema: reservationSchema
};
