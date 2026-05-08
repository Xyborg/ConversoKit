import type { WidgetMeta } from '@conversokit/shared';
import { ProductCardMeta } from './ProductCard.js';
import { ProductCarouselMeta } from './ProductCarousel.js';
import { ConsentBannerMeta } from './ConsentBanner.js';
import { CheckoutSummaryMeta } from './CheckoutSummary.js';
import { AddToCartPanelMeta } from './AddToCartPanel.js';
import { AvailabilityCalendarMeta } from './AvailabilityCalendar.js';
import { TimeSlotSelectorMeta } from './TimeSlotSelector.js';
import { BookingCardMeta } from './BookingCard.js';
import { LeadCaptureFormMeta } from './LeadCaptureForm.js';
import { MultiStepFormMeta } from './MultiStepForm.js';
import { CTABannerMeta } from './CTABanner.js';

const allMeta = [
  ProductCardMeta,
  ProductCarouselMeta,
  CheckoutSummaryMeta,
  AddToCartPanelMeta,
  AvailabilityCalendarMeta,
  TimeSlotSelectorMeta,
  BookingCardMeta,
  LeadCaptureFormMeta,
  MultiStepFormMeta,
  CTABannerMeta,
  ConsentBannerMeta
];

export const widgetRegistry: Record<string, WidgetMeta> = Object.fromEntries(
  allMeta.map((m) => [m.name, m])
);

export function registerWidget(meta: WidgetMeta): void {
  widgetRegistry[meta.name] = meta;
}

export function getWidget(name: string): WidgetMeta | undefined {
  return widgetRegistry[name];
}

export function listWidgets(): WidgetMeta[] {
  return Object.values(widgetRegistry);
}
