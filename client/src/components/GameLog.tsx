import React from 'react'; 
import Message from '../interfaces/Message'

type myProps = {
  messages: Message[]
};

export default class GameLog extends React.Component<myProps> {

  private GameLogMessage = (props: { key: any, message: Message }) => {
    let returnVal: any;

    // const actionData = { kind: 'player add', data: player.name };
    if (props.message.type === 'action') {
      switch (props.message.name) {
        case 'player join':
          returnVal = 
              <span style={{color: 'green'}}>{ props.message.payload } joined the game<br/></span>;
          break;
        case 'game start':
          returnVal = 
              <span style={{color: 'cyan'}}>The game is starting!<br/></span>;
          break;
      }
    } 

    return returnVal;
  }

  render() {
    return (
      <div className="Gamelog">
        <p>
          { this.props.messages.map((message, index) =>
            <this.GameLogMessage
              key={index}
              message={message}
            />,
          )}
        </p>
      </div>
    );
  }
}