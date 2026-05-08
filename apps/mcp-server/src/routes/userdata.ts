import { Router } from 'express';
import { defaultUserDataStore, type UserDataStore } from '../store/userData.js';

export function userDataRouter(store: UserDataStore = defaultUserDataStore): Router {
  const router = Router();

  router.get('/userdata/export', async (req, res) => {
    const userId = (req.query.userId as string) ?? req.conversokitAuth?.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    const data = await store.export(userId);
    res.json(data);
  });

  router.delete('/userdata', async (req, res) => {
    const userId = (req.query.userId as string) ?? req.conversokitAuth?.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    await store.remove(userId);
    res.status(204).end();
  });

  return router;
}
