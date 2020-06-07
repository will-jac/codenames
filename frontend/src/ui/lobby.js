import React from 'react';
import { useHistory } from 'react-router-dom';
import { startGame } from './game';
import '../App.css';

function Lobby(props) {
  const history = useHistory();

  // console.log("lobby:", history.location.state)

  if (!props.loaded && props.history && props.history.location && props.history.location.state) {
    console.log("lobby load from state")
    props.loadFromState()
  }

  // var team = props.team

  var setSpyMaster = null;
  if (props.mode === "regular") {
    setSpyMaster =
      <tr>
        <td>Choose a Role:</td>
        <td>
          <button
            className={props.role === "player" ? props.team + " game-button end-turn" : "hidden game-button"}
            onClick={(e) => props.setRole("player")}
          >
            Guesser
                </button>
          <button
            className={props.role === "codemaster" ? props.team + " game-button end-turn" : "hidden game-button"}
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
                className={props.team === "blue" ? "blue game-button end-turn" : "hidden game-button"}
                onClick={(e) => props.setTeam("blue")}
              >
                Blue Team
                </button>
              <button
                className={props.team === "red" ? "red game-button end-turn" : "hidden game-button"}
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
              props.loadGame(gameState, (game) => {
                sessionStorage.setItem('game', JSON.stringify(game))
                history.push("/play");
              });
              
              // {
              //   "gameID" : props.gameID,
              //   "team" : props.team,
              //   "role" : props.role,
              //   "mode" : props.mode,
              // }
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
