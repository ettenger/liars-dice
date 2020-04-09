import Wager from "./Wager";

export default class PlayerData {
    name: string = '';
    numDice: number = 0;
    currentRoll: number[] = [0];
    isInGame: boolean = false;
    isTheirTurn: boolean = false;
    lastWager: Wager = new Wager();
  }