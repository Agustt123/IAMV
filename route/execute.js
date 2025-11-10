import express from 'express';
import { ejecutarCodigo } from '../sandbox/ejecutor.js';
import { tools } from '../tools/index.js';

export const executeRouter = () => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ ok: false, error: 'missing_code' });
        }

        try {
            const result = await ejecutarCodigo(code, { tools });
            res.json({ ok: true, result });
        } catch (err) {
            console.error('❌ Error ejecutando código:', err);
            res.status(500).json({ ok: false, error: err.message });
        }
    });

    return router;
};
