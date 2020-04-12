import React from 'react'; 
import Message from '../interfaces/Message';
import GameData from '../interfaces/GameData';

type myProps = {
  messagesSender: any,
  gameData: GameData
};

type myState = {
  minDiceNum: number,
  minDiceQty: number,
  currentNum: number,
  currentQty: number,
};

export default class WagerInput extends React.Component<myProps, myState> {
  constructor(props: myProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.changeWagerNum = this.changeWagerNum.bind(this);
    this.state = { minDiceNum: 0, minDiceQty: 0, currentNum: 0, currentQty: 0 }
  }

  componentDidMount() {
    if (this.props.gameData.lastWager.num && this.props.gameData.lastWager.qty) {
      let minNum = this.props.gameData.lastWager.num !== 6 ? this.props.gameData.lastWager.num + 1 : 1;
      let minQty = this.props.gameData.lastWager.num !== 6 ? this.props.gameData.lastWager.qty : this.props.gameData.lastWager.qty + 1;
      
      this.setState({ 
        minDiceNum: minNum,
        minDiceQty: minQty,
        currentNum: minNum, 
        currentQty: minQty
      });
    } else {
      this.setState({ 
        minDiceNum: 1, 
        minDiceQty: 1,
        currentNum: 1,
        currentQty: 1
      });
    }
  }

  private handleSubmit() {
    const message : Message = { type: 'action', name: 'start game', payload: {} };
    this.props.messagesSender(message);
  }

  private changeWagerQty(direction: 'increase' | 'decrease') {
    let currentQty = this.state.currentQty;
    let minQty = this.state.minDiceQty;
    let diceRemaining = this.props.gameData.numDiceRemaining;

    if ((direction==='increase') && (currentQty < diceRemaining)) {
      this.setState({ currentQty: currentQty + 1 });  
    } else if ((direction==='decrease') && (currentQty > minQty)) {
      this.setState({ currentQty: currentQty - 1 });  
    }
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
          if (currentNum > minNum && currentQty >= minQty) {
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

  private GameDice = (props: { num: Number }) => {
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

  render() {
    return (
      <div className="Wager-input">
        <div className="div-vertical-btns">
          <button type="submit" onClick={() => this.changeWagerQty('increase')}>+</button>
          <button type="submit" onClick={() => this.changeWagerQty('decrease')}>-</button>
        </div>
        <div>
          { this.state.currentQty }
        </div>
        <div style={{margin: "0 5px"}}>x</div>
        <this.GameDice num = { this.state.currentNum ? this.state.currentNum : 1 } />
        <div className="div-vertical-btns">
          <button type="submit" onClick={() => this.changeWagerNum('increase')}>+</button>
          <button type="submit" onClick={() => this.changeWagerNum('decrease')}>-</button>
        </div>
      </div>
    );
  }
}