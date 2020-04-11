import React from 'react'; 
import GameData from '../interfaces/GameData';
import PlayerData from '../interfaces/PlayerData';

type myProps = {
  gameData: GameData
};

export default class StatusTable extends React.Component<myProps> {

  private GameDice = (props: { key: any, player: PlayerData }) => {
    return (
      <tr className={props.player.isTheirTurn ? 'highlight-text' : ''}>
        <td>{ props.player.name }</td>
        <td>{ props.player.numDice }</td>
      </tr>
    );
  }

  render() {
    // TODO: Use react-table to make this pretty: https://github.com/tannerlinsley/react-table
    return (
      <div>
        <table className="Status-table">
          <tbody>
            <tr>
              <th>Player</th>
              <th>Dice</th>
            </tr>
            { this.props.gameData.players.map((player, index) =>
              <this.GameDice
                key={index}
                player={player}
              />,
            )}
          </tbody>
        </table>
      </div>
    );
  }
}