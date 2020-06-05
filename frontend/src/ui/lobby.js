import React from 'react';
import { useHistory } from 'react-router-dom';
import { startGame } from './game';
import '../App.css';

function Lobby(props) {
  const history = useHistory();

  var setSpyMaster = null;
  if (props.gameMode === "regular") {
    setSpyMaster =
      <tr>
        <td>Choose a Role:</td>
        <td>
          <button
            className={props.role === "player" ? "game-button " + props.team + " end-turn" : "game-button"}
            onClick={(e) => props.setRole("player")}
          >
            Guesser
                </button>
          <button
            className={props.role === "codemaster" ? "game-button " + props.team + " end-turn" : "game-button"}
            onClick={(e) => props.setRole("codemaster")}
          >
            Code Master
                </button>
        </td>
      </tr>
  }
  var err = null;
  if (props.callback !== true) {
    err = <p>Error loading game! Please wait. If the game does not load, please try again</p>
  }

  return (
    <div className="small-text lobby-view">
      {err}
      <span>
        Join Code: <span className="red">{props.joinCode}</span>
        {' '}(Not right? <a href="/" className={"blue"}>Create</a>
        {' '}or <a href="/join" className={"blue"}>Join</a>
        {' '}a New Game)
        </span>
      <table>
        <tbody>
          <tr>
            <td>Choose a Team:</td>
            <td>
              <button
                className={props.team === "blue" ? "game-button blue end-turn" : "game-button"}
                onClick={(e) => props.setTeam("blue")}
              >
                Blue Team
                </button>
              <button
                className={props.team === "red" ? "game-button red end-turn" : "game-button"}
                onClick={(e) => props.setTeam("red")}
              >
                Red Team
                </button>
            </td>
          </tr>
          {setSpyMaster}
        </tbody>
      </table>

      {/* <Link to="play"> */}
        <button className="game-button"
          style={{ background: "lightgreen" }}
          onClick={() => {
            startGame(props.gameID, (gameState) => {
              props.loadGame(gameState);
              history.push("/play");
            });
          }}
        >
          Start Game
            </button>
      {/* </Link> */}
        (This will lock in your team and role)
    </div>
  );
}

export default Lobby;
