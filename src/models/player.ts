import { Wager } from './wager';

export class Player {
  ws: WebSocket;
  name: string;
  numDice: number;
  currentRoll: number[];
  isInGame: boolean = false;
  isTheirTurn: boolean = false;
  lastWager: Wager;

  constructor(ws: WebSocket, name: string) {
    this.ws = ws;
    this.name = name;
    // need to listen to WS for client placing wager or calling bullshit
  }
  
  public updateClient() {
    this.ws.send(JSON.stringify({ player: this }));
  }

  public beginGame(numDice: number) {
    this.numDice = numDice;
    this.isInGame = true;
    this.beginNewRound();
  }

  public beginNewRound() {
    this.roll();
    this.updateClient();
  }

  public startTurn() {
    this.isTheirTurn = true;
    this.updateClient();
  }

  public placeWager(wager: Wager) {
    this.lastWager = wager;
    this.isTheirTurn = false;
    // emit to game if 1s were wagered
    this.updateClient();
  }

  public callBullshit() {
    // emit to the game that we're calling bullshit?
  }

  public loseOneDie() {
    this.numDice = this.numDice - 1;
    
    if (this.numDice === 0) {
      this.isInGame = false;
    }
    this.updateClient();
  }

  public roll() {
    this.currentRoll = new Array(this.numDice).map(this.randNumberOneToSix);
  }

  private randNumberOneToSix(): number {
    return Math.ceil(Math.random() * 6);
  }
}