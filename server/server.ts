import express from 'express';
import { Server } from 'ws';
import { resolve } from 'path';
import { createServer } from 'http';
import { Game } from './models/game';
import { Player } from './models/player';
import queryString from 'query-string'
import WebSocket from 'ws';

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

const game = new Game();

wss.on('connection', (ws: WebSocket, req: any) => {
  const params = queryString.parse(req.url.substring(1));

  if (params.name && params.uuid) {
    // New connection
    const player = new Player(ws, params.uuid.toString());
    game.addPlayer(player);
    player.setName(params.name.toString());
  } else if (params.uuid) {
    // Recovered connection
    game.loadPLayer(ws, params.uuid.toString());
  }

  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});