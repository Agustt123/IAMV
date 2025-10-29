// service/waSession.js
import { randomUUID } from 'crypto';

const sessions = new Map(); // id -> session

export function createSession({ by, peer, goal }) {
    const id = randomUUID();
    const s = {
        id, by, peer, goal: goal || null,
        state: 'active',
        history: [], // [{role:'user'|'assistant'|'system', text, ts}]
        createdAt: Date.now(),
        lastMsgAt: null
    };
    sessions.set(id, s);
    return s;
}

export function getSession(id) { return sessions.get(id); }
export function listSessions() { return [...sessions.values()]; }

export function appendMessage(id, msg) {
    const s = sessions.get(id); if (!s) return;
    s.history.push({ ...msg, ts: msg.ts ?? Date.now() });
    s.lastMsgAt = Date.now();
    sessions.set(id, s);
}

export function endSession(id, reason = 'ended') {
    const s = sessions.get(id); if (!s) return;
    s.state = reason;
    sessions.set(id, s);
}
