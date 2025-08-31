import { WebSocketServer } from 'ws';
import crypto from 'crypto';
import { EventEmitter } from 'events';

export class WsBus extends EventEmitter {
  constructor({ server, path = '/ws', token, ackTimeoutMs = 5000, inboxSize = 100 }) {
    super();
    this.wss = new WebSocketServer({ server, path });
    this.token = token;
    this.ackTimeoutMs = ackTimeoutMs;
    this.clients = new Set();
    this.pending = new Map(); // id -> {resolve,reject,timeout}
    this.inbox = [];          // ring buffer of last inbound messages
    this.inboxSize = inboxSize;

    this.wss.on('connection', (ws, req) => {
      const auth = req.headers['authorization'] || '';
      if (auth !== `Bearer ${this.token}`) {
        ws.close(1008, 'unauthorized');
        return;
      }
      this.clients.add(ws);
      this.emit('client_connected', { ts: Date.now(), count: this.clients.size });

      ws.on('message', (buf) => {
        try {
          const msg = JSON.parse(buf.toString());
          const { id } = msg || {};
          if (id && this.pending.has(id)) {
            const { resolve, timeout } = this.pending.get(id);
            clearTimeout(timeout);
            this.pending.delete(id);
            resolve(msg);
          }
          // cache in inbox and emit
          this._pushInbox({ ts: Date.now(), msg });
          this.emit('message', { ts: Date.now(), msg });
          console.log('WS ←', msg);
        } catch (e) {
          console.warn('WS bad json:', e.message);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        this.emit('client_disconnected', { ts: Date.now(), count: this.clients.size });
      });
      ws.on('error', () => {
        this.clients.delete(ws);
        this.emit('client_disconnected', { ts: Date.now(), count: this.clients.size });
      });
    });
  }

  _pushInbox(entry) {
    this.inbox.push(entry);
    if (this.inbox.length > this.inboxSize) this.inbox.shift();
  }

  getStats() {
    return { clients: this.clients.size, pending: this.pending.size, inbox: this.inbox.length };
  }

  getInbox(limit = 50) {
    const n = Math.max(0, Math.min(limit, this.inbox.length));
    return this.inbox.slice(this.inbox.length - n);
  }

  broadcast(obj) {
    const msg = JSON.stringify(obj);
    for (const ws of [...this.clients]) {
      try { ws.send(msg); } catch { this.clients.delete(ws); }
    }
  }

  sendCommand(op, payload = {}) {
    if (this.clients.size === 0) {
      return Promise.reject(new Error('no_clients_connected'));
    }
    const id = payload.id || `t_${crypto.randomUUID()}`;
    const msg = { id, op, ...payload };
    const str = JSON.stringify(msg);

    for (const ws of this.clients) {
      try { ws.send(str); } catch {}
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error('ack_timeout'));
      }, this.ackTimeoutMs);
      this.pending.set(id, { resolve, reject, timeout });
    });
  }
}
