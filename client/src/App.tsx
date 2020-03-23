import React from 'react';
import './App.css';

function App() {
  const ws = new WebSocket('ws://localhost:8080');
  ws.onopen = function () {
    ws.send(JSON.stringify({ type: 'data', name: 'name', payload: 'ett'}));
  };
  ws.onmessage = function (event) {
    console.log(event.data);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>Liar's Dice</h2>
      </header>
    </div>
  );
}

export default App;
