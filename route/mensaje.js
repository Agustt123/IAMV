// route/mensaje.js
import { Router } from 'express';
import { enviarMensaje } from '../controller/texto/mensaje.js';

export function mensajeRouter() {
    const r = Router();

    // POST /msg/mensaje  -> body: { mensaje: "Hola" }
    r.post('/mensaje', async (req, res) => {
        try {
            const texto = req.body?.mensaje; // puede venir vacío
            const out = await enviarMensaje(texto);
            res.json(out);
        } catch (e) {
            res.status(503).json({ ok: false, error: e.message });
        }
    });

    return r;
}
