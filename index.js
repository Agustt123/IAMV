import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WsBus } from './ws/bus.js';
import { linternaRouter } from './route/linterna.js';
import { monitorRouter } from './route/monitor.js';
import { initLinternaController } from './controller/linterna/linterna.js';
import { mensajeRouter } from './route/mensaje.js';
import { initMensajeController } from './controller/texto/mensaje.js';


const PORT = Number(process.env.PORT || 13001);
const TOKEN = process.env.LD_TOKEN || '123456';
const WS_PATH = process.env.WS_PATH || '/ws';

const app = express();
app.use(express.json());

const server = http.createServer(app);

const bus = new WsBus({ server, path: WS_PATH, token: TOKEN, ackTimeoutMs: 7000 });
initLinternaController(bus);
initMensajeController(bus);

app.use('/', linternaRouter());
app.use('/monitor', monitorRouter(bus));
app.use('/mensaje', mensajeRouter());

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'internal_error' });
});

server.listen(PORT, () => {
  console.log(`HTTP: http://localhost:${PORT}`);
  console.log(`WS  : ws://localhost:${PORT}${WS_PATH}`);
  console.log(`Auth Header for agents: Authorization: Bearer ${TOKEN}`);
});
