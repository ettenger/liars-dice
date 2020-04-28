import React from 'react'; 
import GameData from '../interfaces/GameData';
import PlayerData from '../interfaces/PlayerData';

type myProps = {
  gameData: GameData
};

export default class StatusTable extends React.Component<myProps> {

  private PlayerInfo = (props: { key: any, player: PlayerData }) => {
    // TODO: Handle display of diconnected players
    if (!props.player.isConnected) {
      return (
        <tr className={props.player.isTheirTurn ? 'highlight-text' : ''}>
          <td><i>{ props.player.name }</i></td>
          <td><i>{ props.player.numDice }</i></td>
        </tr>
      );
    } else {
      return (
        <tr className={props.player.isTheirTurn ? 'highlight-text' : ''}>
          <td>{ props.player.name }</td>
          <td>{ props.player.numDice }</td>
        </tr>
      );
    }
    
  }

  render() {
    return (
      <div className="status-div">
        <table className="Status-table">
          <tbody>
            <tr>
              <th>Player</th>
              <th>Dice</th>
            </tr>
            { this.props.gameData.players.map((player, index) =>
              <this.PlayerInfo
                key={index}
                player={player}
              />,
            )}
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{ this.props.gameData.numDiceRemaining }</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}