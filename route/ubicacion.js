// route/ubicacion.js
import { Router } from 'express';
import { mandarUbicacion } from '../controller/ubicacion/ubicacion.js';

export function ubicacionRouter() {
    const r = Router();

    r.get('/health', (_req, res) => {
        res.json({ ok: true, service: 'ubicacion', ts: Date.now() });
    });

    // POST /ubicacion/enviar — body { latitud: -34.6037, longitud: -58.3816 }
    r.post('/enviar', async (req, res) => {
        try {
            const latitud = Number(req.body?.latitud);
            const longitud = Number(req.body?.longitud);

            if (isNaN(latitud) || isNaN(longitud)) {
                return res.status(400).json({ ok: false, error: 'bad_request' });
            }

            const out = await mandarUbicacion(latitud, longitud);
            if (!out.ok) return res.status(503).json({ ok: false, error: 'ubicacion_fallida', ...out });
            res.json(out);
        } catch (e) {
            res.status(503).json({ ok: false, error: e.message });
        }
    });

    return r;
}