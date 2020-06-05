import React, {useState, useEffect} from 'react';
import '../App.css';

function Cell(props) {
  const color = props.revealed ? props.role : "hidden";
  return (
    <button className={"cell " + color}
      onClick={() => props.enabled ? props.guess(props.index) : props.setErrorMessage("It's not your turn!")}
    >
      {props.word}
    </button>
  );
}

function CodemasterCell(props) {
  const color = props.revealed ? "hidden" : props.role;
  return (
    <button className={"cell " + color}>
      {props.word}
    </button>
  );
}

function Board(props) {
  const CellType = (props.role === "codemaster") ? CodemasterCell : Cell;
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // when enabled changes, reset the error message
    setErrorMessage("");
  }, [props.enabled])
  return (
    <div>
      <div className="board">
        {props.words.map((word, index) => {
          // TODO: fix once I add in the actual data / backend
          return (
            <CellType
              key={word}
              word={word}
              index={index}
              role={props.layout[index]}
              revealed={props.revealed[index]}
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
