import React from 'react'; 
import Message from '../interfaces/Message'
import GameLogMessage from './GameLogMessage';

type myProps = {
  messages: Message[]
};

export default class GameLog extends React.Component<myProps> {
  render() {
    return (
      <div className="Gamelog">
        <p>
          { this.props.messages.map((msg, index) =>
            <GameLogMessage
              key={index}
              message={msg}
            />,
          )}
        </p>
      </div>
    );
  }
}