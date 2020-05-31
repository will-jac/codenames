import React, { useState, useEffect } from 'react';
import '../App.css';

function Cell(props) {
  const [color, setColor] = useState(props.role==="spymaster" ? props.color : 'lightgray');

  return (
    <button className="cell" style={{background:color}} 
      onClick={(e)=>{
          if (props.role === "player") {
            setColor(props.color)
            props.guess(props.word)
          }
        }
      }
    >
      {props.word}
    </button>
  );
}

function Board(props) {
  const boardSize = [5, 5];
  // slice the words array into rows
  let rows = [boardSize[1]];
  for (var i=0; i < boardSize[1]; ++i) {
    rows[i] = props.words.slice(i*boardSize[0], i*boardSize[0] + boardSize[1])
  }
  
  return (
    <div className="board">
      {rows.map((row, index) => {
        return (
            row.map((word, index) => {
              // TODO: fix once I add in the actual data / backend
              return (
              <Cell 
                key={word}
                word={word}
                role={props.role}
                guess={props.guess} 
                color={props.color ? props.color : 'lightblue'}
              />);
            })
        );
      })}   
    </div>
  );
}

export default Board;
