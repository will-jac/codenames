import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Title(props) {
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
                    className={props.role === "spymaster" ? "game-button " + props.team + " end-turn" : "game-button"}
                    onClick={(e) => props.setRole("spymaster")}
                >
                    Spy Master
                </button>
            </td>
        </tr>
    }

    return (
    <div className="small-text lobby-view">
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

        <Link to="play">
            <button className="game-button"
                style={{ background: "lightgreen" }}
            >
                Start Game
            </button>
        </Link>
        (This will lock in your team and role)
    </div>
    );
}

export default Title;
