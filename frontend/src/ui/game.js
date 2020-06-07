import React, {useState } from 'react';
import '../App.css';
import Board from './board';
import {DuetGameHeader, RegularGameHeader} from './gameheader.js'
import { useHistory } from 'react-router-dom';

const socket = new WebSocket("ws://localhost:9090/game")

function newGame(gameID, mode, wordSet, callback) {
  console.log("Creating game:", gameID);
  socket.send(JSON.stringify({"type":"new", gameID, mode, wordSet}))
  socket.onmessage = (message) => { 
    // expect a string: success or error message
    callback(message.data);
  };
}

function findGame(gameID, callback) {
  console.log("Finding game:", gameID);
  var json = JSON.stringify({"type":"find", gameID})
  console.log(json)
  socket.send(json)
  socket.onmessage = (message) => { 
    // expect a string: mode or error message
    callback(message.data);
  };
}

function startGame(gameID, callback) {
  console.log("Subscribing to game:", gameID);
  socket.send(JSON.stringify({"type":"start", gameID}));
  socket.onmessage = (message) => { 
    // console.log("Recieved Message")
    // console.log(message.data); 
    // console.log(typeof message.data);
    try {
      var game = JSON.parse(message.data);
      callback(game);
    } catch (e) {
      callback(game);
      console.log(e);
    }
  };
}


function guess(gameID, index, team) {
  console.log('Guessing:', index);
  socket.send(JSON.stringify({"type":"guess", gameID, index, team}));
}

function endTurn(gameID, round, team) {
  console.log('Ending Turn');
  socket.send(JSON.stringify({"type":"turn", gameID, round, team}));
}

function nextGame(gameID, callback) {
  socket.send(JSON.stringify({"type":"next", gameID}));
  socket.onmessage = (message) => {
    // expect a string: mode or error message
    callback(message.data);
  }
}

function Game(props) {

  const GameHeader = (props.mode === "regular") ? RegularGameHeader : DuetGameHeader;  
  const [errorMessage, setErrorMessage] = useState(null);
  const history = useHistory();

  console.log("game", props.words, props.layout)
  
  if (props.words === null) {
    history.push("/")
  }

  const winners = (props.winningTeam) 
    ? <div className="game-message">
        <p>The <span className={props.winningTeam}>{props.winningTeam}</span> team won!</p> 
        <button className="green cell" 
          onClick={() => {
            nextGame(props.gameID, (msg) => {
              if (msg === "regular" || msg === "duet")
                props.history.push("/lobby"); // mode shouldn't change mid-game (TODO: fix)
              else
                setErrorMessage(msg);
            })  
          }}
        >Play Again</button>
      </div>
    : null

  return (
    <div className="game-view">
      {errorMessage}
      {winners}
      <p>You are on the <span className={props.team}>{props.team}</span> team</p>
      <GameHeader      
        round={props.round}
        team={props.team}
        turn={props.turn}
        revealed={props.revealed}
        layout={props.layout}
        endTurn={() => endTurn(props.gameID, props.round, props.team)}
        role={props.role}
        setRole={props.setRole}
      />
      <p/>
      <Board 
        mode={props.mode}
        team={props.team}
        enabled={winners === null && props.turn === props.team}
        words={props.words}
        layout={props.layout}
        revealed={props.revealed}
        role={props.role}
        guess={(index) => guess(props.gameID, index, props.team)}
      />
      <p>Join this game: {props.gameID}</p>
    </div>
  );
}

export default Game;
export { newGame, findGame, startGame }