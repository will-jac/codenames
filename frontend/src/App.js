import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory,
} from 'react-router-dom';

import './App.css';
import Title, {Create, Join} from './ui/title';
import Lobby from './ui/lobby';
import Game from './ui/game';

import * as word_data from './words.json';
const wordData = word_data.default;

function App() {

  const [wordSetName] = useState("English (Original)");

  const [mode, setMode] = useState("regular");
  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const [wordSet] = useState(wordData[wordSetName]);
  const [winningTeam, setWinningTeam] = useState(null);
  // gameID initially two random words from the dataset
  const [gameID, setGameID] = useState(
    wordSet[Math.floor(Math.random() * wordSet.length)] +
    wordSet[Math.floor(Math.random() * wordSet.length)]
  );
  // Words used in game
  const [words, setWords] = useState(null);
  const [layout, setLayout] = useState([]); // Layout of the words
  // who's turn is it?
  const [turn, setTurn] = useState("")
  // player-specific -- currently not sent to server
  const [team, setTeam] = useState("blue");
  const [role, setRole] = useState("player"); // used for regular, not for duet

  // used to check if we need to reload
  const [loaded, setLoaded] = useState(false)

  function loadGame(game, callback) {
    // console.log("loading game...", game)
    setGameID(game.gameID);
    setMode(game.mode);

    setWords(game.words);
    setLayout(game.layout);
    setRevealed(game.revealed);
    setTurn(game.turn);
    setRound(game.round);
    setWinningTeam(game.winningTeam);
    
    setLoaded(true)

    if (callback !== undefined) {
      game.team = team;
      game.role = role;
      callback(game);
    }
  }

  if (!loaded && sessionStorage.getItem('game') != null) {
    console.log("loading game from sessionStorage")
    loadGame(JSON.parse(sessionStorage.getItem('game')));
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
                winningTeam={winningTeam}
              />
            </Route>
            <Route path="/lobby">
              <Lobby
                mode={mode}
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
                setMode={setMode}
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