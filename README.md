# Liar's Dice

A websocket-based game of probabilities and bluffing

## Installation and local dev

### Prerequisites
You need NodeJS: https://nodejs.org/

You need yarn: https://classic.yarnpkg.com/en/

### Installation
```
$ git clone <this-repo>
$ cd liars-dice
$ yarn install
```

### Local Dev (Development Mode)
#### Run the server
From liars-dice: `$ yarn start-server`.

Runs on localhost:8080. Does have hot reloading. Should update automatically with any code changes.

#### Run the client
From liars-dice: `$ yarn start-client`.

Runs on localhost:3000. Does have hot reloading. Should update automatically with any code changes.

### Local Dev (Production Mode)
```
$ cd liars-dice
$ yarn build
$ yarn serve
```

From your browser, open http://localhost:8080

You can run multiple instances.

Does not have hot reloading. You will need to stop (Ctrl-C) and start again to run any changes. Since this runs the built versions of the server and client, any changes need to be rebuilt before the server is reloaded.

## Deployment

### Prerequisites
You need Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
```
$ cd liars-dice
$ heroku login (not required once you are logged in)
$ heroku git:remote -a lit-wildwood-82400
$ git commit -m "<commit message>"
$ git push heroku <ettenger/liars-dice branchname>:master
```
Regarding the "git push" command:
Since Heroku only deploys from the master branch of the Heroku Git repository, all changes must be pushed to Heroku master.

If pushing from the master branch of ettenger/lairs-dice, use `$ git push heroku master`

If pushing from another branch, use `$ git push heroku <ettenger/liars-dice branchname>:master`

For example, if pushing from the deployment branch, use `$ git push heroku deployment:master`

Once deployed, you can run the app using: `$ heroku open`.

Alternatively, you can browse to https://lit-wildwood-82400.herokuapp.com