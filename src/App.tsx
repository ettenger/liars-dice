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

type AppState = {
  uuid?: string,
  messages: Message[],
  gameData: GameData,
  playerData: PlayerData
}

export default class App extends React.Component<{}, AppState> {
  private ws?: WebSocket;
  private name: string = '';
  private kickTimerMessageIndex: number = -1;

  constructor(props: any) {
    super(props);
    let uuid = window.sessionStorage.getItem("liars-dice-uuid")
    if (uuid) {
      this.state = { uuid: uuid, messages: [], gameData: new GameData(), playerData: new PlayerData() };
    } else {
      this.state = { messages: [], gameData: new GameData(), playerData: new PlayerData() };
    }
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
    let HOST = (window.location.hostname === 'localhost') ? 
      'ws://localhost:8080' : window.location.origin.replace(/^http/, 'ws');
    HOST += '/?uuid=' + id;
    if (name) { 
      HOST += '&name=' + name; 
      this.name = name;
    }
    this.ws = new WebSocket(HOST);
    
    this.ws.onmessage = (event: MessageEvent) => {
      let message: any = this.parseData(event.data,'Message');
      if (!message) { return; }

      let data: any;

      if (message.type === 'action') {
        // Save action messages to state for the Game Log
        if (message.name==='retry join') {
          window.sessionStorage.removeItem("liars-dice-uuid");
          this.setState({ uuid: undefined });
          // this.render();
          // this.connect();
        }
        else if (message.name==='start timer') {
          this.kickTimerMessageIndex = this.state.messages.length;
          this.setState({ messages: [...this.state.messages, message] });
        } 
        else if (message.name==='stop timer') {
          // Remove the timer from the message log so we stop displaying it
          let msgs = this.state.messages;
          
          if (this.kickTimerMessageIndex !== -1) {
            msgs.splice(this.kickTimerMessageIndex,1);
          }
          this.kickTimerMessageIndex = -1;
          this.setState({ messages: msgs });
        } 
        else {
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

    this.setState({ uuid: id });
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
    if (this.ws) {
      this.ws.send(JSON.stringify(message));
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