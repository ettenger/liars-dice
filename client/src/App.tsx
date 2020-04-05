import React from 'react'; 
import './App.css';
import NameInput from './components/NameInput'

type AppState = {
  ws?: WebSocket,
  name: string
}

export class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);
    this.state = { name: ''};
  }

  connect = (name: string) => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
        this.setState({ ws: ws, name:name })
        ws.send(JSON.stringify({ type: 'data', name: 'name', payload: name}));
    };

    ws.onmessage = function (event) {
      console.log(event.data);
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          { this.state.ws ? 
            <h2>Liar's Dice - Connected as { this.state.name }</h2> : 
            <NameInput onNameSubmit = { this.connect } />
          }
        </header>
      </div>
    );
  }
}

export default App;