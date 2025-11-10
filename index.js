// server.js
import 'dotenv/config';
import express from 'express';
import http from 'http';

import { WsBus } from './ws/bus.js';

// Routers tradicionales
import { linternaRouter } from './route/linterna.js';
import { monitorRouter } from './route/monitor.js';
import { mensajeRouter } from './route/mensaje.js';
import { sonidoRouter } from './route/sonido.js';
import { fotoRouter } from './route/foto.js';
import { llamadaRouter } from './route/llamada.js';
import { ubicacionRouter } from './route/ubicacion.js';
import { waRouter } from './route/wa_action.js';

// Controladores tradicionales
import { initLinternaController } from './controller/linterna/linterna.js';
import { initMensajeController } from './controller/texto/mensaje.js';
import { initSonidoController } from './controller/sonido/sonido.js';
import { initFotoController } from './controller/foto/foto.js';
import { initLlamadaController } from './controller/llamada/llamada.js';
import { initUbicacionController } from './controller/ubicacion/ubicacion.js';
import { initWaController } from './controller/wa/wa.js';

// 🚀 Nuevo: capa MCP
import { executeRouter } from './route/execute.js';
import { initTools } from './tools/index.js';

const PORT = Number(process.env.PORT || 13001);
const TOKEN = process.env.LD_TOKEN || '123456';
const WS_PATH = process.env.WS_PATH || '/ws';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Servir archivos si SAVE_DIR está definido
if (process.env.SAVE_DIR) {
  app.use('/uploads', express.static(process.env.SAVE_DIR, { fallthrough: true }));
}

// Crear servidor HTTP + WebSocket
const server = http.createServer(app);

// 🧠 Inicializar WebSocket Bus
const bus = new WsBus({ server, path: WS_PATH, token: TOKEN, ackTimeoutMs: 7000 });

// 🧩 Inicializar herramientas MCP con acceso al bus
initTools(bus);

// Inicializar controladores tradicionales
initLinternaController(bus);
initMensajeController(bus);
initSonidoController(bus);
initFotoController(bus);
initWaController(bus);
initLlamadaController(bus);
initUbicacionController(bus);

// Rutas HTTP tradicionales
app.use('/', linternaRouter());
app.use('/monitor', monitorRouter(bus));
app.use('/mensaje', mensajeRouter());
app.use('/sonido', sonidoRouter());
app.use('/foto', fotoRouter());
app.use('/ubicacion', ubicacionRouter());
app.use('/wa', waRouter());
app.use('/llamada', llamadaRouter());

// 🧠 NUEVO: endpoint genérico de ejecución MCP
app.use('/execute', executeRouter());

// Middleware de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'internal_error' });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`HTTP: http://localhost:${PORT}`);
  console.log(`WS  : ws://localhost:${PORT}${WS_PATH}`);
  console.log(`Auth Header for agents: Authorization: Bearer ${TOKEN}`);
  if (process.env.SAVE_DIR) {
    console.log(`Uploads served at /uploads from ${process.env.SAVE_DIR}`);
  }
});
