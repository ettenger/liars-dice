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
    this.handleReset = this.handleReset.bind(this);
  }

  private handleSubmit() {
    const message : Message = { type: 'action', name: 'start game', payload: {} };
    this.props.messagesSender(message);
  }

  private handleReset() {
    const message : Message = { type: 'action', name: 'reset game', payload: {} };
    this.props.messagesSender(message);
  }

  render() {
    if (this.props.gameData.hasGameStarted) {
      return (
        <div className="Action-panel">
          <div className="Reset-btn-div">
            <button type="submit" value="Reset Game" onClick={this.handleReset}>Reset Game</button> 
          </div>
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