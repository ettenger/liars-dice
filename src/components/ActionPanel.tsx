import React from 'react'; 
import Message from '../interfaces/Message';
import GameData from '../interfaces/GameData';
import WagerInput from './WagerInput';
import PlayerData from '../interfaces/PlayerData';

type myProps = {
  messagesSender: any,
  gameData: GameData,
  playerData: PlayerData
};

export default class ActionPanel extends React.Component<myProps> {
  constructor(props: myProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private handleSubmit() {
    const message : Message = { type: 'action', name: 'start game', payload: {} };
    this.props.messagesSender(message);
  }

  private OnesBanner = (props: { hasOnesBeenWagered: boolean }) => {
    if (props.hasOnesBeenWagered) {
      return (
        <div className="Ones-banner" style={{backgroundColor: '#ff5555'}}>
          Ones are no longer wild
        </div>
      );
    } else {
      return (
        <div className="Ones-banner" style={{backgroundColor: '#398a18'}}>
          Ones are still wild
        </div>
      );
    }
  }

  render() {

    if (this.props.gameData.hasGameStarted) {
      return (
        <div className="Action-panel">
          <this.OnesBanner hasOnesBeenWagered = {this.props.gameData.hasOnesBeenWagered} />
          <WagerInput 
            messagesSender = {this.props.messagesSender} 
            gameData = {this.props.gameData} 
            playerData = {this.props.playerData}
          />
        </div>
      );
    } else {
      return (
        <div className="Action-panel">
          <div>
            <button type="submit" value="Start Game" onClick={this.handleSubmit}>Start Game</button>
          </div>
        </div>
      );
    }
  }
}