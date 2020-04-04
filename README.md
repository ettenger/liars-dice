# Liar's Dice

A websocket-based game of probabilities and bluffing

## Installation and local dev

### Prerequisites
You need NodeJS: https://nodejs.org/

### Installation
```
$ git clone <this-repo>
$ cd liars-dice/server
$ npm install
$ npm install tslint typescript
$ cd ../client
$ npm install
```

### Local Dev
#### Run the server
From liars-dice/server: `$ npm start`.

Runs on localhost:8080. Does not have hot reloading. You will need to stop (Ctrl-C) and start again to run any changes.

#### Run the client
From liars-dice/client: `$ npm start`.

Runs on localhost:3000. Does have hot reloading. Should update automatically with any code changes.
