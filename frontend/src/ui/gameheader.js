import React from 'react';
import '../App.css';

function determineRemaining(layout, revealed) {
  // figure out the number of words that remain per team
  var red = 0, blue = 0;
  
  if (layout == null) return {"blue":10, "red":10};

  for (var i = 0; i < layout.length; ++i) {
    if (revealed[i] === "hidden") {
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
  const remain = determineRemaining(props.layout["blue"], props.revealed); // red because they're identical

  return (
    <table className="game-header">
      <tbody>
        <tr>
          <th className="left-header">
            Remaining: <span className="blue">{remain.blue}</span>
              -
              <span className="red">{remain.red}</span>
          </th>
          <th className={"center-header " + props.turn}>{capitalizeFirstLetter(props.turn)} Team's Turn!</th>
          <th className={"right-header " + props.turn}>
            {props.turn === props.team
              ?
                <button className={"end-turn"} 
                  onClick={props.endTurn}
                >
                  End Turn
                </button>
              : null
            }
          </th>
        </tr>
      </tbody>
    </table>
  )
}

function DuetGameHeader(props) {
  return (
    <table className="game-header">
      <tbody>
        <tr>
          <th className="left-header">
            <button className={((props.role === "player") ? "green" : "hidden") + " end-turn"}
              onClick={() => {
                props.setRole(props.role === "player" ? "codemaster" : "player")
              }}
            >
            {(props.role === "player") ? "Show Key" : "Show Board"}
            </button>
          </th>
          <th className={"center-header " + props.turn}>{capitalizeFirstLetter(props.turn)} Team's Turn!</th>
          <th className={"right-header " + props.turn}>
            {props.turn === props.team
              ?
                <button className={"end-turn"} 
                  onClick={props.endTurn}
                >
                  End Turn
                </button>
              : " "
            }
          </th>
        </tr>
      </tbody>
    </table>
  )
}
export { RegularGameHeader, DuetGameHeader };