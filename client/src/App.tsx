import React from 'react'; 
import './App.css';
import NameInput from './components/NameInput';
import GameLog from './components/GameLog';
import Message from './interfaces/message';

type AppState = {
  ws?: WebSocket,
  name: string,
  messages: Message[]
}

export class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);
    this.state = { name: '', messages: []};
  }

  private connect = (name: string) => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
        this.setState({ ws: ws, name:name })
        ws.send(JSON.stringify({ type: 'data', name: 'name', payload: name}));
    };

    ws.onmessage = (event: MessageEvent) => {
      console.log(event.data);
      this.addMessage(JSON.parse(event.data));
    }
  }

  private addMessage = (message: Message) => {
    this.setState({ messages: [...this.state.messages, message]  });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          { this.state.ws ? 
            <GameLog messages = { this.state.messages } /> :
            <NameInput onNameSubmit = { this.connect } />
          }
        </header>
      </div>
    );
  }
}

export default App;