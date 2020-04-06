import React from 'react'; 
import GameLogMessage from './GameLogMessage';
import Message from '../interfaces/message';

type myProps = {
  messages: Message[]
};

export class GameLog extends React.Component<myProps> {

  render() {
    return (
      <div>
        <p>Game Log</p>
        {this.props.messages.map((message, index) =>
          <GameLogMessage
            key={index}
            message={message}
          />,
        )}
      </div>
    );
  }
}

export default GameLog;