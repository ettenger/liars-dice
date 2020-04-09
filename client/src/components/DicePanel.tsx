import React from 'react'; 
import PlayerData from '../interfaces/PlayerData';

type myProps = {
  playerData: PlayerData
};

export default class DicePanel extends React.Component<myProps> {

  private GameDice = (props: { key: any, num: Number }) => {
    return <img src={"../images/dice"+ props.num.toString() + ".svg"} alt={props.num.toString()} height="100" width="100"></img>
  }

  render() {
    return (
      <div className="DicePanel">
        { this.props.playerData.currentRoll.map((num, index) =>
          <this.GameDice
            key={index}
            num={num}
          />,
        )}
      </div>
    );
  }
}