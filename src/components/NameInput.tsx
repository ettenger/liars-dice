import React from 'react'; 

type myProps = {
  onNameSubmit: any
};

type myState = {
  value: string
}

export default class NameInput extends React.Component<myProps, myState> {
  constructor(props: myProps) {
    super(props);
    this.state = { value: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({value: e.target.value});
  }

  handleSubmit(e: React.FormEvent) {
    this.props.onNameSubmit(this.state.value.toString());
    e.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>What should we call you?</label><br/>
        <input type="text" value={this.state.value} onChange={this.handleChange} autoFocus/><br/>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}