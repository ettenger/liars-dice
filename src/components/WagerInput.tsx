import React from 'react'; 
import Message from '../interfaces/Message';
import GameData from '../interfaces/GameData';
import PlayerData from '../interfaces/PlayerData';
import Wager from '../interfaces/Wager';

type myProps = {
  messagesSender: any,
  gameData: GameData,
  playerData: PlayerData
};

type myState = {
  minDiceNum: number,
  minDiceQty: number,
  currentNum: number,
  currentQty: number,
  submitAllowed: boolean
};

export default class WagerInput extends React.Component<myProps, myState> {
  constructor(props: myProps) {
    super(props);
    this.changeWagerNum = this.changeWagerNum.bind(this);
    this.placeWager = this.placeWager.bind(this);
    this.updateState = this.updateState.bind(this);
    this.legalWagerChange = this.legalWagerChange.bind(this);
    this.state = { minDiceNum: 0, minDiceQty: 0, currentNum: 0, currentQty: 0, submitAllowed: true };
  }

  componentDidMount() {
    this.updateState();
  }

  private updateState() {
    if (this.props.gameData.lastWager.num && this.props.gameData.lastWager.qty) {
      let minNum: number;
      let minQty: number;
      let allowSubmit: boolean = true;

      if ((this.props.gameData.lastWager.num === 6) 
      && (this.props.gameData.lastWager.qty === this.props.gameData.numDiceRemaining)) {
        minNum = 6;
        minQty = this.props.gameData.lastWager.qty;
        allowSubmit = false;
      } else if (this.props.gameData.lastWager.num === 6) {
        minNum = 1;
        minQty = this.props.gameData.lastWager.qty + 1;
      } else {
        minNum = this.props.gameData.lastWager.num + 1 ;
        minQty = this.props.gameData.lastWager.qty;
      }

      this.setState({ 
        minDiceNum: minNum,
        minDiceQty: minQty,
        currentNum: minNum, 
        currentQty: minQty,
        submitAllowed: allowSubmit
      });
    } else {
      this.setState({ 
        minDiceNum: 1, 
        minDiceQty: 1,
        currentNum: 1,
        currentQty: 1,
        submitAllowed: true
      });
    }
  }

  private placeWager(calledBS: boolean = false, deadOn: boolean = false) {
    let wager : Wager;
    if (calledBS) {
      wager = { callBullshit: calledBS, num: this.props.gameData.lastWager.num, qty: this.props.gameData.lastWager.qty };
    } else if (deadOn) {
      wager = { deadOn: deadOn, num: this.props.gameData.lastWager.num, qty: this.props.gameData.lastWager.qty };
    } else {
      wager = { callBullshit: calledBS, num: this.state.currentNum, qty: this.state.currentQty };
    }
    const message : Message = { type: 'action', name: 'wager', payload: wager };
    this.props.messagesSender(message);
  }

  private changeWagerQty(direction: 'increase' | 'decrease') {
    let currentNum = this.state.currentNum;
    let currentQty = this.state.currentQty;
    let minQty = this.state.minDiceQty;
    let minNum = this.state.minDiceNum;
    let diceRemaining = this.props.gameData.numDiceRemaining;

    if ((direction==='increase') && (currentQty < diceRemaining)) {
      this.setState({ currentQty: currentQty + 1 });  
    } else if ((direction==='decrease') && (currentQty === (minQty+1)) && currentNum < minNum) {
      this.setState({ currentQty: currentQty - 1, currentNum: minNum });  
    } else if ((direction==='decrease') && (currentQty > minQty)) {
      this.setState({ currentQty: currentQty - 1 });  
    }
  }

  private legalWagerChange(direction: 'increase' | 'decrease') {
    let currentNum = this.state.currentNum;
    let currentQty = this.state.currentQty;
    let minQty = this.state.minDiceQty;
    let minNum = this.state.minDiceNum;
    let diceRemaining = this.props.gameData.numDiceRemaining;
    let returnVal: boolean = false;

    if (direction==='increase' && currentNum === 6) {
      if (currentQty < diceRemaining) {
        returnVal = true;
      }
    } else if (direction==='increase') {
      returnVal = true;
    } else if (direction==='decrease' && currentNum === 1) {
      if (minQty < currentQty) {
        returnVal = true;
      }
    } else if (direction==='decrease') {
      if (!(currentQty===minQty && currentNum===minNum)) {
        returnVal = true;
      }
    }
    return returnVal;
  }

  private changeWagerNum(direction: 'increase' | 'decrease') {
    let currentNum = this.state.currentNum;
    let currentQty = this.state.currentQty;
    let minQty = this.state.minDiceQty;
    let minNum = this.state.minDiceNum;
    let diceRemaining = this.props.gameData.numDiceRemaining;

    if (direction==='increase') {
      switch (true) {
        case currentNum < 6:
          this.setState({currentNum: currentNum + 1});
          break;
        case currentNum === 6:
          // Allow the + button to rollover from 6 to 1, but increase the wager qty
          // Only allow legal wagers
          if (currentQty < diceRemaining) {
            this.setState({ currentNum: 1, currentQty: currentQty + 1 });
          }
          break;
      }
    } else {
      switch (true) {
        case currentNum > 1:
          //Only allow legal wagers
          if (!(currentQty===minQty && currentNum===minNum)) {
            this.setState({ currentNum: currentNum - 1 });
          }
          break;
        case currentNum === 1:
          // Allow the - button to rollowver from 1 to 6, but decrease the wager qty
          // Only allow legal wagers
          if (minQty < currentQty) {
            this.setState({ currentNum: 6, currentQty: currentQty - 1 });
          }
          break;
      }
    }
  }

  private gameDice = (props: { num: Number }) => {
    if (props.num===0) { return(<span></span>); }
    return (
      <img 
        src={"../images/dice"+ props.num.toString() + ".svg"} 
        alt={props.num.toString()} 
        height="45px" 
        className="img-dice">
      </img>
    );
  }

  private sensitiveButton = (props: { label: string, onClick: any, sensitivityControl: boolean }) => {
    if (props.sensitivityControl) {
      return (<button type="submit" onClick={props.onClick}>{props.label}</button>);
    } else {
      return (<button type="submit" onClick={props.onClick} disabled>{props.label}</button>);
    }
  }

  componentDidUpdate(prevProps: myProps) {
    if ((this.props.gameData.lastWager.num !== prevProps.gameData.lastWager.num)
      || (this.props.gameData.lastWager.qty !== prevProps.gameData.lastWager.qty)
      || (this.props.gameData.numDiceRemaining !== prevProps.gameData.numDiceRemaining)) {
        this.updateState();
    }
  }

  render() {
    return (
      <div className="Wager-input">
        <div style={{margin: "0 5px"}}>Enter a wager:</div>
        <div className="div-vertical-btns">
          <this.sensitiveButton 
            label='+' 
            onClick={() => this.changeWagerQty('increase')} 
            sensitivityControl={this.props.playerData.isTheirTurn && (this.state.currentQty < this.props.gameData.numDiceRemaining)}
          />
          <this.sensitiveButton 
            label='-' 
            onClick={() => this.changeWagerQty('decrease')} 
            sensitivityControl={this.props.playerData.isTheirTurn && (this.state.currentQty > this.state.minDiceQty)}
          />
        </div>
        <div>
          { this.state.currentQty }
        </div>
        <div style={{margin: "0 5px"}}>x</div>
        <this.gameDice num = { this.state.currentNum ? this.state.currentNum : 1 } />
        <div className="div-vertical-btns">
          <this.sensitiveButton 
            label='+' 
            onClick={() => this.changeWagerNum('increase')} 
            sensitivityControl={this.props.playerData.isTheirTurn && this.legalWagerChange('increase')}
          />
          <this.sensitiveButton 
            label='-' 
            onClick={() => this.changeWagerNum('decrease')} 
            sensitivityControl={this.props.playerData.isTheirTurn && this.legalWagerChange('decrease')}
          />
        </div>
        <div>
          <this.sensitiveButton 
            label='Submit Wager' 
            onClick={() => this.placeWager()} 
            sensitivityControl={this.props.playerData.isTheirTurn && this.state.submitAllowed}
          />
        </div>
        <div style={{margin: "0 5px"}}>or</div>
        <div>
          <this.sensitiveButton 
            label='Call BS' 
            onClick={() => this.placeWager(true)} 
            sensitivityControl={this.props.playerData.isTheirTurn && (this.state.minDiceNum > 1 || this.state.minDiceQty > 1)}
          />
        </div>
        <div style={{margin: "0 5px"}}>or</div>
        <div> 
          <this.sensitiveButton 
            label='Dead On' 
            onClick={() => this.placeWager(false, true)} 
            sensitivityControl={this.props.playerData.isTheirTurn && (this.state.minDiceNum > 1 || this.state.minDiceQty > 1)}
          />
        </div>
      </div>
    );
  }
}