# @conversokit/widgets

19 themed React widgets for ConversoKit (commerce, booking, lead-gen, travel, dashboard, consent) — every widget styled via `--ck-*` CSS variables.

Part of [ConversoKit](https://github.com/Xyborg/ConversoKit) — a boilerplate for building ChatGPT Apps (Apps SDK / MCP) in <30 minutes.

## Install

```bash
pnpm add @conversokit/widgets @conversokit/themes react
# or
npm install @conversokit/widgets @conversokit/themes react
```

## Usage

```tsx
import { ThemeProvider, themes } from '@conversokit/themes';
import { ProductCard, AddToCartPanel, CheckoutSummary } from '@conversokit/widgets';

export function Storefront({ product }) {
  return (
    <ThemeProvider theme={themes.commerce}>
      <ProductCard product={product} />
      <AddToCartPanel productId={product.id} />
      <CheckoutSummary />
    </ThemeProvider>
  );
}
```

Widgets ship for commerce (`ProductCard`, `ProductCarousel`, `AddToCartPanel`, `CheckoutSummary`), booking (`AvailabilityCalendar`, `TimeSlotSelector`, `BookingCard`), lead-gen, travel, dashboard, and a `ConsentBanner` for PRD §14 compliance.

## Documentation

Full docs and runnable examples live in the [main repo](https://github.com/Xyborg/ConversoKit#readme).

## License

Apache-2.0 © Martín Aberastegue
