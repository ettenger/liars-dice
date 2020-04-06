import React from 'react'; 
import Message from '../interfaces/message';

type myProps = {
  key: any,
  message: Message
};

export class GameLogMessage extends React.Component<myProps> {

  private formatMessage = (message: Message) => {
    let returnVal: any;

    // const actionData = { kind: 'player add', data: player.name };
    if (message.type === 'action' && message.name === 'game') {
      switch (message.payload.kind) {
        case 'player add':
          returnVal = <span style={{color: 'green'}}>{ message.payload.data } joined the game</span>;
          break;
      }
    } 

    return returnVal;
  }

  render() {
    const output = this.formatMessage(this.props.message);
    return (
      <p>
        { output }
      </p>
    );
  }
}

export default GameLogMessage;

  // private updateClients() {
  //   const message: Message = {
  //     type: 'data',
  //     name: 'game',
  //     payload: this.publicGameDetails
  //   };
  //   this.broadcastToClients(message);
  // }
  // get publicGameDetails() {
  //   return {
  //     players: this.players.map(p => p.publicDetails),
  //     numDiceRemaining: this.numDiceRemaining,
  //     hasOnesBeenWagered: this.hasOnesBeenWagered
  //   }
  // }