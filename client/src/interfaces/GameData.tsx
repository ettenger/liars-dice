import PlayerData from "./PlayerData";

export default class GameData {
    players: PlayerData[] = [new PlayerData()];
    numDiceRemaining: number = 0;
    hasOnesBeenWagered: boolean = false;
    hasGameStarted: boolean = false;
  }