import { Router } from 'express';
import { prender, apagar, toggle } from '../controller/linterna/linterna.js';

export function linternaRouter() {
  const r = Router();

  r.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'mobile-ia', ts: Date.now() });
  });

  r.post('/linterna', async (req, res) => {
    try {
      const on = !!req.body?.on;
      const out = await toggle(on);
      res.json({ requestedOn: on, ...out });
    } catch (e) {
      res.status(503).json({ ok: false, error: e.message });
    }
  });

  r.post('/linterna/on', async (_req, res) => {
    try { res.json(await prender()); }
    catch (e) { res.status(503).json({ ok: false, error: e.message }); }
  });

  r.post('/linterna/off', async (_req, res) => {
    try { res.json(await apagar()); }
    catch (e) { res.status(503).json({ ok: false, error: e.message }); }
  });

  return r;
}
