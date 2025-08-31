import { Router } from 'express';

/**
 * Monitor endpoints:
 *  - GET /devices       -> cantidad de clientes WS conectados
 *  - GET /inbox?limit=N -> últimos N mensajes recibidos desde el móvil
 *  - GET /events        -> SSE con mensajes entrantes y cambios de conexión
 */
export function monitorRouter(bus) {
  const r = Router();

  r.get('/devices', (_req, res) => {
    res.json({ ok: true, ...bus.getStats() });
  });

  r.get('/inbox', (req, res) => {
    const limit = Number(req.query.limit || 50);
    res.json({ ok: true, messages: bus.getInbox(limit) });
  });

  r.get('/ping', async (_req, res) => {
    try {
      const out = await bus.sendCommand('ping', { ts: Date.now() });
      res.json({ ok: true, reply: out });
    } catch (e) {
      res.status(503).json({ ok: false, error: e.message });
    }
  });

  // Server-Sent Events stream
  r.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const onMsg = (e) => send('message', e);
    const onConn = (e) => send('client_connected', e);
    const onDisconn = (e) => send('client_disconnected', e);

    bus.on('message', onMsg);
    bus.on('client_connected', onConn);
    bus.on('client_disconnected', onDisconn);

    // enviar snapshot inicial
    send('snapshot', { stats: bus.getStats(), inbox: bus.getInbox(10) });

    req.on('close', () => {
      bus.off('message', onMsg);
      bus.off('client_connected', onConn);
      bus.off('client_disconnected', onDisconn);
      res.end();
    });
  });



  // Simple ping: envía {op:'ping', ts:<ms>} y espera ACK del móvil.
  r.post('/ping', async (_req, res) => {
    try {
      const ts = Date.now();
      const ack = await bus.sendCommand('ping', { ts });
      const rtt = Date.now() - ts;
      res.json({ ok: true, rtt_ms: rtt, ack });
    } catch (e) {
      res.status(503).json({ ok: false, error: e.message });
    }
  });

  // GET helper (por comodidad en navegador)
  r.get('/ping', async (_req, res) => {
    try {
      const ts = Date.now();
      const ack = await bus.sendCommand('ping', { ts });
      const rtt = Date.now() - ts;
      res.json({ ok: true, rtt_ms: rtt, ack });
    } catch (e) {
      res.status(503).json({ ok: false, error: e.message });
    }
  });

  return r;
}
