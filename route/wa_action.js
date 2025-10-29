// route/wa.js
import { Router } from 'express';
import { sendToNumber, sendToContact } from '../controller/wa/wa.js';

export function waRouter() {
    const r = Router();

    r.get('/health', (_req, res) => {
        res.json({ ok: true, service: 'wa', ts: Date.now() });
    });

    // Unificado: body { by: 'number'|'contact', value: string, text: string }
    r.post('/send', async (req, res) => {
        try {
            const by = String(req.body?.by || '');
            const value = String(req.body?.value || '');
            const text = String(req.body?.text || '');

            if (!by || !value || !text) {
                return res.status(400).json({ ok: false, error: 'bad_request' });
            }

            let out;
            if (by === 'number') out = await sendToNumber(value, text);
            else if (by === 'contact') out = await sendToContact(value, text);
            else return res.status(400).json({ ok: false, error: 'bad_by' });

            if (!out.ok) return res.status(503).json({ ok: false, error: 'send_failed', ...out });
            res.json(out);
        } catch (e) {
            res.status(503).json({ ok: false, error: e.message });
        }
    });

    // Conveniencia: enviar a NÚMERO — body { number: '+54911...', text: '...' }
    r.post('/send/number', async (req, res) => {
        try {
            const number = String(req.body?.number || '');
            const text = String(req.body?.text || '');
            if (!number || !text) return res.status(400).json({ ok: false, error: 'bad_request' });
            const out = await sendToNumber(number, text);
            if (!out.ok) return res.status(503).json({ ok: false, error: 'send_failed', ...out });
            res.json(out);
        } catch (e) {
            res.status(503).json({ ok: false, error: e.message });
        }
    });

    // Conveniencia: enviar a CONTACTO — body { contact: 'Juan Pérez', text: '...' }
    r.post('/send/contact', async (req, res) => {
        try {
            const contact = String(req.body?.contact || '');
            const text = String(req.body?.text || '');
            if (!contact || !text) return res.status(400).json({ ok: false, error: 'bad_request' });
            const out = await sendToContact(contact, text);
            if (!out.ok) return res.status(503).json({ ok: false, error: 'send_failed', ...out });
            res.json(out);
        } catch (e) {
            res.status(503).json({ ok: false, error: e.message });
        }
    });

    return r;
}
