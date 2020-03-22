import { Wager } from './wager';
import { Message } from './message';
import { pick } from 'lodash';
import { EventEmitter } from 'events';

export class Player {
  ws: WebSocket;
  name: string;
  numDice: number;
  currentRoll: number[];
  isInGame: boolean = false;
  isTheirTurn: boolean = false;
  lastWager: Wager;
  actions = new EventEmitter();

  constructor(ws: WebSocket, name: string) {
    this.ws = ws;
    this.name = name;
    // need to listen to WS for client placing wager or calling bullshit
  }

  get publicDetails() {
    return pick(this, ['name', 'numDice', 'isInGame', 'isTheirTurn', 'lastWager']);
  }
  
  public updateClient() {
    const message: Message = {
      type: 'data',
      name: 'player',
      payload: this
    };
    this.ws.send(JSON.stringify(message));
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
    this.actions.emit('wager', wager);
    this.updateClient();
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