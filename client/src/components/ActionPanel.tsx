import React from 'react'; 
import Message from '../interfaces/message';

type myProps = {
  messagesSender: any
};

export default class ActionPanel extends React.Component<myProps> {
  constructor(props: myProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({value: e.target.value});
  }

  handleSubmit(e: React.FormEvent) {
    const message : Message = { type: 'action', name: 'start game', payload: {} };
    this.props.messagesSender(message);
    e.preventDefault();
  }

  render() {
    return (
      <div className="ActionPanel">
        <form onSubmit={this.handleSubmit}>
          <input type="submit" value="Start Game" />
        </form>
      </div>
    );
  }
}