import React from 'react';
import '../App.css';
import Board from './board';
import {DuetGameHeader, RegularGameHeader} from './gameheader.js'

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
    // expect a string: success or error message
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
  socket.send(JSON.stringify({"type":"end turn", gameID, round, team}));
}

function Game(props) {

  // in theory, this component shouldn't reload, so this should only happen once
  // subscribeToGame(props.gameID, props.loadGame);

  const GameHeader = (props.mode === "regular") ? RegularGameHeader : DuetGameHeader;  

  return (
    <div className="game-view">
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
        enabled={props.turn === props.team}
        words={props.words}
        layout={props.layout}
        revealed={props.revealed}
        role={props.role}
        guess={(index) => guess(props.gameID, index, props.team)}
      />
    </div>
  );
}

export default Game;
export { newGame, findGame, startGame }