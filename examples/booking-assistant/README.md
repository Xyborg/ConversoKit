# Booking assistant — coaching calls

A runnable ConversoKit example: 1:1 coaching calls with three coaches, four MCP tools, and a `confirm_booking_email` step that sends through Resend (or a Mock that logs to stdout).

```bash
pnpm --filter example-booking-assistant dev
# MCP server on :3000, widget UI on :5173
```

## What this demonstrates

- Custom resources (3 coaches) instead of `EXAMPLE_AVAILABILITY`
- 4 tools: `get_availability`, `create_reservation`, `cancel_reservation`, **`confirm_booking_email`** (the custom one)
- The `email = createResendProvider(env) ?? new MockEmailProvider()` fallback pattern
- `AvailabilityCalendar` + `TimeSlotSelector` + `BookingCard` widgets
- `requiresConsent: true` on tools that touch personal data; `ConsentBanner` gating the UI

## Switch to real Resend

```bash
cp .env.example .env
# Set RESEND_API_KEY and BOOKING_FROM_EMAIL to a domain you own in Resend
pnpm --filter example-booking-assistant dev
```

The server logs `email: resend` instead of `email: mock` when env is set.

## File map

```
examples/booking-assistant/
├── src/
│   ├── server.ts    # 4 tools incl. confirm_booking_email
│   ├── App.tsx      # 3-coach picker + slot + confirmation
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```
