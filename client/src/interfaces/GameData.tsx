import PlayerData from "./PlayerData";

export default interface GameData {
    players: PlayerData[];
    startingNumberOfDice: number;
    hasOnesBeenWagered: boolean;
    hasGameStarted: boolean;
  }