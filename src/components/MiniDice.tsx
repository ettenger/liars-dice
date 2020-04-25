import React from 'react'; 

type myProps = {
  key: any, 
  num: Number
};

export default class MiniDice extends React.Component<myProps> {

  render() {
      if (this.props.num===0) { return(<span></span>); }
      return (
        <img 
          src={"../images/dice"+ this.props.num.toString() + ".svg"} 
          alt={this.props.num.toString()} 
          height="20px" 
          className="img-dice">
        </img>
      );
  }
}