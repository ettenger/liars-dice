import React from 'react'; 
import './App.css';
import NameInput from './components/NameInput';
import GameLog from './components/GameLog';
import Message from './interfaces/Message';
import ActionPanel from './components/ActionPanel';
import GameData from './interfaces/GameData';
import PlayerData from './interfaces/PlayerData';
import DicePanel from './components/DicePanel';
import StatusTable from './components/StatusTable';

type AppState = {
  ws?: WebSocket,
  name: string,
  messages: Message[],
  gameData: GameData,
  playerData: PlayerData
}

export default class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);
    this.state = { name: '', messages: [], gameData: new GameData(), playerData: new PlayerData() };
    this.connect = this.connect.bind(this);
  }

  private connect = (name: string) => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
        this.setState({ ws: ws, name: name })
        ws.send(JSON.stringify({ type: 'data', name: 'name', payload: name}));
    };

    ws.onmessage = (event: MessageEvent) => {
      let message: any = this.parseData(event.data,'Message');
      if (!message) { return; }

      let data: any;

      if (message.type === 'action') {
        // Save action messages to state for the Game Log
        this.setState({ messages: [...this.state.messages, message] });
      } else if (message.type === 'data') {
        switch (message.name) {
          // Save server data to state
          case 'game':
            data = this.parseData(event.data,'GameData');
            if (data) {
              this.setState({ gameData: message.payload });
            }
            break;
          case 'player':
            data = this.parseData(event.data,'PlayerData');
            if (data) {
              this.setState({ playerData: message.payload });
            }
            break;
        }
      }
    }
  }

  private parseData(inputString: string, outputType: 'Message' | 'GameData' | 'PlayerData' | 'Other') {
    let output: any;

    try {
      switch (outputType) {
        case 'Message':
          output = JSON.parse(inputString) as Message;
          break;
        case 'GameData':
          output = JSON.parse(inputString) as GameData;
          break;
        case 'PlayerData':
          output = JSON.parse(inputString) as PlayerData;
          break;
        default:
          output = JSON.parse(inputString);
          break;
      }
      console.log('Successfully parsed ' + outputType.toString() + ' object:');
      console.log(output);
      return output;
    } catch (e) {
      console.log('Unable to parse object! Attempted type: ' + outputType.toString());
      console.log('inputString:')
      console.log(inputString);
      console.log('Error: ' + e.message)
      return false;
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
            <div className="Content-left">
              { this.state.gameData.hasGameStarted ? 
                <DicePanel playerData = { this.state.playerData } /> : 
                <div className="DicePanel"></div> 
              }
              <GameLog messages = { this.state.messages } />
              <ActionPanel 
                messagesSender = { this.sendMessage } 
                gameData = { this.state.gameData } 
                playerData = { this.state.playerData } 
              />
            </div>
            <div className="Content-right">
              <StatusTable gameData = { this.state.gameData } />
            </div>
          </header>
        </div>
      );
    }
  }
}