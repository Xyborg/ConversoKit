import React from 'react';
import { z } from 'zod';
import {
  defaultWidgetConfig,
  destinationSchema,
  type Destination,
  type WidgetMeta
} from '@conversokit/shared';

export interface DestinationRecommendationsProps {
  destinations: Destination[];
  onSelect?: (destination: Destination) => void;
}

export const DestinationRecommendations: React.FC<DestinationRecommendationsProps> = ({
  destinations,
  onSelect
}) => {
  return (
    <div
      data-testid="destination-recommendations"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 'var(--ck-spacing-2)',
        fontFamily: 'var(--ck-font-family)'
      }}
    >
      {destinations.map((dest) => (
        <button
          key={dest.id}
          type="button"
          onClick={() => onSelect?.(dest)}
          style={{
            textAlign: 'left',
            cursor: onSelect ? 'pointer' : 'default',
            border: '1px solid var(--ck-border)',
            borderRadius: 'var(--ck-radius-md)',
            backgroundColor: 'var(--ck-surface)',
            color: 'var(--ck-text)',
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {dest.imageUrl && (
            <img
              src={dest.imageUrl}
              alt={dest.name}
              style={{ width: '100%', height: 120, objectFit: 'cover' }}
            />
          )}
          <div
            style={{
              padding: 'var(--ck-spacing-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <strong>{dest.name}</strong>
            {dest.country && (
              <span
                style={{
                  fontSize: 'var(--ck-font-size-sm)',
                  color: 'var(--ck-muted)'
                }}
              >
                {dest.country}
              </span>
            )}
            {dest.tagline && (
              <span style={{ fontSize: 'var(--ck-font-size-sm)' }}>
                {dest.tagline}
              </span>
            )}
            {(dest.bestSeason || dest.averagePrice) && (
              <span
                style={{
                  fontSize: 'var(--ck-font-size-sm)',
                  color: 'var(--ck-muted)'
                }}
              >
                {[dest.bestSeason, dest.averagePrice].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export const destinationRecommendationsSchema = z.object({
  destinations: z.array(destinationSchema)
});

export const DestinationRecommendationsMeta: WidgetMeta = {
  name: 'DestinationRecommendations',
  category: 'travel',
  version: '0.1.0',
  config: { ...defaultWidgetConfig, permissions: {} },
  schema: destinationRecommendationsSchema
};
