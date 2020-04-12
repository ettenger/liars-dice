import PlayerData from "./PlayerData";
import Wager from "./Wager";

export default class GameData {
    players: PlayerData[] = [new PlayerData()];
    numDiceRemaining: number = 0;
    hasOnesBeenWagered: boolean = false;
    hasGameStarted: boolean = false;
    lastWager: Wager = {};
  }