import { Router } from 'express';
import { defaultOrderStore } from '../store/orders.js';
import { defaultCartStore } from '../store/cart.js';
import { defaultReservationStore } from '../store/reservations.js';
import { defaultLeadStore } from '../store/leads.js';

export function adminRouter(): Router {
  const router = Router();

  router.use((_req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not found' });
    }
    next();
  });

  router.get('/admin/orders', async (_req, res) => {
    const orders = await defaultOrderStore.list();
    res.json({ orders });
  });

  router.get('/admin/cart/:sessionId', async (req, res) => {
    const cart = await defaultCartStore.get(req.params.sessionId);
    res.json(cart);
  });

  router.get('/admin/reservations', async (_req, res) => {
    const reservations = await defaultReservationStore.list();
    res.json({ reservations });
  });

  router.get('/admin/leads', async (_req, res) => {
    const leads = await defaultLeadStore.list();
    res.json({ leads });
  });

  return router;
}
