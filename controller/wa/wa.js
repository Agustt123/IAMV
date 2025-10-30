// controller/wa/wa.js
let busRef = null;
export const initWaController = (bus) => { busRef = bus; };

function ensureBus() {
    if (!busRef) throw new Error('bus_not_initialized');
    return busRef;
}

// Unificado: manda un solo comando "whatsapp" con { by, value, text }
// Acepta alias "valu" por compatibilidad si te llega así desde arriba.
export async function sendWhatsApp({ by, value, text, valu }) {
    const bus = ensureBus();
    const payload = { by, value: value ?? valu, text };
    console.log('WA SEND PAYLOAD:', payload);
    const res = await bus.sendCommand('whatsapp', payload);
    return normalizeAck(res);
}

// Conveniencias
export async function sendToNumber(numberE164, text) {
    console.log('sendToNumber', { numberE164, text });
    return sendWhatsApp({ by: 'number', value: numberE164, text });
}

export async function sendToContact(contactName, text) {
    return sendWhatsApp({ by: 'contact', value: contactName, text });
}

function normalizeAck(msg) {
    const ok = String(msg?.ok ?? '').toLowerCase() === 'true';
    return { ok, raw: msg };
}
