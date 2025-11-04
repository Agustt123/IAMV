// route/llamada.js
import { Router } from 'express';
import { llamarNumero } from '../controller/llamada/llamada.js';

export function llamadaRouter() {
    const r = Router();

    r.get('/health', (_req, res) => {
        res.json({ ok: true, service: 'llamada', ts: Date.now() });
    });

    // POST /llamada/enviar — body { numero: '+54911...' }
    r.post('/llamar', async (req, res) => {
        try {
            const numero = String(req.body?.numero || '');
            if (!numero) return res.status(400).json({ ok: false, error: 'bad_request' });

            const out = await llamarNumero(numero);
            if (!out.ok) return res.status(503).json({ ok: false, error: 'llamada_fallida', ...out });
            res.json(out);
        } catch (e) {
            res.status(503).json({ ok: false, error: e.message });
        }
    });

    return r;
}
