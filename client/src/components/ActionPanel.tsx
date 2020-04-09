import React from 'react'; 
import Message from '../interfaces/Message';
import GameData from '../interfaces/GameData';
import PlayerData from '../interfaces/PlayerData';

type myProps = {
  messagesSender: any,
  gameData: GameData,
  playerData: PlayerData
};

export default class ActionPanel extends React.Component<myProps> {
  constructor(props: myProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({value: e.target.value});
  }

  handleSubmit(e: React.FormEvent) {
    const message : Message = { type: 'action', name: 'start game', payload: {} };
    this.props.messagesSender(message);
    e.preventDefault();
  }

  handleReset(e: React.FormEvent) {
    const message : Message = { type: 'action', name: 'reset game', payload: {} };
    this.props.messagesSender(message);
    e.preventDefault();
  }

  render() {
    // TODO: Finish rendering the action panel
    if (this.props.gameData.hasGameStarted) {
      return (
        <div className="ActionPanel">
          <form onSubmit={this.handleReset}>
            <input type="submit" value="Reset Game" />
          </form>
        </div>
      );
    } else {
      return (
        <div className="ActionPanel">
          <form onSubmit={this.handleSubmit}>
            <input type="submit" value="Start Game" />
          </form>
        </div>
      );
    }
  }
}