import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';

import './App.css';
import Title, {Create, Join} from './ui/title';
import Lobby from './ui/lobby';
import Game from './ui/game';

import * as word_data from './words.json';
const words = word_data.default;
const server = "localhost:9090";

const fetch = require("node-fetch");

function createGame(gameState, callback) {
  // send api call to the server to create the game
  console.log("calling server to create game");

  fetch(server + "/create-game", {
    method : "POST",
    body : JSON.stringify(gameState)
  })
  .then(response => callback(response.text()))
  .then(response => console.log(response.text()))
  .catch((error) => {
    console.error('Error:', error);
  });

}

function App() {
  const [wordList, setWordList] = useState("English (Original)");
  const [gameMode, setGameMode] = useState("regular");
  const [joinCode, setJoinCode] = useState(
    words[wordList][Math.floor(Math.random() * words[wordList].length)] +
    words[wordList][Math.floor(Math.random() * words[wordList].length)]
  );
  const [wordGrid, setWordGrid] = useState(words[wordList].slice(25, 50))
  
  const [team, setTeam] = useState("blue");
  const [role, setRole] = useState("player"); // used for regular, not for duet

  return (
    <div className="App">
      <header className="App-header">
        <h1>CODENAMES</h1>
        <button onClick={(e) => console.log(role)}>Log Role</button>
        <Router>
          <Switch>
            <Route path="/play">
              <Game
                words={wordGrid}
                gameMode={gameMode}
                joinCode={joinCode}
                team={team}
                role={role}
              />
            </Route>
            <Route path="/lobby">
              <Lobby
                words={wordGrid}
                gameMode={gameMode}
                joinCode={joinCode}
                team={team}
                setTeam={setTeam}
                role={role}
                setRole={setRole}
              />
            </Route>
            <Route path="/join">
              <Join
                setGameMode={setGameMode}
                joinCode={joinCode}
                setJoinCode={setJoinCode}
                callback={setWordGrid}
              />
            </Route>
            <Route path="/create">
              <Create
                words={words[wordList]}
                gameMode={gameMode}
                setGameMode={setGameMode}
                joinCode={joinCode}
                setJoinCode={setJoinCode}
                createGame={createGame}
                callback={setWordGrid}
              />
            </Route>
            <Route path="/">
              <Title/>
            </Route>
          </Switch>
        </Router>
        <p className="tiny-text">View the code on Github</p>
      </header>
    </div>
  );
}

export default App;
export { server };
