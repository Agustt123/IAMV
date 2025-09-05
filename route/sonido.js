import { Router } from 'express';
import { reproducir } from '../controller/sonido/sonido.js';

export function sonidoRouter() {
    const r = Router();

    // Healthcheck para este servicio
    r.get('/health', (_req, res) => {
        res.json({ ok: true, service: 'sonido', ts: Date.now() });
    });

    // POST /sonido con body { tipo: "muerte" }
    r.post('/', async (req, res) => {
        try {
            const tipo = req.body?.tipo;
            const out = await reproducir(tipo);
            res.json({ requestedTipo: tipo, ...out });
        } catch (e) {
            res.status(503).json({ ok: false, error: e.message });
        }
    });

    // Atajos: /sonido/muerte, /sonido/victoria
    r.post('/:tipo', async (req, res) => {
        try {
            const tipo = req.params.tipo;
            const out = await reproducir(tipo);
            res.json({ requestedTipo: tipo, ...out });
        } catch (e) {
            res.status(503).json({ ok: false, error: e.message });
        }
    });

    return r;
}
