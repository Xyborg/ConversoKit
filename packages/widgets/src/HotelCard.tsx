import React from 'react';
import {
  defaultWidgetConfig,
  hotelSchema,
  type Hotel,
  type WidgetMeta
} from '@conversokit/shared';

export interface HotelCardProps {
  hotel: Hotel;
  ctaLabel?: string;
  onAction?: (hotel: Hotel) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  ctaLabel = 'Book',
  onAction
}) => {
  return (
    <div
      data-testid="hotel-card"
      style={{
        border: '1px solid var(--ck-border)',
        borderRadius: 'var(--ck-radius-md)',
        backgroundColor: 'var(--ck-surface)',
        color: 'var(--ck-text)',
        fontFamily: 'var(--ck-font-family)',
        width: 280,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {hotel.imageUrl && (
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          style={{ width: '100%', height: 160, objectFit: 'cover' }}
        />
      )}
      <div
        style={{
          padding: 'var(--ck-spacing-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ck-spacing-1)'
        }}
      >
        <strong style={{ fontSize: 'var(--ck-font-size-lg)' }}>{hotel.name}</strong>
        <span style={{ color: 'var(--ck-muted)', fontSize: 'var(--ck-font-size-sm)' }}>
          {hotel.city}
          {hotel.country ? `, ${hotel.country}` : ''}
        </span>
        {hotel.rating !== undefined && (
          <span style={{ fontSize: 'var(--ck-font-size-sm)' }}>
            ⭐ {hotel.rating.toFixed(1)}
          </span>
        )}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              marginTop: 'var(--ck-spacing-1)'
            }}
          >
            {hotel.amenities.map((a) => (
              <span
                key={a}
                style={{
                  fontSize: 'var(--ck-font-size-sm)',
                  border: '1px solid var(--ck-border)',
                  borderRadius: 'var(--ck-radius-sm)',
                  padding: '2px 6px',
                  color: 'var(--ck-muted)'
                }}
              >
                {a}
              </span>
            ))}
          </div>
        )}
        <span
          style={{
            marginTop: 'var(--ck-spacing-2)',
            fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
          }}
        >
          {hotel.pricePerNight} <span style={{ color: 'var(--ck-muted)', fontWeight: 400 }}>/ night</span>
        </span>
        {onAction && (
          <button
            type="button"
            onClick={() => onAction(hotel)}
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
    </div>
  );
};

export const HotelCardMeta: WidgetMeta = {
  name: 'HotelCard',
  category: 'travel',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: { allowsExternalLinks: true }
  },
  schema: hotelSchema
};
