import { Router } from 'express';
import { tomarFoto } from '../controller/foto/foto.js';


export function fotoRouter() {
    const r = Router();


    // POST /foto/tomar -> body: { camera?: 'rear'|'front', inline?: true|false }
    r.post('/tomar', async (req, res) => {
        try {
            const camera = req.body?.camera === 'front' ? 'front' : 'rear';
            const inline = req.body?.inline !== false; // default true
            const out = await tomarFoto({ camera, inline });
            res.json(out);
        } catch (e) {
            res.status(503).json({ ok: false, error: e.message });
        }
    });


    return r;
}