import Wager from "./Wager";

export default interface PlayerData {
    name: string;
    numDice: number;
    currentRoll: number[];
    isInGame: boolean;
    isTheirTurn: boolean;
    lastWager: Wager;
  }