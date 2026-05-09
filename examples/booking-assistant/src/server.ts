import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import {
  availabilitySchema,
  defineTool,
  reservationSchema,
  type Reservation,
  type Tool,
  type TimeSlot
} from '@conversokit/shared';
import {
  createResendProvider,
  MockEmailProvider,
  type EmailProvider
} from '@conversokit/integrations';

// Three coaches, each a "resource" with a daily set of slots.
const COACHES = [
  { id: 'coach-mira', name: 'Mira (engineering management)' },
  { id: 'coach-jules', name: 'Jules (product strategy)' },
  { id: 'coach-asha', name: 'Asha (career transitions)' }
];

function buildSlots(date: string): TimeSlot[] {
  return ['09:00', '10:30', '13:00', '14:30', '16:00'].map((time) => ({
    id: `${date}T${time}`,
    startsAt: `${date}T${time}:00Z`,
    endsAt: `${date}T${time.replace(/^\d+/, (h) => String(Number(h) + 1))}:00Z`,
    available: true
  }));
}

const reservations = new Map<string, Reservation>();

const email: EmailProvider =
  createResendProvider(process.env) ?? new MockEmailProvider();
const FROM = process.env.BOOKING_FROM_EMAIL ?? 'hello@coaching.example';

const getAvailability = defineTool({
  name: 'get_availability',
  description: 'Return slots for a coach on a date.',
  inputSchema: z.object({
    resourceId: z.string(),
    from: z.string(),
    to: z.string()
  }),
  outputSchema: z.object({ days: z.array(availabilitySchema) }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const coach = COACHES.find((c) => c.id === input.resourceId);
    if (!coach) return { days: [] };
    const date = input.from.slice(0, 10);
    return {
      days: [
        {
          resourceId: coach.id,
          resourceName: coach.name,
          date,
          slots: buildSlots(date)
        }
      ]
    };
  }
});

const createReservation = defineTool({
  name: 'create_reservation',
  description: 'Confirm a coaching call.',
  inputSchema: z.object({
    resourceId: z.string(),
    slotId: z.string(),
    customer: z.object({
      name: z.string(),
      email: z.string().email().optional()
    })
  }),
  outputSchema: z.object({ reservation: reservationSchema }),
  permissions: { requiresAuth: false, requiresConsent: true },
  async handler(input) {
    const coach = COACHES.find((c) => c.id === input.resourceId);
    if (!coach) throw new Error('Unknown coach');
    const slots = buildSlots(input.slotId.slice(0, 10));
    const slot = slots.find((s) => s.id === input.slotId) ?? slots[0];
    const reservation: Reservation = {
      id: `res_${Math.random().toString(36).slice(2)}`,
      resourceId: coach.id,
      resourceName: coach.name,
      slotId: slot.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      status: 'confirmed',
      customer: input.customer
    };
    reservations.set(reservation.id, reservation);
    return { reservation };
  }
});

const confirmBookingEmail = defineTool({
  name: 'confirm_booking_email',
  description:
    'Send a confirmation email for a reservation. Uses Resend if RESEND_API_KEY is set, otherwise logs to stdout.',
  inputSchema: z.object({ reservationId: z.string() }),
  outputSchema: z.object({
    sentTo: z.string().optional(),
    provider: z.string()
  }),
  permissions: { requiresAuth: false, requiresConsent: true },
  async handler(input) {
    const r = reservations.get(input.reservationId);
    if (!r) throw new Error('Reservation not found');
    if (!r.customer?.email) {
      return { provider: email.id };
    }
    await email.send({
      to: r.customer.email,
      from: FROM,
      subject: `Your coaching call with ${r.resourceName}`,
      text: `Hi ${r.customer.name}, your call is confirmed for ${r.startsAt}. See you then.`,
      html: `<p>Hi ${r.customer.name},</p><p>Your call with <strong>${r.resourceName}</strong> is confirmed for <strong>${r.startsAt}</strong>.</p>`
    });
    return { sentTo: r.customer.email, provider: email.id };
  }
});

const cancelReservation = defineTool({
  name: 'cancel_reservation',
  description: 'Cancel a reservation by id.',
  inputSchema: z.object({ reservationId: z.string() }),
  outputSchema: z.object({ reservation: reservationSchema }),
  permissions: { requiresAuth: false },
  async handler(input) {
    const r = reservations.get(input.reservationId);
    if (!r) throw new Error('Reservation not found');
    const cancelled: Reservation = { ...r, status: 'cancelled' };
    reservations.set(r.id, cancelled);
    return { reservation: cancelled };
  }
});

const tools: Tool[] = [
  getAvailability,
  createReservation,
  confirmBookingEmail,
  cancelReservation
];

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/tools', (_req, res) => {
  res.json({
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      permissions: t.permissions
    }))
  });
});

app.post('/tools/:name', async (req, res) => {
  const tool = tools.find((t) => t.name === req.params.name);
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  try {
    const input = tool.inputSchema.parse(req.body);
    const sessionId = req.header('x-conversokit-session') ?? 'demo-session';
    const output = await tool.handler(input, { sessionId, logger: console });
    res.json(output);
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : 'Tool execution failed'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Coaching MCP server listening on :${PORT} (email: ${email.id})`);
});
