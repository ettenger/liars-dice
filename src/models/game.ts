import { Player } from './player';

export class Game {
  players: Player[];
  startingNumberOfDice: number = 6;
  hasOnesBeenWagered: boolean = false;

  constructor() {
  }

  beginNewRound() {
    this.hasOnesBeenWagered = false;
  }

  get numDiceRemaining(): number {
    return this.players.map(p => p.numDice).reduce((x, y) => x + y, 0);
  } 
}