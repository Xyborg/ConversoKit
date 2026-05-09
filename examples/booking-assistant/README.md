# Booking assistant

Calendar → time slot → confirmation flow.

## Generate it

```bash
npx conversokit create my-booking --template booking
cd my-booking
pnpm install
pnpm dev
```

## What ships

| Layer | Surface |
| --- | --- |
| MCP tools | `get_availability`, `create_reservation`, `cancel_reservation` (implement the real impls from the ConversoKit repo as a starting point) |
| Widgets | `AvailabilityCalendar`, `TimeSlotSelector`, `BookingCard`, `CTABanner`, `ConsentBanner` |
| Theme | `lightTheme` (swap to `enterpriseTheme` for B2B contexts) |

## Customise

1. Replace `EXAMPLE_AVAILABILITY` with a feed from your scheduling system (Cal.com, Calendly, custom DB).
2. Add reminder emails by extending `create_reservation` with a `Resend`/`SendGrid` integration provider.
3. For multi-resource booking (multiple rooms, multiple staff members) wire the resource picker into the tool input.
