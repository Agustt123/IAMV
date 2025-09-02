// agente-linterna.js
// Agente de prueba que se conecta al WsBus, escucha comandos y responde con ACK.
// Usa el header Authorization: Bearer <TOKEN> como espera tu server.

import WebSocket from 'ws';

// Config por env o defaults
const WS_URL = 'ws://149.56.182.49:13001/ws';

const TOKEN = process.env.LD_TOKEN || '123456';

// Pequeños helpers
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const safeJSON = (x) => { try { return JSON.parse(x); } catch { return null; } };

// Lógica de reconexión simple
let shouldReconnect = true;
let reconnectDelayMs = 1000; // exponencial simple con tope
const maxReconnectDelayMs = 10000;

function connect() {
    const ws = new WebSocket(WS_URL, {
        headers: { Authorization: `Bearer ${TOKEN}` }
    });

    ws.on('open', () => {
        console.log(`[WS] Conectado a ${WS_URL}`);
        reconnectDelayMs = 1000;
        // Identificación opcional para monitoreo (si tu WsBus la soporta)
        // ws.send(JSON.stringify({ type: 'hello', agent: 'agente-linterna', caps: ['torch'] }));
    });

    ws.on('ping', () => {
        // Mantener la conexión viva
        try { ws.pong(); } catch { }
    });

    ws.on('message', async (data) => {
        const msg = typeof data === 'string' ? safeJSON(data) : safeJSON(data.toString());
        if (!msg) {
            console.warn('[WS] Mensaje no-JSON o inválido:', data?.toString?.());
            return;
        }

        // Log general del mensaje entrante
        console.log('[WS] Mensaje recibido:', msg);

        // Compatibilidad flexible con distintos formatos:
        // Esperamos algo como: { id, cmd: 'torch', payload: { on: true/false } }
        // o bien { id, command: 'torch', data: { on: true/false } }
        const id = msg.id ?? msg.requestId ?? null;
        const cmd = msg.cmd ?? msg.command ?? msg.topic ?? null;
        const payload = msg.payload ?? msg.data ?? {};

        // Si es un comando "torch"
        if (cmd === 'torch') {
            const on = !!payload.on;
            // Acá iría la acción real (encender/apagar HW). Para demo, sólo log.
            console.log(`🔦 Torch -> ${on ? 'ENCENDER' : 'APAGAR'}`);

            // Responder ACK que el controller espera (normalizeAck mira msg.ok)
            const ack = { id, ok: true, received: { cmd: 'torch', on } };
            try {
                ws.send(JSON.stringify(ack));
                console.log('[WS] ACK enviado:', ack);
            } catch (e) {
                console.error('[WS] Error enviando ACK:', e);
            }
            return;
        }

        // Otros comandos desconocidos -> ack con ok=false (o ignorar)
        if (id != null) {
            const nack = { id, ok: false, error: 'unknown_command', raw: msg };
            try {
                ws.send(JSON.stringify(nack));
                console.warn('[WS] NACK enviado (unknown_command):', nack);
            } catch (e) {
                console.error('[WS] Error enviando NACK:', e);
            }
        }
    });

    ws.on('close', async (code, reason) => {
        console.warn(`[WS] Conexión cerrada (code=${code}) reason=${reason?.toString?.() || ''}`);
        if (shouldReconnect) {
            console.log(`[WS] Reintentando en ${reconnectDelayMs} ms...`);
            await sleep(reconnectDelayMs);
            reconnectDelayMs = Math.min(reconnectDelayMs * 2, maxReconnectDelayMs);
            connect();
        }
    });

    ws.on('error', (err) => {
        console.error('[WS] Error:', err?.message || err);
        // El 'close' normalmente disparará después y hará la reconexión.
    });

    // Permite cerrar limpio con Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n[WS] Saliendo…');
        shouldReconnect = false;
        try { ws.close(); } catch { }
        process.exit(0);
    });
}

connect();
