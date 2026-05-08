import type { WidgetMeta } from '@conversokit/shared';
import { ProductCardMeta } from './ProductCard.js';
import { ProductCarouselMeta } from './ProductCarousel.js';

export const widgetRegistry: Record<string, WidgetMeta> = {
  [ProductCardMeta.name]: ProductCardMeta,
  [ProductCarouselMeta.name]: ProductCarouselMeta
};

export function registerWidget(meta: WidgetMeta): void {
  widgetRegistry[meta.name] = meta;
}

export function getWidget(name: string): WidgetMeta | undefined {
  return widgetRegistry[name];
}

export function listWidgets(): WidgetMeta[] {
  return Object.values(widgetRegistry);
}
