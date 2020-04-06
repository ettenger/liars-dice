import React from 'react'; 
import Message from '../interfaces/message';

type myProps = {
  messages: Message[]
};

export class GameLog extends React.Component<myProps> {

  private GameLogMessage = (props: { key: any, message: Message }) => {
    let returnVal: any;

    // const actionData = { kind: 'player add', data: player.name };
    if (props.message.type === 'action' && props.message.name === 'game') {
      switch (props.message.payload.kind) {
        case 'player add':
          returnVal = 
            <p>
              <span style={{color: 'green'}}>{ props.message.payload.data } joined the game</span>
            </p>;
          break;
      }
    } 

    return returnVal;
  }

  render() {
    return (
      <div>
        <p>Game Log</p>
        {this.props.messages.map((message, index) =>
          <this.GameLogMessage
            key={index}
            message={message}
          />,
        )}
      </div>
    );
  }
}

export default GameLog;