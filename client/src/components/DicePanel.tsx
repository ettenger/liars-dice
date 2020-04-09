import React from 'react'; 
import PlayerData from '../interfaces/PlayerData';

type myProps = {
  playerData: PlayerData
};

export default class DicePanel extends React.Component<myProps> {

  render() {
    return (
      <div className="DicePanel">
        <img src="../images/dice1.svg" alt="1" height="100" width="100"></img>
      </div>
    );
  }
}