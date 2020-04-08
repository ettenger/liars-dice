import React from 'react'; 
import './App.css';
import NameInput from './components/NameInput';
import GameLog from './components/GameLog';
import Message from './interfaces/Message';
import ActionPanel from './components/ActionPanel';

type AppState = {
  ws?: WebSocket,
  name: string,
  messages: Message[],
  gameData: any[],
  playerData: any[]
}

export default class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);
    this.state = { name: '', messages: [], gameData: [], playerData: [] };
    this.connect = this.connect.bind(this);
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
        console.log('Received message object:');
        console.log(message);
      } catch (e) {
        console.log('Unable to parse incoming message!');
        console.log(event.data);
        return;
      }

      if (message.type === 'action') {
        // Save action messages to state for the Game Log
        this.setState({ messages: [...this.state.messages, message] });
      } else if (message.type === 'data') {
        switch (message.name) {
          // Save server data to state
          case 'game':
            this.setState({ gameData: message.payload });
            console.log('App.state.gameData');
            console.log(this.state.gameData);
            break;
          case 'player':
            this.setState({ playerData: message.payload });
            console.log('App.state.playerData');
            console.log(this.state.playerData);
            break;
        }
      }
    }
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