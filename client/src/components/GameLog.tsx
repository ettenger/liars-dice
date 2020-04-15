import React, { Fragment } from 'react'; 
import Message from '../interfaces/Message'
import Wager from '../interfaces/Wager';

type myProps = {
  messages: Message[]
};

type diceReveal = {
  name: string,
  dice: number[]
};

export default class GameLog extends React.Component<myProps> {

  private GameLogMessage = (props: { key: any, message: Message }) => {
    let returnVal: any;

    if (props.message.type === 'action') {
      switch (props.message.name) {
        case 'player join':
          returnVal = <span style={{display: 'flex', color: '#9b9b9b'}}>{props.message.payload} joined the game<br/></span>;
          break;
        case 'game start':
          returnVal = <span style={{display: 'flex', color: 'cyan'}}>The game is starting!<br/></span>;
          break;
        case 'wager':
          returnVal = 
            <span style={{display: 'flex'}}>
              <span style={{color: '#ffc400'}}>{props.message.payload.player}:&nbsp;</span>
              <span style={{color: 'white'}}>{this.formatWager(props.message.payload.wager)}<br/></span>
            </span>
          break;
        case 'dice reveal':
          const tempWager: Wager = { callBullshit: false, num: props.message.payload.num, qty: props.message.payload.count}
          let allDice: Array<diceReveal> = props.message.payload.dice;

          returnVal = 
            <>
              { allDice.map((dice, key) => (
                <Fragment key={key}>
                  <span style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{color: '#ffc400'}}>{dice.name}:&nbsp;</span>
                    { dice.dice.sort().map((num, index) =>
                      <this.GameDice
                        key={index}
                        num={num}
                      />,
                    )}
                  <br/></span>
                </Fragment>
              )) }
              <span style={{display: 'flex', color: '#d842a6'}}>There {props.message.payload.count !== 1 ? 'are':'is'} {this.formatWager(tempWager)}<br/></span>
            </>
          break;
        case 'lose die':
          returnVal = <span style={{display: 'flex', color: '#d842a6'}}>{props.message.payload} loses a die<br/></span>
          break;
        case 'round start':
          returnVal = <span style={{display: 'flex', color: 'cyan'}}>Starting a new round!<br/></span>;
          break;
        case 'player eliminated':
          returnVal = <span style={{display: 'flex', color: '#ff4d4d'}}>{props.message.payload} was eliminated!<br/></span>;
          break;
        case 'game over':
          returnVal = <span style={{display: 'flex', color: '#299129'}}>The game is over. {props.message.payload} wins!<br/></span>;
          break;
      }
    } 

    return returnVal;
  }

  private GameDice = (props: { key: any, num: Number }) => {
    if (props.num===0) { return(<span></span>); }
    return (
      <img 
        src={"../images/dice"+ props.num.toString() + ".svg"} 
        alt={props.num.toString()} 
        height="20px" 
        className="img-dice">
      </img>
    );
  }

  private formatWager(wager: Wager) {
    let numberStrings = ['one', 'two', 'three', 'four', 'five', 'six']
    if (wager.callBullshit) {
      return 'Bullshit!';
    } else if (wager.num) {
      return (
        (wager.qty && wager.qty > 0 ? wager.qty : 'no') 
        + ' ' + numberStrings[wager.num-1] 
        + (((wager.qty || wager.num) && wager.qty !== 1 ) ? ((wager.num===6) ? 'es' : 's') : ''));
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