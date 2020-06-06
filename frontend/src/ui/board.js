import React, {useState, useEffect} from 'react';
import '../App.css';

function Cell(props) {
  // const color = props.revealed ? props.role : "hidden";
  return (
    <button className={"cell " + props.revealed }
      onClick={() => props.enabled ? props.guess(props.index) : props.setErrorMessage("It's not your turn!")}
    >
      {props.word}
    </button>
  );
}

function CodemasterCell(props) {
  const color = props.revealed === "hidden" ? props.role : "hidden";
  return (
    <button className={"cell " + color}>
      {props.word}
    </button>
  );
}

function DuetCell(props) {
  const color = props.duetNeutral ? props.revealed + " neutral-linear-gradient"  : props.revealed;
  return (
    <button className={"cell " + color}
      onClick={() => props.enabled ? props.guess(props.index) : props.setErrorMessage("It's not your turn!")}
    >
      {props.word}
    </button>
  );
}

function Board(props) {
  const CellType = (props.role === "codemaster") ? CodemasterCell : (props.mode === "duet") ? DuetCell : Cell;
  const [errorMessage, setErrorMessage] = useState("");
  const otherTeam = props.team === "blue" ? "red" : "blue"

  useEffect(() => {
    // when enabled changes, reset the error message
    setErrorMessage("");
  }, [props.enabled])

  if (props.words === null) {
    return (<p>Error: Game not Found</p>)
  }

  return (
    <div>
      <div className="board">
        {props.words.map((word, index) => {
          const duetNeutral = props.revealed[index] === "red" || props.revealed[index] === "blue"
          //     && (props.layout[team][index] == "neutral" 
          //       || props.layout[index][props.guessIndex] == "neutral");
          return (
            <CellType
              key={word}
              word={word}
              index={index}
              role={props.layout[otherTeam][index]}
              revealed={props.revealed[index]}
              duetNeutral={duetNeutral}
              guess={props.guess}
              enabled={props.enabled}
              setErrorMessage={setErrorMessage}
            />);
        })}
        </div>
      {errorMessage}
    </div>
  );
}

export default Board;
