// controller/mensaje/mensaje.js
let busRef = null;
export const initMensajeController = (bus) => { busRef = bus; };

export async function enviarMensaje(texto) {
    if (!busRef) throw new Error('bus_not_initialized');

    // Default si no viene nada
    const mensaje = (texto ?? '').toString().trim() || 'Mensaje por default';

    // Mandamos por el bus (WsBus) el comando 'text'
    const res = await busRef.sendCommand('text', { mensaje });
    return normalizeAck(res, mensaje);
}

function normalizeAck(msg, mensaje) {
    const ok = String(msg?.ok ?? '').toLowerCase() === 'true' || msg?.ok === true;
    return { ok, enviado: mensaje, raw: msg };
}
