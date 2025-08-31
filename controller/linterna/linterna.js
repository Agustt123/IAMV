let busRef = null;
export const initLinternaController = (bus) => { busRef = bus; };

export async function prender() {
  if (!busRef) throw new Error('bus_not_initialized');
  const res = await busRef.sendCommand('torch', { on: true });
  return normalizeAck(res);
}

export async function apagar() {
  if (!busRef) throw new Error('bus_not_initialized');
  const res = await busRef.sendCommand('torch', { on: false });
  return normalizeAck(res);
}

export async function toggle(on) {
  return on ? prender() : apagar();
}

function normalizeAck(msg) {
  const ok = String(msg?.ok ?? '').toLowerCase() === 'true';
  return { ok, raw: msg };
}
