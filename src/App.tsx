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
import { v4 as uuidv4 } from 'uuid';

// TODO: Remove ws, uuid, name, kickTimerMessageIndex from state since they do not warrant rendering

type AppState = {
  ws?: WebSocket,
  uuid?: string,
  name: string,
  messages: Message[],
  gameData: GameData,
  playerData: PlayerData,
  kickTimerMessageIndex: number
}

export default class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);
    var initState: AppState = { name: '', messages: [], gameData: new GameData(), playerData: new PlayerData(), kickTimerMessageIndex: -1 };
    
    // If a UUID exists for this session, use it
    const id: string | null = window.sessionStorage.getItem("liars-dice-uuid")
    if (id) { initState.uuid = id; console.log('Found UUID'); }

    this.state = initState;
    this.connect = this.connect.bind(this);
  }

  componentDidMount() {
    if (this.state.uuid) { 
      this.connect(); 
    }
  }

  private connect = (name?: string) => {   
    // Retreive or create a UUID
    let id = this.state.uuid
    if (name) {
      id = uuidv4();
      window.sessionStorage.setItem("liars-dice-uuid", id);
    }

    // Connect to ws server and pass UUID and name (if provided)
    let HOST = (window.location.hostname === 'localhost') ? 'ws://localhost:8080' : window.location.origin.replace(/^http/, 'ws');
    HOST += '/?uuid=' + id;
    if (name) { HOST += '&name=' + name; }
    const ws = new WebSocket(HOST);

    // Save state data
    if (name) {
      this.setState({ ws: ws, uuid: id, name: name });
    } else {
      this.setState({ ws: ws, uuid: id });
    }

    ws.onmessage = (event: MessageEvent) => {
      let message: any = this.parseData(event.data,'Message');
      if (!message) { return; }

      let data: any;

      if (message.type === 'action') {
        // Save action messages to state for the Game Log
        if (message.name==='start timer') {
          this.setState({ 
            kickTimerMessageIndex: this.state.messages.length, 
            messages: [...this.state.messages, message] 
          });
        } else if (message.name==='stop timer') {
          // Remove the timer from the message log so we stop displaying it
          let msgs = this.state.messages;
          if (this.state.kickTimerMessageIndex !== -1) {
            msgs.splice(this.state.kickTimerMessageIndex,1);
          }
          this.setState({ 
            kickTimerMessageIndex: -1, 
            messages: msgs 
          });
        } else {
          this.setState({ messages: [...this.state.messages, message] });
        }
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
      } else if (message.type === 'heartbeat') {
          // console.log("Heartbeat received");
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
    if (!this.state.uuid) {
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