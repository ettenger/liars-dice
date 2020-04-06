import { Player } from './player';
import { Message } from './message';
import { Wager } from './wager';

export class Game {
  players: Player[] = [];
  startingNumberOfDice: number = 6;
  hasOnesBeenWagered: boolean = false;

  constructor() {
  }

  get numDiceRemaining(): number {
    return this.players.map(p => p.numDice).reduce((x, y) => x + y, 0);
  }

  get publicGameDetails() {
    return {
      players: this.players.map(p => p.publicDetails),
      numDiceRemaining: this.numDiceRemaining,
      hasOnesBeenWagered: this.hasOnesBeenWagered
    }
  }

  public addPlayer(player: Player) {
    this.players.push(player);
    // TODO: Remove event listener when player leaves
    player.actions.on('wager', wager => this.handleWager(player, wager));
    player.actions.on('updated', plyr => this.handleUpdate(plyr));
  }

  beginNewRound() {
    this.hasOnesBeenWagered = false;
    this.players.forEach(player => {
      player.beginNewRound();
    });
    this.updateClients();
  }

  private handleUpdate(player: Player) {
    const actionData = { kind: 'player add', data: player.name };
    this.sendActionToClients(actionData);
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

  private sendActionToClients(data: any) {
    const message: Message = {
      type: 'action',
      name: 'game',
      payload: data
    };
    this.broadcastToClients(message);
  }

  // Returns true if wager was correct, false for bullshit
  private testWager(wager: Wager): boolean {
    let counterFxn;
    if (this.hasOnesBeenWagered) {
      counterFxn = d => d === wager.die;
    } else {
      // Ones are wild unless they've been called
      counterFxn = d => d === wager.die || d === 1;
    }

    const allDice: number[] = this.players.map(p => p.currentRoll).reduce((a, b) => a.concat(b), []);
    const count = allDice.filter(counterFxn).length;
    return count >= wager.num;
  }

  private calledBullshit(caller: Player, previousPlayer: Player) {
    // TODO: Need to reveal everybody's dice to the players
    const wagerToTest = previousPlayer.lastWager;
    const wagerWasSafe = this.testWager(wagerToTest);
    if (wagerWasSafe) {
      caller.loseOneDie();
    } else {
      previousPlayer.loseOneDie()
    }
    this.beginNewRound();
  }

  private handleWager(player: Player, wager: Wager) {
    const currentPlayerIndex = this.getPlayerIndex(player);

    if (wager.callBullshit) {
      const previousPlayer = this.getPreviousPlayer(currentPlayerIndex);
      this.calledBullshit(player, previousPlayer);
    } else {
      if (wager.die === 1) {
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
}
