import { Wager } from './wager';
import { Message } from './message';
import { pick } from 'lodash';
import { EventEmitter } from 'events';
import WebSocket from 'ws';

// TODO: Implement 30 second kick timer for disconnected players (when it's their turn)

export class Player {
  ws: WebSocket;
  uuid: string;
  name: string = '';
  numDice: number = 0;
  currentRoll: number[] = [0];
  isInGame: boolean = false;
  isTheirTurn: boolean = false;
  lastWager: Wager = {};
  actions = new EventEmitter();
  isConnected: boolean = true;

  constructor(ws: WebSocket, uuid: string) {
    this.ws = ws;
    this.uuid = uuid
    this.createListeners();
  }

  get publicDetails() {
    return pick(this, ['name', 'numDice', 'isInGame', 'isTheirTurn', 'lastWager', 'isConnected']);
  }

  public setName(name: string) {
    this.name = name;
    this.actions.emit('updated', this);
  }

  private createListeners() {
    this.ws.on('message', this.handleClientMessage.bind(this));
    this.ws.on('close', this.handleClientDisconnect.bind(this));
  }

  private handleClientDisconnect() {
    this.isConnected = false;
    this.actions.emit('disconnected', this);
  }

  public rejoin(ws: WebSocket) {
    this.ws = ws;
    this.isConnected = true;
    this.createListeners();
    this.updateClient();
    this.actions.emit('rejoined', this);
  }

  public updateClient() {
    const message: Message = {
      type: 'data',
      name: 'player',
      payload: pick(this, ['name', 'numDice', 'currentRoll', 'isInGame', 'isTheirTurn', 'lastWager'])
    };
    console.log(JSON.stringify(message));
    this.ws.send(JSON.stringify(message));
  }

  public beginGame(numDice: number) {
    this.numDice = numDice;
    this.isInGame = true;
    this.lastWager = {};
    this.beginNewRound();
  }

  public beginNewRound() {
    this.lastWager = {};
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
      this.currentRoll = [];
      this.actions.emit('player eliminated', this);
    }
    this.updateClient();
  }

  public roll() {
    this.currentRoll = [...Array(this.numDice)].map(() => this.randNumberOneToSix());
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
          this.setName(message.payload.name);
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
