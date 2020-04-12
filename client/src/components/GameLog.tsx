import React from 'react'; 
import Message from '../interfaces/Message'
import Wager from '../interfaces/Wager';

type myProps = {
  messages: Message[]
};

export default class GameLog extends React.Component<myProps> {

  private GameLogMessage = (props: { key: any, message: Message }) => {
    let returnVal: any;

    if (props.message.type === 'action') {
      switch (props.message.name) {
        case 'player join':
          returnVal = <span style={{color: 'green'}}>{props.message.payload} joined the game<br/></span>;
          break;
        case 'game start':
          returnVal = <span style={{color: 'cyan'}}>The game is starting!<br/></span>;
          break;
        case 'wager':
          returnVal = 
            <span>
              <span style={{color: '#ffc400'}}>{props.message.payload.player}: </span>
              <span style={{color: 'white'}}>{this.formatWager(props.message.payload.wager)}<br/></span>
            </span>
      }
    } 

    return returnVal;
  }

  private formatWager(wager: Wager) {
    let numberStrings = ['one', 'two', 'three', 'four', 'five', 'six']
    if (wager.callBullshit) {
      return 'Bullshit!';
    } else if (wager.num && wager.qty) {
      return (wager.qty + ' ' + numberStrings[wager.num-1] + ((wager.qty > 1 ) ? ((wager.num===6) ? 'es' : 's') : ''));
    }
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