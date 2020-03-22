import { Server } from 'ws';

const wss = new Server({ port: 8080 });

const players = [];

// Return an array of dice
function roll(numDice) {

}

// On each turn, roll for each player and send info to that player

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});
