import { Player } from './player';
import { Message } from './message';

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
    // TODO: Add listeners for wagering or calling bullshit
    this.updateClients();
  }

  beginNewRound() {
    this.hasOnesBeenWagered = false;
    this.players.forEach(player => {
      player.beginNewRound();
    });
    this.updateClients();
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
}
