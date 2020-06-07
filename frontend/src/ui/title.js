import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import '../App.css';
import {findGame, newGame} from './game';

function Title(props) {

  return (
    <div className="small-text lobby-view">
      <p>
        Play Codenames online! Simply select a style and a game code,
        then send the code to your friends. In Codenames, each team
        tries to guess all their words before the other team. Read the
        full rules here. (TODO: link to rules)
        </p>
      <Link to="create">
        <button className="blue game-button" 
          // style={{ background: "lightblue" }}
        >
          Create a New Game
        </button>
      </Link>
      <Link to="join">
        <button className="green game-button" 
          // style={{ background: "lightgreen" }}
        >
          Join an Existing Game
        </button>
      </Link>
    </div>
  );
}

function Join(props) {
  const history = useHistory();
  const [errorMessage, setErrorMessage] = useState(null)

  return (
    <div className="small-text lobby-view">
      <table>
        <tbody>
          <tr>
            <td>Find a game by code: </td>
            <td>
              <input className="join-code" type="text" name="gameID"
                value={props.gameID} onChange={(e) => props.setGameID(e.target.value)}
              />
              {/* TODO: change to a succ / fail check with server */}
              <button className="green game-button"
                //TODO: set up some validation
                onClick={(e) => {
                  findGame(props.gameID,
                    (msg) => {
                      if (msg === "regular" || msg === "duet") {
                        props.setMode(msg);
                        history.push("/lobby");
                      } else
                        setErrorMessage(msg)
                    })
                }}
              >
                Join Game
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {errorMessage}
    </div>
  );
}

function Create(props) {
  const history = useHistory();
  const [errorMessage, setErrorMessage] = useState(null)

  return (
    <div className="small-text lobby-view">
      <table>
        <tbody>
          <tr>
            <td>
              What style of game do you want to play?
        </td>
            <td>
              <button className={props.gameMode === "regular" ? "red game-button" : "hidden game-button"}
                // style={props.gameMode === "regular" ? { background: "lightcoral" } : {}}
                onClick={(e) => props.setGameMode("regular")}
              >
                Regular
          </button>
              <button className={props.gameMode === "duet" ? "green game-button" : "hidden game-button"}
                // style={props.gameMode === "duet" ? { background: "lightgreen" } : {}}
                onClick={(e) => props.setGameMode("duet")}
              >
                Duet
          </button>
            </td>
          </tr>
          <tr>
            <td>Set a code to join your game: </td>
            <td>
              <input className="join-code" type="text" name="gameID"
                value={props.gameID} onChange={(e) => props.setGameID(e.target.value)}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <button className="game-button"
        style={{ background: "lightblue" }}
        // TODO: add error checking. What if game creation fails?
        onClick={(e) => {
          newGame(props.gameID, props.gameMode, props.wordSet,
            (message) => {
              if (message === "success") {
                history.push("/lobby");
              } else
                setErrorMessage(message);
            });
        }}
      >
        Create Game
      </button>
      {errorMessage}
    </div>
  );
}

export default Title;
export { Create, Join };
