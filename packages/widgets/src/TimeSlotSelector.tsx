import React from 'react';
import { format } from 'date-fns';
import {
  availabilitySchema,
  defaultWidgetConfig,
  type TimeSlot,
  type WidgetMeta
} from '@conversokit/shared';

export interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedSlotId?: string;
  onSelect?: (slot: TimeSlot) => void;
}

const containerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: 'var(--ck-spacing-2)',
  padding: 'var(--ck-spacing-2)',
  fontFamily: 'var(--ck-font-family)'
};

function slotStyle(opts: {
  isSelected: boolean;
  isAvailable: boolean;
}): React.CSSProperties {
  return {
    padding: '10px 12px',
    borderRadius: 'var(--ck-radius-sm)',
    border: '1px solid var(--ck-border)',
    backgroundColor: opts.isSelected
      ? 'var(--ck-primary)'
      : 'var(--ck-surface)',
    color: opts.isSelected ? 'var(--ck-primary-foreground)' : 'var(--ck-text)',
    cursor: opts.isAvailable ? 'pointer' : 'not-allowed',
    opacity: opts.isAvailable ? 1 : 0.5,
    fontSize: 'var(--ck-font-size-sm)',
    textAlign: 'left'
  };
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  slots,
  selectedSlotId,
  onSelect
}) => {
  if (slots.length === 0) {
    return (
      <p style={{ color: 'var(--ck-muted)', padding: 'var(--ck-spacing-2)' }}>
        No times available.
      </p>
    );
  }

  return (
    <div style={containerStyle} data-testid="time-slot-selector">
      {slots.map((slot) => {
        const isSelected = selectedSlotId === slot.id;
        const start = format(new Date(slot.startsAt), 'HH:mm');
        const end = format(new Date(slot.endsAt), 'HH:mm');
        return (
          <button
            key={slot.id}
            type="button"
            disabled={!slot.available}
            onClick={() => slot.available && onSelect?.(slot)}
            style={slotStyle({ isSelected, isAvailable: slot.available })}
            aria-pressed={isSelected}
          >
            <div style={{ fontWeight: 'var(--ck-font-weight-bold)' as unknown as number }}>
              {start}
            </div>
            <div style={{ fontSize: 'var(--ck-font-size-sm)', opacity: 0.85 }}>
              until {end}
              {slot.price ? ` · ${slot.price}` : ''}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export const TimeSlotSelectorMeta: WidgetMeta = {
  name: 'TimeSlotSelector',
  category: 'booking',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: { collectPersonalData: false }
  },
  schema: availabilitySchema
};
