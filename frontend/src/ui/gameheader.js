import React from 'react';
import '../App.css';

function determineRemaining(layout, revealed) {
  // figure out the number of words that remain per team
  var red = 0, blue = 0;

  for (var i = 0; i < layout.length; ++i) {
    if (!revealed[i]) {
      if (layout[i] === "red") ++red 
      else if (layout[i] === "blue") ++blue
    }
  }

  return {blue, red};
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function RegularGameHeader(props) {
  const remain = determineRemaining(props.layout, props.revealed);

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
  const remain = determineRemaining(props.startingTeam, props.layout, props.revealed);

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
export { RegularGameHeader, DuetGameHeader };