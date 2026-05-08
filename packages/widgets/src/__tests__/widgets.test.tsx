import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../ProductCard.js';
import { ProductCarousel } from '../ProductCarousel.js';
import { CheckoutSummary } from '../CheckoutSummary.js';
import { AddToCartPanel } from '../AddToCartPanel.js';
import { AvailabilityCalendar } from '../AvailabilityCalendar.js';
import { TimeSlotSelector } from '../TimeSlotSelector.js';
import { BookingCard } from '../BookingCard.js';
import { LeadCaptureForm } from '../LeadCaptureForm.js';
import { MultiStepForm } from '../MultiStepForm.js';
import { CTABanner } from '../CTABanner.js';
import {
  EXAMPLE_AVAILABILITY,
  EXAMPLE_CHECKOUT_SUMMARY,
  EXAMPLE_LEAD_FORM,
  EXAMPLE_PRODUCTS
} from '@conversokit/shared';

describe('widget render smoke tests', () => {
  it('ProductCard shows title + price', () => {
    render(<ProductCard {...EXAMPLE_PRODUCTS[0]} />);
    expect(screen.getByText(EXAMPLE_PRODUCTS[0].title)).toBeTruthy();
  });

  it('ProductCarousel renders all items', () => {
    render(<ProductCarousel items={EXAMPLE_PRODUCTS} />);
    for (const p of EXAMPLE_PRODUCTS) {
      expect(screen.getByText(p.title)).toBeTruthy();
    }
  });

  it('CheckoutSummary fires onCheckout', () => {
    const handler = vi.fn();
    render(
      <CheckoutSummary summary={EXAMPLE_CHECKOUT_SUMMARY} onCheckout={handler} />
    );
    fireEvent.click(screen.getByText('Checkout'));
    expect(handler).toHaveBeenCalled();
  });

  it('AddToCartPanel increments and emits the cart item', () => {
    const handler = vi.fn();
    render(<AddToCartPanel product={EXAMPLE_PRODUCTS[0]} onAdd={handler} />);
    fireEvent.click(screen.getByLabelText('Increase quantity'));
    fireEvent.click(screen.getByText('Add to cart'));
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ id: EXAMPLE_PRODUCTS[0].id, quantity: 2 })
    );
  });

  it('AvailabilityCalendar fires onSelect for available dates', () => {
    const handler = vi.fn();
    render(
      <AvailabilityCalendar
        initialMonth={new Date('2026-06-15T00:00:00Z')}
        availableDates={['2026-06-15']}
        onSelect={handler}
      />
    );
    fireEvent.click(screen.getByLabelText('2026-06-15'));
    expect(handler).toHaveBeenCalledWith('2026-06-15');
  });

  it('TimeSlotSelector emits selected slot', () => {
    const handler = vi.fn();
    render(
      <TimeSlotSelector slots={EXAMPLE_AVAILABILITY.slots} onSelect={handler} />
    );
    const available = EXAMPLE_AVAILABILITY.slots.find((s) => s.available)!;
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(handler).toHaveBeenCalledWith(available);
  });

  it('BookingCard renders status + cancel', () => {
    const handler = vi.fn();
    render(
      <BookingCard
        reservation={{
          id: 'res-1',
          resourceId: 'studio-a',
          slotId: 'slot-1',
          startsAt: '2026-06-15T09:00:00Z',
          endsAt: '2026-06-15T10:00:00Z',
          status: 'confirmed',
          customer: { name: 'Alex' }
        }}
        onCancel={handler}
      />
    );
    expect(screen.getByText('confirmed')).toBeTruthy();
    fireEvent.click(screen.getByText('Cancel reservation'));
    expect(handler).toHaveBeenCalled();
  });

  it('LeadCaptureForm submits values', async () => {
    const handler = vi.fn();
    render(
      <LeadCaptureForm step={EXAMPLE_LEAD_FORM.steps[0]} onSubmit={handler} />
    );
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Alex' }
    });
    fireEvent.change(screen.getByLabelText(/Work email/i), {
      target: { value: 'a@b.co' }
    });
    fireEvent.click(screen.getByText('Continue'));
    await new Promise((r) => setTimeout(r, 0));
    expect(handler).toHaveBeenCalled();
  });

  it('MultiStepForm advances from step 1', () => {
    const handler = vi.fn();
    render(<MultiStepForm form={EXAMPLE_LEAD_FORM} onComplete={handler} />);
    expect(screen.getByText(EXAMPLE_LEAD_FORM.title)).toBeTruthy();
    expect(
      screen.getAllByText(EXAMPLE_LEAD_FORM.steps[0].title).length
    ).toBeGreaterThan(0);
  });

  it('CTABanner fires primary action', () => {
    const handler = vi.fn();
    render(<CTABanner title="Try it" primaryLabel="Go" onPrimary={handler} />);
    fireEvent.click(screen.getByText('Go'));
    expect(handler).toHaveBeenCalled();
  });
});
