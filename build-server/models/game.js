"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.Game=void 0;function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function _defineProperties(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}function _createClass(a,b,c){return b&&_defineProperties(a.prototype,b),c&&_defineProperties(a,c),a}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}var Game=/*#__PURE__*/function(){function a(){var b=this;_classCallCheck(this,a),_defineProperty(this,"players",[]),_defineProperty(this,"activePlayers",[]),_defineProperty(this,"startingNumberOfDice",6),_defineProperty(this,"hasOnesBeenWagered",!1),_defineProperty(this,"hasGameStarted",!1),_defineProperty(this,"lastWager",{}),_defineProperty(this,"wasPlayerJustEliminated",!1),setInterval(function(){return b.sendHeartbeat()},3e4)}return _createClass(a,[{key:"addPlayer",value:function addPlayer(a){var b=this;this.players.push(a),a.actions.on("wager",function(c){return b.handleWager(a,c)}),a.actions.on("updated",function(a){return b.handleUpdate(a)}),a.actions.on("start game",function(){return b.handleGameStart()}),a.actions.on("player eliminated",function(a){return b.handleEliminatedPlayer(a)})}},{key:"handleEliminatedPlayer",value:function handleEliminatedPlayer(a){this.sendAction("player eliminated",a.name),this.activePlayers=this.players.filter(function(a){return a.isInGame}),this.wasPlayerJustEliminated=!0,1>=this.activePlayers.length&&(1===this.activePlayers.length?this.sendAction("game over",this.activePlayers[0].name):this.sendAction("game over","Nobody"),this.resetGame())}},{key:"beginNewRound",value:function beginNewRound(){this.sendAction("round start",""),this.hasOnesBeenWagered=!1,this.activePlayers.forEach(function(a){a.beginNewRound()}),this.updateClients()}},{key:"handleGameStart",value:function handleGameStart(){var a=this;this.hasGameStarted||(// Tell players the game is starting
// Start the game
// Send state data
this.sendAction("game start",""),this.hasGameStarted=!0,this.hasOnesBeenWagered=!1,this.lastWager={},this.shuffle(this.players),this.players[0].isTheirTurn=!0,this.activePlayers=this.players,this.players.forEach(function(b){b.beginGame(a.startingNumberOfDice)}),this.updateClients())}},{key:"resetGame",value:function resetGame(){this.hasOnesBeenWagered=!1,this.hasGameStarted=!1,this.lastWager={},this.activePlayers=[],this.players.forEach(function(a){a.isTheirTurn=!1}),this.updateClients()}},{key:"sendAction",value:function sendAction(a,b){// Send action message to clients for the game log
this.broadcastToClients({type:"action",name:a,payload:b})}},{key:"handleUpdate",value:function handleUpdate(a){this.sendAction("player join",a.name),this.updateClients(),a.updateClient()}},{key:"broadcastToClients",value:function broadcastToClients(a){console.log(JSON.stringify(a)),this.players.forEach(function(b){b.ws.send(JSON.stringify(a))})}},{key:"updateClients",value:function updateClients(){var a={type:"data",name:"game",payload:this.publicGameDetails};this.broadcastToClients(a)}},{key:"sendHeartbeat",value:function sendHeartbeat(){this.broadcastToClients({type:"heartbeat",name:"",payload:""})}// Returns true if wager was correct, false for bullshit
},{key:"testWager",value:function testWager(a){var b=this.hasOnesBeenWagered?function(b){return b===a.num}:function(b){return b===a.num||1===b};var c=this.activePlayers.map(function(a){return a.currentRoll}).reduce(function(c,a){return c.concat(a)},[]),d=c.filter(b).length,e=this.activePlayers.map(function(a){return{name:a.name,dice:a.currentRoll}});return this.sendAction("dice reveal",{count:d,num:a.num,dice:e}),d>=a.qty}},{key:"calledBullshit",value:function calledBullshit(a,b){var c=b.lastWager,d=this.testWager(c);d?(this.sendAction("lose die",a.name),a.loseOneDie()):(this.sendAction("lose die",b.name),b.loseOneDie()),this.lastWager={},this.hasGameStarted&&this.beginNewRound()}},{key:"handleWager",value:function handleWager(a,b){this.sendAction("wager",{player:a.name,wager:b});var c=this.getPlayerIndex(a);if(b.callBullshit){var d=this.getPreviousPlayer(c);this.calledBullshit(a,d)}else this.lastWager=b,1===b.num&&(this.hasOnesBeenWagered=!0);// Check that the game didn't end before we got here
if(this.hasGameStarted){var e=this.getNextPlayer(c);e.startTurn(),this.updateClients()}}},{key:"getPlayerIndex",value:function getPlayerIndex(a){return this.activePlayers.indexOf(a)}},{key:"getNextPlayer",value:function getNextPlayer(a){return this.wasPlayerJustEliminated&&(0<a?a--:a=this.activePlayers.length,this.wasPlayerJustEliminated=!1),a+1>=this.activePlayers.length?this.activePlayers[0]:this.activePlayers[a+1]}},{key:"getPreviousPlayer",value:function getPreviousPlayer(a){return 0>a-1?this.activePlayers[this.activePlayers.length-1]:this.activePlayers[a-1]}},{key:"shuffle",value:function shuffle(a){// While there remain elements to shuffle...
for(var b=Math.floor,c,d,e=a.length;0!==e;)// Pick a remaining element...
// And swap it with the current element.
d=b(Math.random()*e),e-=1,c=a[e],a[e]=a[d],a[d]=c;return a}},{key:"numDiceRemaining",get:function get(){return this.activePlayers.map(function(a){return a.numDice}).reduce(function(a,b){return a+b},0)}},{key:"publicGameDetails",get:function get(){return{players:this.players.map(function(a){return a.publicDetails}),numDiceRemaining:this.numDiceRemaining,hasOnesBeenWagered:this.hasOnesBeenWagered,hasGameStarted:this.hasGameStarted,lastWager:this.lastWager}}}]),a}();exports.Game=Game;