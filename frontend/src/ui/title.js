import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

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
        <button className="game-button" style={{ background: "lightblue" }}>
            Create a New Game
        </button>
        </Link>
        <Link to="join">
        <button className="game-button" style={{ background: "lightgreen" }}>
            Join an Existing Game
        </button>
        </Link>
    </div>
    );
}

function Join(props) {
    return (
        <div className="small-text lobby-view">
        <table>
        <tbody>
        <tr>
          <td>Find a game by code: </td>
          <td>
            <input className="join-code" type="text" name="joinCode"
              value={props.joinCode} onChange={(e) => props.setJoinCode(e.target.value)}
            />
            <button className="game-button" style={{background:"lightgreen"}}
                //TODO: onClick={}
            >
                Find Game
            </button>
          </td>
        </tr>
      </tbody>
      </table>
      <Link to="lobby">
          <button className="game-button"
              style={{ background: "lightblue" }}
          >
              Join Game
          </button>
      </Link>
      </div>
    );
}

function Create(props) {
  return (
    <div className="small-text lobby-view">
      <table>
      <tbody>
      <tr>
        <td>
          What style of game do you want to play?
        </td>
        <td>
          <button className="game-button"
            style={props.gameMode === "regular" ? { background: "lightcoral" } : {}}
            onClick={(e) => props.setGameMode("regular")}
          >
          Regular
          </button>
          <button className="game-button"
            style={props.gameMode === "duet" ? { background: "lightgreen" } : {}}
            onClick={(e) => props.setGameMode("duet")}
          >
          Duet
          </button>
        </td>
      </tr>
      <tr>
        <td>Set a code to join your game: </td>
        <td>
          <input className="join-code" type="text" name="joinCode"
            value={props.joinCode} onChange={(e) => props.setJoinCode(e.target.value)}
          />
          </td>
        </tr>
    </tbody>
    </table>
    <Link to="lobby">
        <button className="game-button"
            style={{ background: "lightblue" }}
            // TODO: add error checking. What if game creation fails?
            onClick={(e) => {
                var gameMode = props.gameMode;
                var joinCode = props.joinCode;
                props.createGame({ gameMode, joinCode }, props.callback);
            }}
        >
            Create Game
        </button>
    </Link>
    </div>
  );
}

export default Title;
export {Create, Join};
