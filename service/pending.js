// service/pending.js
// Cola simple para que la Action haga GET y “reciba” mensajes entrantes.
const pendingBySession = new Map(); // sessionId -> [{eventId, text, ts}]
let seq = 1;

export function pushInbound(sessionId, text, ts = Date.now()) {
    const arr = pendingBySession.get(sessionId) || [];
    const event = { eventId: `e${seq++}`, text, ts };
    arr.push(event);
    pendingBySession.set(sessionId, arr);
    return event;
}

export function pullPending(sessionId, max = 1) {
    const arr = pendingBySession.get(sessionId) || [];
    return arr.slice(0, max);
}

export function ackEvent(eventId) {
    for (const [sid, arr] of pendingBySession) {
        const i = arr.findIndex(e => e.eventId === eventId);
        if (i >= 0) {
            arr.splice(i, 1);
            if (arr.length) pendingBySession.set(sid, arr);
            else pendingBySession.delete(sid);
            return { ok: true, sessionId: sid };
        }
    }
    return { ok: false };
}
