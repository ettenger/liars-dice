import React from 'react'; 
import './App.css';
import NameInput from './components/NameInput';
import GameLog from './components/GameLog';
import Message from './interfaces/message';
import ActionPanel from './components/ActionPanel';

type AppState = {
  ws?: WebSocket,
  name: string,
  messages: Message[]
}

export default class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);
    this.state = { name: '', messages: []};
    this.connect = this.connect.bind(this);
    this.addMessage = this.addMessage.bind(this);
  }

  private connect = (name: string) => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
        this.setState({ ws: ws, name:name })
        ws.send(JSON.stringify({ type: 'data', name: 'name', payload: name}));
    };

    ws.onmessage = (event: MessageEvent) => {
      let message: Message;
      try {
        message = JSON.parse(event.data) as Message;
        console.log(message);
      } catch (e) {
        console.log('Unable to parse incoming message!');
        console.log(event.data);
        return;
      }

      if (message.type === 'action') {
        this.addMessage(message);
      }
    }
  }

  private addMessage = (message: Message) => {
    this.setState({ messages: [...this.state.messages, message] });
  }

  private sendMessage = (message: Message) => {
    if (this.state.ws) {
      this.state.ws.send(JSON.stringify(message));
    } else {
      console.log('Unable to send message - no WebSocket in App.state');
    }
  }

  render() {
    if (!this.state.ws) {
      return (
        <div className="App">
          <header className="App-header">
            <NameInput onNameSubmit = { this.connect } />
          </header>
        </div>
      );
    } else {
      return (
        <div className="App">
          <header className="App-header">
            <div className="OpponentStatus"></div>
            <div className="MyDice"></div>
            <GameLog messages = { this.state.messages } />
            <ActionPanel messagesSender = { this.sendMessage } />
          </header>
        </div>
      );
    }
  }
}