import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';

import './App.css';
import Title, {Create, Join} from './ui/title';
import Lobby from './ui/lobby';
import Game from './ui/game';

import * as word_data from './words.json';
const wordData = word_data.default;

const wordsPerGame = 25;

function App() {
  const [wordSetName] = useState("English (Original)");

  // these represent the game and it's current state
  // they're sent to the server
  const [mode, setMode] = useState("regular");
  // GameState
  // const [permIndex, setPermIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const [wordSet] = useState(wordData[wordSetName]);
  // gameID initially two random words from the dataset
  const [gameID, setGameID] = useState(
    wordSet[Math.floor(Math.random() * wordSet.length)] +
    wordSet[Math.floor(Math.random() * wordSet.length)]
  );
  // Words used in game
  const [words, setWords] = useState(null);
  const [layout, setLayout] = useState([]); // Layout of the words
  // const [startingTeam, setStartingTeam] = useState(""); // Which team is starting?

  // who's turn is it?
  const [turn, setTurn] = useState("")

  // player-specific -- currently not sent to server
  const [team, setTeam] = useState("blue");
  const [role, setRole] = useState("player"); // used for regular, not for duet

  function loadGame(game) {
    console.log("loading game...")
    // setPermIndex(game["permIndex"]); // needed?
    setRound(game["round"]);
    setRevealed(game["revealed"]);
    // setWordSet(game["wordSet"]); // needed?
    setGameID(game["gameID"]);
    setWords(game["words"]);
    setLayout(game["layout"]);
    setMode(game["mode"]);
    // setStartingTeam(game["startingTeam"]);
    setTurn(game["turn"]);
  }

  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Link to="/">
              <button className="app-title">CODENAMES</button>
          </Link>
          <Switch>
            <Route path="/play">
              <Game
                mode={mode}
                words={words}
                layout={layout}
                revealed={revealed}
                round={round}
                gameID={gameID}
                team={team}
                role={role}
                setRole={setRole}
                turn={turn}
                loadGame={loadGame}
              />
            </Route>
            <Route path="/lobby">
              <Lobby
                gameMode={mode}
                gameID={gameID}
                team={team}
                setTeam={setTeam}
                role={role}
                setRole={setRole}
                loadGame={loadGame}
              />
            </Route>
            <Route path="/join">
              <Join
                setGameMode={setMode}
                gameID={gameID}
                setGameID={setGameID}
              />
            </Route>
            <Route path="/create">
              <Create
                wordSet={wordSet}
                gameMode={mode}
                setGameMode={setMode}
                gameID={gameID}
                setGameID={setGameID}
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