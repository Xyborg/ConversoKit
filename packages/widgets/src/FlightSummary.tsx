import React from 'react';
import { format } from 'date-fns';
import {
  defaultWidgetConfig,
  flightSummarySchema,
  type FlightLeg,
  type FlightSummary as FlightSummaryData,
  type WidgetMeta
} from '@conversokit/shared';

export interface FlightSummaryProps {
  flight: FlightSummaryData;
  onAction?: (flight: FlightSummaryData) => void;
  ctaLabel?: string;
}

const LegRow: React.FC<{ leg: FlightLeg; label: string }> = ({ leg, label }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 'var(--ck-spacing-2) 0',
      borderBottom: '1px dashed var(--ck-border)',
      gap: 'var(--ck-spacing-2)'
    }}
  >
    <div>
      <div style={{ fontSize: 'var(--ck-font-size-sm)', color: 'var(--ck-muted)' }}>
        {label} · {leg.airline} {leg.flightNumber}
      </div>
      <div
        style={{
          fontSize: 'var(--ck-font-size-lg)',
          fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
        }}
      >
        {leg.origin} → {leg.destination}
      </div>
    </div>
    <div style={{ textAlign: 'right', fontSize: 'var(--ck-font-size-sm)' }}>
      <div>{format(new Date(leg.departsAt), 'MMM d, HH:mm')}</div>
      <div style={{ color: 'var(--ck-muted)' }}>
        arr {format(new Date(leg.arrivesAt), 'HH:mm')}
        {leg.durationMinutes ? ` · ${Math.round(leg.durationMinutes / 60)}h ${leg.durationMinutes % 60}m` : ''}
      </div>
    </div>
  </div>
);

export const FlightSummary: React.FC<FlightSummaryProps> = ({
  flight,
  onAction,
  ctaLabel = 'Select flight'
}) => {
  return (
    <div
      data-testid="flight-summary"
      style={{
        border: '1px solid var(--ck-border)',
        borderRadius: 'var(--ck-radius-md)',
        backgroundColor: 'var(--ck-surface)',
        color: 'var(--ck-text)',
        fontFamily: 'var(--ck-font-family)',
        padding: 'var(--ck-spacing-4)',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ck-spacing-1)'
      }}
    >
      <LegRow leg={flight.outbound} label="Outbound" />
      {flight.return && <LegRow leg={flight.return} label="Return" />}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'var(--ck-spacing-2)'
        }}
      >
        <span style={{ color: 'var(--ck-muted)', fontSize: 'var(--ck-font-size-sm)' }}>
          {flight.bookingClass ?? 'Economy'}
          {typeof flight.stops === 'number'
            ? ` · ${flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}`
            : ''}
        </span>
        <strong style={{ fontSize: 'var(--ck-font-size-lg)' }}>{flight.price}</strong>
      </div>
      {onAction && (
        <button
          type="button"
          onClick={() => onAction(flight)}
          style={{
            marginTop: 'var(--ck-spacing-2)',
            padding: '8px 12px',
            borderRadius: 'var(--ck-radius-sm)',
            border: 'none',
            backgroundColor: 'var(--ck-primary)',
            color: 'var(--ck-primary-foreground)',
            cursor: 'pointer'
          }}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
};

export const FlightSummaryMeta: WidgetMeta = {
  name: 'FlightSummary',
  category: 'travel',
  version: '0.1.0',
  config: { ...defaultWidgetConfig, permissions: {} },
  schema: flightSummarySchema
};
