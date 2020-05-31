import React, { useState } from 'react';
import '../App.css';
import {server} from '../App.js'

function GameHeader(props) {
    console.log(props.team);
    var team_color = props.team === props.teams[0] ? props.teamColors[0] : props.teamColors[1]
    return (
      <div className="game-header">
        <div>
          Remaining: <span className={props.teamColors[0]}>{props.teamRemain[0]}</span>
          -
          <span className={props.teamColors[1]}>{props.teamRemain[1]}</span>
        </div>
        <div className={team_color}>{props.team} Team's Turn!</div>
        <div className={team_color}>
          <button className={"end-turn"} onClick={(e)=>props.endTurn(props.team)}>End Turn</button>
        </div>
      </div>
    )
  }

export {GameHeader};