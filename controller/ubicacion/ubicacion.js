// controller/ubicacion/ubicacion.js
let busRef = null;

export const initUbicacionController = (bus) => { busRef = bus; };

function ensureBus() {
    if (!busRef) throw new Error('bus_not_initialized');
    return busRef;
}

// Envía un comando 'ubicacion' con { latitud, longitud }
export async function enviarUbicacion({ latitud, longitud }) {
    const bus = ensureBus();
    const payload = { latitud, longitud };
    console.log('UBICACION SEND PAYLOAD:', payload);

    const res = await bus.sendCommand('ubicacion', payload);
    return normalizarAck(res);
}

// Conveniencia
export async function mandarUbicacion(latitud, longitud) {
    console.log('mandarUbicacion', { latitud, longitud });
    return enviarUbicacion({ latitud, longitud });
}

function normalizarAck(msg) {
    const ok = String(msg?.ok ?? '').toLowerCase() === 'true';
    return { ok, raw: msg };
}
