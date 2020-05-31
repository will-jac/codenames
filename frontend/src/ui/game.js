import React, { useState } from 'react';
import '../App.css';
import Board from './board';
import {GameHeader as RegHeader} from './regular';
import {GameHeader as DuetHeader} from './duet';
import {server} from '../App';

function createGuesser(team_name, updateFunction) {
  const team = team_name;

  return function(word) {
    // send api call to tell everyone we guessed
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      updateFunction(this.responseText);
    }
    req.open("PUT", server, true);
    req.send({word, team});
  };
}

function createTurnHandler(team_name, updateFunction) {
  const team = team_name;
  return function(team_name) {
    if (team !== team_name) return;
    // send api call to tell everyone we guessed
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      updateFunction(this.responseText);
    }
    req.open("PUT", server, true)
    req.send(team_name);
  }
}

function Game(props) {
  const [turn, setTurn] = useState("blue");
  const [redRemain, setRedRemain] = useState(9); // TODO: change to props.redRemain
  const [blueRemain, setBlueRemain] = useState(8); // TODO: change to props.blueRemain
  const turn_handler = createTurnHandler(turn, setTurn); // TODO: change to props.team
  const guess = createGuesser(turn); // TODO: change to props.team

  var gameHeader;
  if (props.gameMode === "regular") {
    gameHeader = 
      <RegHeader
        turn={turn} 
        team={props.team}
        teams={["blue", "red"]}
        teamRemain={[redRemain, blueRemain]}
        endTurn={turn_handler}
      />
  }
  else {
    gameHeader = 
      <DuetHeader
        team={turn} 
        teams={["blue", "red"]}
        endTurn={turn_handler}
      />
  }
  return (
    <div className="game-view">
      {gameHeader}
      <p/>
      <Board 
        words={props.words}
        role={props.role}
      />
    </div>
  );
}

export default Game;
