import express from 'express';
import { Server } from 'ws';
import { resolve } from 'path';
import { createServer } from 'http';
import { Game } from './models/game';
import { Player } from './models/player';

const PORT = process.env.PORT || 8080;

const app = express();
const server = createServer(app);

server.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Declare the path to frontend's static assets
app.use(express.static(resolve('..', 'build')));

// Intercept requests to return the frontend's static entry point
app.get('*', (_, response) => {
  response.sendFile(resolve('..', 'build', 'index.html'));
});

const wss = new Server({ server: server });

// TODO: reconnection logic ala https://github.com/websockets/ws/wiki/Websocket-client-implementation-for-auto-reconnect
// TODO: sticky session after client refresh. save uuid and name?

const game = new Game();

// TODO: Add 30 second heartbeat message to prevent connections from timing out

wss.on('connection', (ws) => {
  const player = new Player(ws);
  game.addPlayer(player);

  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});