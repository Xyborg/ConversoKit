import React from 'react';
import { format } from 'date-fns';
import {
  defaultWidgetConfig,
  itinerarySchema,
  type Itinerary,
  type ItineraryStop,
  type WidgetMeta
} from '@conversokit/shared';

export interface ItineraryTimelineProps {
  itinerary: Itinerary;
}

const KIND_ICON: Record<NonNullable<ItineraryStop['kind']>, string> = {
  flight: '✈️',
  hotel: '🏨',
  activity: '🎟️',
  transfer: '🚕'
};

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  itinerary
}) => {
  return (
    <div
      data-testid="itinerary-timeline"
      style={{
        border: '1px solid var(--ck-border)',
        borderRadius: 'var(--ck-radius-md)',
        backgroundColor: 'var(--ck-surface)',
        color: 'var(--ck-text)',
        fontFamily: 'var(--ck-font-family)',
        padding: 'var(--ck-spacing-4)',
        maxWidth: 520
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 'var(--ck-spacing-2)' }}>
        {itinerary.title}
      </h3>
      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ck-spacing-2)'
        }}
      >
        {itinerary.stops.map((stop, idx) => (
          <li
            key={stop.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr',
              gap: 'var(--ck-spacing-2)',
              alignItems: 'flex-start'
            }}
          >
            <div
              aria-hidden
              style={{
                width: 24,
                textAlign: 'center',
                position: 'relative',
                paddingTop: 2
              }}
            >
              <span>{stop.kind ? KIND_ICON[stop.kind] : '•'}</span>
              {idx < itinerary.stops.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 28,
                    backgroundColor: 'var(--ck-border)',
                    margin: '4px auto 0'
                  }}
                />
              )}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
                }}
              >
                {stop.title}
              </div>
              <div
                style={{
                  fontSize: 'var(--ck-font-size-sm)',
                  color: 'var(--ck-muted)'
                }}
              >
                {format(new Date(stop.startsAt), 'EEE MMM d, HH:mm')}
                {stop.endsAt
                  ? ` — ${format(new Date(stop.endsAt), 'HH:mm')}`
                  : ''}
                {stop.location ? ` · ${stop.location}` : ''}
              </div>
              {stop.description && (
                <p style={{ margin: '4px 0 0', fontSize: 'var(--ck-font-size-sm)' }}>
                  {stop.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export const ItineraryTimelineMeta: WidgetMeta = {
  name: 'ItineraryTimeline',
  category: 'travel',
  version: '0.1.0',
  config: { ...defaultWidgetConfig, permissions: {} },
  schema: itinerarySchema
};
