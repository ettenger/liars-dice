import React, { Fragment } from 'react'; 
import Message from '../interfaces/Message'
import Wager from '../interfaces/Wager';
import MiniDice from './MiniDice';
import PlayerData from '../interfaces/PlayerData';

type myProps = {
  key: any,
  message: Message
};

type myState = {
  countdownTimer: number
};

type diceReveal = {
  name: string,
  dice: number[]
};

const TIMER_MAX: number = 30000 // Miliseconds

export default class GameLogMessage extends React.Component<myProps, myState> {
  private timerId?: ReturnType<typeof setTimeout>;

  constructor(props: myProps) {
    super(props);
    this.state = { countdownTimer: TIMER_MAX/1000 };
    this.countdownTimerTick = this.countdownTimerTick.bind(this);
  }

  componentDidMount() {
    if (this.props.message.type === 'action' && this.props.message.name === 'start timer') {
      this.timerId = setInterval(this.countdownTimerTick, 1000)
    }
  }

  componentWillUnmount() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  shouldComponentUpdate() {
    return this.state.countdownTimer <= 0 ? false : true;
  }

  private countdownTimerTick () {
    let player: PlayerData = this.props.message.payload;
    let count: number = TIMER_MAX + (player.timerStartTime - new Date().valueOf());
    count = Math.round(count/1000);
    this.setState({ countdownTimer: count });
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
    let returnVal: any;

    if (this.props.message.type === 'action') {
      switch (this.props.message.name) {
        case 'player join':
          returnVal = <span style={{display: 'flex', color: '#9b9b9b'}}>{this.props.message.payload} joined the game<br/></span>;
          break;
        case 'player removed':
          returnVal = <span style={{display: 'flex', color: '#9b9b9b'}}>{this.props.message.payload} was kicked due to inactivity<br/></span>;
          break;
        // case 'player rejoin':
        //   returnVal = <span style={{display: 'flex', color: '#9b9b9b'}}>{this.props.message.payload} rejoined the game<br/></span>;
        //   break;
        // case 'player drop':
        //   returnVal = <span style={{display: 'flex', color: '#9b9b9b'}}>{this.props.message.payload} disconnected<br/></span>;
        //   break;
        case 'game start':
          returnVal = <span style={{display: 'flex', color: 'cyan'}}>The game is starting!<br/></span>;
          break;
        case 'wager':
          returnVal = 
            <span style={{display: 'flex'}}>
              <span style={{color: '#ffc400'}}>{this.props.message.payload.player}:&nbsp;</span>
              <span style={{color: 'white'}}>{this.formatWager(this.props.message.payload.wager)}<br/></span>
            </span>
          break;
        case 'dice reveal':
          const tempWager: Wager = { callBullshit: false, num: this.props.message.payload.num, qty: this.props.message.payload.count}
          let allDice: Array<diceReveal> = this.props.message.payload.dice;

          returnVal = 
            <>
              { allDice.map((ad, key) => (
                <Fragment key={key}>
                  <span style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{color: '#ffc400'}}>{ad.name}:&nbsp;</span>
                    { ad.dice.sort().map((num, index) =>
                      <MiniDice
                        key={index}
                        num={num}
                      />,
                    )}
                  <br/></span>
                </Fragment>
              )) }
              <span style={{display: 'flex', color: '#d842a6'}}>There {this.props.message.payload.count !== 1 ? 'are':'is'} {this.formatWager(tempWager)}<br/></span>
            </>
          break;
        case 'lose die':
          returnVal = <span style={{display: 'flex', color: '#d842a6'}}>{this.props.message.payload} loses a die<br/></span>
          break;
        case 'round start':
          returnVal = <span style={{display: 'flex', color: 'cyan'}}>Starting a new round!<br/></span>;
          break;
        case 'start timer':
          let player: PlayerData = this.props.message.payload;

          returnVal = 
            <span style={{display: 'flex', color: '#9b9b9b'}}>
              {player.name} is inactive and will be kicked in {this.state.countdownTimer}s
              <br/>  
            </span>;
          break;
        case 'player eliminated':
          returnVal = <span style={{display: 'flex', color: '#ff4d4d'}}>{this.props.message.payload} was eliminated!<br/></span>;
          break;
        case 'game over':
          returnVal = <span style={{display: 'flex', color: '#299129'}}>The game is over. {this.props.message.payload} wins!<br/></span>;
          break;
        default:
          returnVal = <></>
          break;
      }
    } 

    return returnVal;
  }
}