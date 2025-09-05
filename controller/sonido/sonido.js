let busRef = null;

export const initSonidoController = (bus) => {
    busRef = bus;
};

export async function reproducir(tipo) {
    if (!busRef) throw new Error('bus_not_initialized');
    if (!tipo) throw new Error('tipo_requerido');

    // Manda comando al bus
    const res = await busRef.sendCommand('sound', { tipo });
    return normalizeAck(res);
}

function normalizeAck(msg) {
    const ok = String(msg?.ok ?? '').toLowerCase() === 'true';
    return { ok, raw: msg };
}
