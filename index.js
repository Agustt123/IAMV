// server.js (fragmento)
import 'dotenv/config';
import express from 'express';
import http from 'http';

import { WsBus } from './ws/bus.js';

import { linternaRouter } from './route/linterna.js';
import { monitorRouter } from './route/monitor.js';
import { mensajeRouter } from './route/mensaje.js';
import { sonidoRouter } from './route/sonido.js';
import { fotoRouter } from './route/foto.js';

// 👇 NUEVOS
import { waRouter } from './route/wa.js';
import { initWaController } from './controller/wa/wa.js';

import { initLinternaController } from './controller/linterna/linterna.js';
import { initMensajeController } from './controller/texto/mensaje.js';
import { initSonidoController } from './controller/sonido/sonido.js';
import { initFotoController } from './controller/foto/foto.js';

const PORT = Number(process.env.PORT || 13001);
const TOKEN = process.env.LD_TOKEN || '123456';
const WS_PATH = process.env.WS_PATH || '/ws';

const app = express();
app.use(express.json({ limit: '10mb' }));

if (process.env.SAVE_DIR) {
  app.use('/uploads', express.static(process.env.SAVE_DIR, { fallthrough: true }));
}

const server = http.createServer(app);

// WS Bus
const bus = new WsBus({ server, path: WS_PATH, token: TOKEN, ackTimeoutMs: 7000 });

// Inicializar controladores
initLinternaController(bus);
initMensajeController(bus);
initSonidoController(bus);
initFotoController(bus);
// 👇 NUEVO: init wa
initWaController(bus);

// Routers HTTP
app.use('/', linternaRouter());
app.use('/monitor', monitorRouter(bus));
app.use('/mensaje', mensajeRouter());
app.use('/sonido', sonidoRouter());
app.use('/foto', fotoRouter());
// 👇 NUEVO: router wa
app.use('/wa', waRouter());

// Manejo de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'internal_error' });
});

server.listen(PORT, () => {
  console.log(`HTTP: http://localhost:${PORT}`);
  console.log(`WS  : ws://localhost:${PORT}${WS_PATH}`);
  console.log(`Auth Header for agents: Authorization: Bearer ${TOKEN}`);
  if (process.env.SAVE_DIR) {
    console.log(`Uploads served at /uploads from ${process.env.SAVE_DIR}`);
  }
});
