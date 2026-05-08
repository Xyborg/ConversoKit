import React, { useMemo, useState } from 'react';
import {
  addDays,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek
} from 'date-fns';
import { z } from 'zod';
import { defaultWidgetConfig, type WidgetMeta } from '@conversokit/shared';

export interface AvailabilityCalendarProps {
  /** Initial month to display. Defaults to today. */
  initialMonth?: Date;
  /** Days that have at least one available slot (ISO yyyy-MM-dd). */
  availableDates?: string[];
  /** Currently selected date (yyyy-MM-dd). */
  selectedDate?: string;
  onSelect?: (date: string) => void;
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 'var(--ck-spacing-1)'
};

const headStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 'var(--ck-spacing-2)'
};

const dayLabelStyle: React.CSSProperties = {
  fontSize: 'var(--ck-font-size-sm)',
  color: 'var(--ck-muted)',
  textAlign: 'center',
  padding: 'var(--ck-spacing-1)'
};

function dayCellStyle(opts: {
  isSelected: boolean;
  isAvailable: boolean;
  isOtherMonth: boolean;
}): React.CSSProperties {
  return {
    padding: '8px 0',
    textAlign: 'center',
    borderRadius: 'var(--ck-radius-sm)',
    cursor: opts.isAvailable ? 'pointer' : 'default',
    backgroundColor: opts.isSelected
      ? 'var(--ck-primary)'
      : opts.isAvailable
        ? 'var(--ck-background)'
        : 'transparent',
    color: opts.isSelected
      ? 'var(--ck-primary-foreground)'
      : opts.isOtherMonth
        ? 'var(--ck-muted)'
        : opts.isAvailable
          ? 'var(--ck-text)'
          : 'var(--ck-muted)',
    border: opts.isAvailable
      ? '1px solid var(--ck-border)'
      : '1px solid transparent',
    opacity: opts.isAvailable ? 1 : 0.5,
    fontSize: 'var(--ck-font-size-sm)'
  };
}

const navBtn: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 'var(--ck-radius-sm)',
  border: '1px solid var(--ck-border)',
  backgroundColor: 'var(--ck-surface)',
  color: 'var(--ck-text)',
  cursor: 'pointer'
};

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  initialMonth,
  availableDates = [],
  selectedDate,
  onSelect
}) => {
  const [month, setMonth] = useState<Date>(initialMonth ?? new Date());
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const list: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i);
      list.push(d);
      if (i >= 27 && d > monthEnd) break;
    }
    while (list.length % 7 !== 0) list.push(addDays(list[list.length - 1], 1));
    return list;
  }, [month]);

  const selected = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;

  return (
    <div
      style={{
        backgroundColor: 'var(--ck-surface)',
        border: '1px solid var(--ck-border)',
        borderRadius: 'var(--ck-radius-md)',
        padding: 'var(--ck-spacing-4)',
        fontFamily: 'var(--ck-font-family)',
        color: 'var(--ck-text)',
        maxWidth: 360
      }}
      data-testid="availability-calendar"
    >
      <div style={headStyle}>
        <button
          type="button"
          style={navBtn}
          onClick={() => setMonth(addDays(startOfMonth(month), -1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <strong>{format(month, 'MMMM yyyy')}</strong>
        <button
          type="button"
          style={navBtn}
          onClick={() => setMonth(addDays(endOfMonth(month), 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div style={gridStyle}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
          <div key={label} style={dayLabelStyle}>
            {label}
          </div>
        ))}
        {days.map((day) => {
          const iso = format(day, 'yyyy-MM-dd');
          const isAvailable = availableSet.has(iso);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isOtherMonth = !isSameMonth(day, month);
          return (
            <button
              key={iso}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelect?.(iso)}
              style={dayCellStyle({ isSelected, isAvailable, isOtherMonth })}
              aria-pressed={isSelected}
              aria-label={iso}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const availabilityCalendarSchema = z.object({
  availableDates: z.array(z.string()).optional(),
  selectedDate: z.string().optional()
});

export const AvailabilityCalendarMeta: WidgetMeta = {
  name: 'AvailabilityCalendar',
  category: 'booking',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: { collectPersonalData: false }
  },
  schema: availabilityCalendarSchema
};
