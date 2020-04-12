import { Player } from './player';
import { Message } from './message';
import { Wager } from './wager';

export class Game {
  players: Player[] = [];
  startingNumberOfDice: number = 6;
  hasOnesBeenWagered: boolean = false;
  hasGameStarted: boolean = false;
  lastWager: Wager = {};

  constructor() {
  }

  get numDiceRemaining(): number {
    return this.players.map(p => p.numDice).reduce((x, y) => x + y, 0);
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

  public addPlayer(player: Player) {
    this.players.push(player);
    // TODO: Remove event listener when player leaves
    player.actions.on('wager', wager => this.handleWager(player, wager));
    player.actions.on('updated', playerName => this.handleUpdate(playerName));
    player.actions.on('start game', () => this.handleGameStart());
    player.actions.on('reset game', () => this.handleGameReset());
  }

  private beginNewRound() {
    this.sendAction('round start','');
    this.hasOnesBeenWagered = false;
    this.players.forEach(player => {
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
    this.players.forEach(player => {
      player.beginGame(this.startingNumberOfDice);
    });

    // Send state data
    this.updateClients();
  }

  private handleGameReset() {
    this.startingNumberOfDice = 6;
    this.hasOnesBeenWagered = false;
    this.hasGameStarted = false;
    this.lastWager = {};
    this.players.forEach(player => {
      player.isTheirTurn = false;
    });
    this.updateClients();
  }

  private sendAction(actionName: string, payload: any) {
    // Send action message to clients for the game log
    const message: Message = { type: 'action', name: actionName, payload: payload};
    this.broadcastToClients(message);
  }

  private handleUpdate(player: Player) {
    // Send action message to clients for the game log
    this.sendAction('player join', player.name)

    // Send state data to clients for rendering
    this.updateClients();
    player.updateClient();
  }

  private broadcastToClients(message: Message) {
    this.players.forEach(player => {
      player.ws.send(JSON.stringify(message));
    })
  }

  private updateClients() {
    const message: Message = {
      type: 'data',
      name: 'game',
      payload: this.publicGameDetails
    };
    this.broadcastToClients(message);
  }

  // Returns true if wager was correct, false for bullshit
  private testWager(wager: Wager): boolean {
    let counterFxn;
    if (this.hasOnesBeenWagered) {
      counterFxn = d => d === wager.num;
    } else {
      // Ones are wild unless they've been called
      counterFxn = d => d === wager.num || d === 1;
    }

    const allDice: number[] = this.players.map(p => p.currentRoll).reduce((a, b) => a.concat(b), []);
    const count = allDice.filter(counterFxn).length;

    // Notify clients of the result
    // TODO: Need to reveal everybody's dice to the players
    this.sendAction('dice reveal',{count: count, num: wager.num});

    return count >= wager.qty;
  }

  private calledBullshit(caller: Player, previousPlayer: Player) {
    const wagerToTest = previousPlayer.lastWager;
    const wagerWasSafe = this.testWager(wagerToTest);
    if (wagerWasSafe) {
      caller.loseOneDie();
      this.sendAction('lose die', caller.name);
    } else {
      previousPlayer.loseOneDie()
      this.sendAction('lose die', previousPlayer.name);
    }
    // TODO: Handle end of player and end of game scenarios
    this.lastWager = {};
    this.beginNewRound();
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

    const nextPlayer = this.getNextPlayer(currentPlayerIndex);
    nextPlayer.startTurn();
    this.updateClients();
  }

  private getPlayerIndex(player: Player): number {
    return this.players.indexOf(player);
  }

  private getNextPlayer(currentPlayerIndex: number): Player {
    if (currentPlayerIndex + 1 >= this.players.length) {
      return this.players[0];
    } else {
      return this.players[currentPlayerIndex + 1];
    }
  }

  private getPreviousPlayer(currentPlayerIndex: number): Player {
    if (currentPlayerIndex - 1 < 0) {
      return this.players[this.players.length - 1];
    } else {
      return this.players[currentPlayerIndex - 1];
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
