import { Server } from 'ws';
import { Game } from './models/game';
import { Player } from './models/player';

const port = parseInt(process.env.port) || 8080;
const wss = new Server({ port });
console.log('Listening on', port);

// TODO: reconnection logic ala https://github.com/websockets/ws/wiki/Websocket-client-implementation-for-auto-reconnect
// TODO: sticky session after client refresh. save uuid and name?

const game = new Game();

wss.on('connection', function connection(ws) {
  const player = new Player(ws);
  game.addPlayer(player);
});
