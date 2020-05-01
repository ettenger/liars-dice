import { Player } from './player';
import { Message } from './message';
import { Wager } from './wager';
import WebSocket from 'ws';

const TIMER_MAX: number = 30000; // Miliseconds
const HEARTBEAT_INTERVAL: number = 30000; // Miliseconds

export class Game {
  players: Player[] = [];
  activePlayers: Player[] = [];
  startingNumberOfDice: number = 6;
  hasOnesBeenWagered: boolean = false;
  hasGameStarted: boolean = false;
  lastWager: Wager = {};
  wasPlayerJustEliminated: boolean = false;
  timerId: ReturnType<typeof setTimeout>;

  constructor() {
    // Send heartbeat message to clients every 30 seconds to prevent the HTTP connections from timing out
    setInterval(()=>this.sendHeartbeat(), HEARTBEAT_INTERVAL);
  }

  get numDiceRemaining(): number {
    return this.activePlayers.map(p => p.numDice).reduce((x, y) => x + y, 0);
  }

  get publicGameDetails() {
    return {
      players: this.players.map(p => p.publicDetails),
      numDiceRemaining: this.numDiceRemaining,
      hasOnesBeenWagered: this.hasOnesBeenWagered,
      hasGameStarted: this.hasGameStarted,
      lastWager: this.lastWager
    }
  }

  public loadPLayer(ws: WebSocket, uuid: string) {
    const player = this.players.find(plyr => plyr.uuid === uuid);
    if (player) {
      player.rejoin(ws);
    }
    // TODO: Allow player to rejoin
  }

  public addPlayer(player: Player) {
    this.players.push(player);
    player.actions.on('wager', wager => this.handleWager(player, wager));
    player.actions.on('updated', plyr => this.handleUpdate(plyr));
    player.actions.on('rejoined', plyr => this.handleRejoin(plyr));
    player.actions.on('disconnected', plyr => this.handlePlayerDrop(plyr));
    player.actions.on('start game', () => this.handleGameStart());
    player.actions.on('player eliminated', plyr => this.handleEliminatedPlayer(plyr));
    player.actions.on('player removed', plyr => this.handleRemovedPlayer(plyr));
  }

  private startKickTimer(player: Player) {
    this.sendAction('start timer', player.publicDetails);
    this.timerId = setTimeout(() => player.deactivate(),TIMER_MAX)
  }

  private stopKickTimer(player: Player) {
    clearTimeout(this.timerId);
    this.sendAction('stop timer', '');
  }

  private handleRemovedPlayer(player: Player) {
    this.sendAction('stop timer', '');
    this.sendAction('player removed', player.name);
    this.activePlayers = this.players.filter(plyr => plyr.isInGame);
    this.wasPlayerJustEliminated = true;
    this.checkForGameOver();

    // If the game is still in progress
    if (this.hasGameStarted) {
      this.startNextTurn(player);
    }
  }

  private checkForGameOver() {
    if (this.activePlayers.length<=1) {
      if (this.activePlayers.length===1) {
        this.sendAction('game over', this.activePlayers[0].name);
      } else {
        this.sendAction('game over', 'Nobody');
      }
      this.resetGame();
    }
  }

  private handlePlayerDrop(player: Player) {
      this.sendAction('player drop', player.name)
      if (player.isTheirTurn) {
        this.startKickTimer(player);
      }
      this.updateClients();
      player.updateClient();
  }

  private handleEliminatedPlayer(player: Player) {
    this.sendAction('player eliminated', player.name);
    this.activePlayers = this.players.filter(plyr => plyr.isInGame);
    this.wasPlayerJustEliminated = true;
    this.checkForGameOver();
  }

  private beginNewRound() {
    this.sendAction('round start','');
    this.hasOnesBeenWagered = false;
    this.activePlayers.forEach(player => {
      player.beginNewRound();
    });
    this.updateClients();
  }

  private handleGameStart() {
    if (this.hasGameStarted) { return; }

    // Tell players the game is starting
    this.sendAction('game start','');

    // Start the game
    this.hasGameStarted = true;
    this.hasOnesBeenWagered = false;
    this.lastWager = {};
    this.shuffle(this.players);
    this.players[0].isTheirTurn = true;
    this.activePlayers = this.players;
    this.players.forEach(player => {
      player.beginGame(this.startingNumberOfDice);
    });

    // Send state data
    this.updateClients();
  }

  private resetGame() {
    this.hasOnesBeenWagered = false;
    this.hasGameStarted = false;
    this.lastWager = {};
    this.activePlayers = [];
    this.players.forEach(player => {
      player.isTheirTurn = false;
    });
    this.updateClients();
  }

  private sendAction(actionName: string, payload: any) {
    // Send action message to clients for the game log
    const message: Message = { type: 'action', name: actionName, payload: payload };
    this.broadcastToClients(message);
  }

  private handleUpdate(player: Player) {
    this.sendAction('player join', player.name)
    this.updateClients();
    player.updateClient();
  }

  private handleRejoin(player: Player) {
    this.sendAction('player rejoin', player.name)
    if (player.isTheirTurn) {
      this.stopKickTimer(player);
    }
    this.updateClients();
    player.updateClient();
  }

  private broadcastToClients(message: Message) {
    console.log(JSON.stringify(message));
    this.players.forEach(player => {
      player.ws.send(JSON.stringify(message));
    });
  }

  private updateClients() {
    const message: Message = {
      type: 'data',
      name: 'game',
      payload: this.publicGameDetails
    };
    this.broadcastToClients(message);
  }

  private sendHeartbeat() {
    const message: Message = { type: 'heartbeat', name: '', payload: '' };
    // Only send heartbeats if there is a client connected
    if (this.players.filter(p => p.isConnected).length > 0) {
      this.broadcastToClients(message);
    }
  }

  private testWager(wager: Wager): boolean {
    // Returns true if wager was correct, false for bullshit
    let counterFxn;
    if (this.hasOnesBeenWagered) {
      counterFxn = (d: number) => d === wager.num;
    } else {
      // Ones are wild unless they've been called
      counterFxn = (d: number) => d === wager.num || d === 1;
    }

    const allDice: number[] = this.activePlayers.map(p => p.currentRoll).reduce((a, b) => a.concat(b), []);
    const count = allDice.filter(counterFxn).length;

    // Notify clients of the result
    const playerDice: any[] = this.activePlayers.map(p => ({name: p.name, dice: p.currentRoll}));
    this.sendAction('dice reveal',{count: count, num: wager.num, dice: playerDice});

    return count >= wager.qty;
  }

  private calledBullshit(caller: Player, previousPlayer: Player) {
    const wagerToTest = previousPlayer.lastWager;
    const wagerWasSafe = this.testWager(wagerToTest);
    if (wagerWasSafe) {
      this.sendAction('lose die', caller.name);
      caller.loseOneDie();
    } else {
      this.sendAction('lose die', previousPlayer.name);
      previousPlayer.loseOneDie()
    }

    this.lastWager = {};
    if (this.hasGameStarted) {
      this.beginNewRound();
    }
  }

  private handleWager(player: Player, wager: Wager) {
    // Tell players a wager was made
    this.sendAction('wager', {player: player.name, wager: wager});

    const currentPlayerIndex = this.getPlayerIndex(player);

    if (wager.callBullshit) {
      const previousPlayer = this.getPreviousPlayer(currentPlayerIndex);
      this.calledBullshit(player, previousPlayer);
    } else {
      this.lastWager = wager;
      if (wager.num === 1) {
        this.hasOnesBeenWagered = true;
      }
    }

    this.startNextTurn(player);
  }

  private startNextTurn(currentPlayer: Player) {
    // Confirm the game has not ended
    if (this.hasGameStarted) {
      const currentPlayerIndex = this.getPlayerIndex(currentPlayer);
      const nextPlayer = this.getNextPlayer(currentPlayerIndex);
      nextPlayer.startTurn();
      this.updateClients();
      if (!nextPlayer.isConnected) {
        this.startKickTimer(nextPlayer);
      }
    }
  }

  private getPlayerIndex(player: Player): number {
    return this.activePlayers.indexOf(player);
  }

  private getNextPlayer(currentPlayerIndex: number): Player {
    if (this.wasPlayerJustEliminated) { 
      // This prevents a player from being skipped when the current player was just eliminated
      currentPlayerIndex > 0 ? currentPlayerIndex-- : currentPlayerIndex = this.activePlayers.length;
      this.wasPlayerJustEliminated = false;
    }
    if (currentPlayerIndex + 1 >= this.activePlayers.length) {
      return this.activePlayers[0];
    } else {
      return this.activePlayers[currentPlayerIndex + 1];
    }
  }

  private getPreviousPlayer(currentPlayerIndex: number): Player {
    if (currentPlayerIndex - 1 < 0) {
      return this.activePlayers[this.activePlayers.length - 1];
    } else {
      return this.activePlayers[currentPlayerIndex - 1];
    }
  }

  private shuffle(array:any[]) {
    let currentIndex = array.length, temporaryValue: any, randomIndex: number;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
