import { Wager } from './wager';
import { Message } from './message';
import { pick } from 'lodash';
import { EventEmitter } from 'events';

export class Player {
  ws: any;
  name: string;
  numDice: number;
  currentRoll: number[];
  isInGame: boolean = false;
  isTheirTurn: boolean = false;
  lastWager: Wager;
  actions = new EventEmitter();

  constructor(ws) {
    this.ws = ws;
    this.ws.on('message', this.handleClientMessage.bind(this));
  }

  get publicDetails() {
    return pick(this, ['name', 'numDice', 'isInGame', 'isTheirTurn', 'lastWager']);
  }

  public setName(name: string) {
    this.name = name;
    this.actions.emit('updated', this);
  }

  public updateClient() {
    const message: Message = {
      type: 'data',
      name: 'player',
      payload: pick(this, ['name', 'numDice', 'currentRoll', 'isInGame', 'isTheirTurn', 'lastWager'])
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

  private handleClientMessage(data: string) {
    let message: Message;
    try {
      message = JSON.parse(data) as Message;
      console.log(message);
    } catch (e) {
      console.log(e, data);
      return;
    }

    if (message.type === 'data') {
      switch (message.name) {
        case 'name':
          this.setName(message.payload);
          break;
      }
    } else if (message.type === 'action') {
      switch (message.name) {
        case 'wager':
          this.placeWager(message.payload);
          break;
        case 'start game':
          this.actions.emit('start game');
          break;
      }
    }
  }
}
