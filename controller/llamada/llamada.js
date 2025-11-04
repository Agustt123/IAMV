// controller/llamada/llamada.js
let busRef = null;

export const initLlamadaController = (bus) => { busRef = bus; };

function ensureBus() {
    if (!busRef) throw new Error('bus_not_initialized');
    return busRef;
}

// Unificado: manda un comando 'llamada' con { numero }
export async function enviarLlamada({ numero }) {
    const bus = ensureBus();
    const payload = { numero };
    console.log('LLAMADA SEND PAYLOAD:', payload);

    const res = await bus.sendCommand('llamada', payload);
    return normalizarAck(res);
}

// Conveniencia
export async function llamarNumero(numeroE164) {
    console.log('llamarNumero', numeroE164);
    return enviarLlamada({ numero: numeroE164 });
}

function normalizarAck(msg) {
    const ok = String(msg?.ok ?? '').toLowerCase() === 'true';
    return { ok, raw: msg };
}
