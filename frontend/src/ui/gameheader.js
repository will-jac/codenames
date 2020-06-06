import React from 'react';
import '../App.css';

function determineRemaining(layout, revealed, teamIndex) {
  // figure out the number of words that remain per team
  var red = 0, blue = 0;
  
  if (layout == null) return {"blue":10, "red":10};

  for (var i = 0; i < layout.length; ++i) {
    if (!revealed[i][teamIndex]) {
      if (layout[i][teamIndex] === "red") ++red 
      else if (layout[i][teamIndex] === "blue") ++blue
    }
  }

  return {blue, red};
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function RegularGameHeader(props) {
  const remain = determineRemaining(props.layout, props.revealed, props.teamIndex);

  return (
    <div className="game-header">
      <div>
        Remaining: <span className="blue">{remain.blue}</span>
          -
          <span className="red">{remain.red}</span>
      </div>
      <div className={props.turn}>{capitalizeFirstLetter(props.turn)} Team's Turn!</div>
      <div className={props.turn}>
        {props.turn === props.team
          ?
            <button className={"end-turn"} 
              onClick={props.endTurn}
            >
              End Turn
            </button>
          : null
        }
      </div>
    </div>
  )
}

function DuetGameHeader(props) {
  const keyButton = (props.role === "player") ?  
    <button className={"end-turn"}
      onClick={() => {props.setRole("codemaster"); console.log("codemaster")}}
    >
      Show Key
    </button>
  : 
    <button className={"end-turn"}
      onClick={() => {props.setRole("player"); console.log("player")}}
    >
      Show Key
    </button>

  return (
    <div className="game-header">
      <div className={props.turn}>
        {keyButton}
      </div>
      <div className={props.turn}>{capitalizeFirstLetter(props.turn)} Team's Turn!</div>
      <div className={props.turn}>
        {props.turn === props.team
          ?
            <button className={"end-turn"} 
              onClick={props.endTurn}
            >
              End Turn
            </button>
          : null
        }
      </div>
    </div>
  )
}
export { RegularGameHeader, DuetGameHeader };