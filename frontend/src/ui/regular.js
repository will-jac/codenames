import React, { useState } from 'react';
import '../App.css';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

function GameHeader(props) {
    return (
      <div className="game-header">
        <div>
          Remaining: <span className={props.teams[0]}>{props.teamRemain[0]}</span>
          -
          <span className={props.teams[1]}>{props.teamRemain[1]}</span>
        </div>
        <div className={props.turn}>{capitalizeFirstLetter(props.turn)} Team's Turn!</div>
        {props.turn === props.team 
        ? 
            <div className={props.turn}>
            <button className={"end-turn"} onClick={(e)=>props.endTurn(props.turn)}>End Turn</button>
            </div>
        : null
        }
      </div>
    )
}

export {GameHeader};