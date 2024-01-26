/* eslint-disable */
import '../App.css';
import { Checkbox, Button } from "semantic-ui-react";
import React, { useEffect, useState } from 'react';
import { useNavigate, BrowserRouter as Routes, Route, useLocation} from "react-router-dom";
import {CreateDeck, Shuffle, DealDeck, NextTurn, IsLegal, SortAllHands, SaveHand, allSkipped, RemoveSkips} from '../utils/DeckAndPlayers'

function Game() {
  const suits = ["spades", "diamonds", "clubs", "hearts"];
  const values = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];
  const navigate = useNavigate();
  const {state} = useLocation();
  let {allPlayers} = state;

  allPlayers = SortAllHands(DealDeck(Shuffle(CreateDeck(suits, values)), allPlayers), values);
  let startCurrent = NextTurn(allPlayers, -1, 1);

  const [checked, setChecked] = useState(new Array(allPlayers[startCurrent].hand.length).fill(false));

  const [players, setPlayers] = useState(allPlayers);
  const [turn, setTurn] = useState(1);
  const [playersFinishedCount, setPlayersFinishedCount] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(startCurrent);
  const [previousPlayedCards, setPreviousPlayedCards] = useState([]);
  const [previousPlayerIndex, setPreviousPlayerIndex] = useState(undefined);
  const [illegalMoveErrorMessage, setIllegalMoveErrorMessage] = useState('');

  function Play() {
    let currentPlayerHand = players[currentPlayerIndex].hand;
    let cardsToPlay = [];
    let cardsToPlayIndexes = [];
    checked.forEach((isSelected, index) => {
        if (isSelected === true) {
          cardsToPlay.push(currentPlayerHand[index]);
          cardsToPlayIndexes.push(index);
        }
    });
    let isMoveLegal = false;
    try {
        isMoveLegal = IsLegal(cardsToPlay, previousPlayedCards, turn, values);
        setIllegalMoveErrorMessage('');
    } catch (error) {
        setIllegalMoveErrorMessage(error.message);
    }
    if (isMoveLegal) {
      cardsToPlayIndexes.sort((a, b) => b - a);
      cardsToPlayIndexes.forEach((index) => {
          currentPlayerHand.splice(index, 1);
      });

      debugger;
      let newPlayers = SaveHand(players, currentPlayerHand, currentPlayerIndex);
      if (newPlayers[currentPlayerIndex].hand.length === 0){
        newPlayers[currentPlayerIndex].skipped = true;
        newPlayers[currentPlayerIndex].finished = true;
        newPlayers[currentPlayerIndex].placement = playersFinishedCount + 1;
        
        if (allSkipped(newPlayers)) {
          newPlayers = RemoveSkips(newPlayers);
        }
        setPlayersFinishedCount(playersFinishedCount + 1)
      }

      let newTurn = turn + 1;
      let newCurrentPlayer = NextTurn(newPlayers, currentPlayerIndex, newTurn);
      if (newCurrentPlayer === undefined) {
        setIsGameComplete(true);
        return;
      }
      let newChecked = new Array(newPlayers[newCurrentPlayer].hand.length).fill(false);
      
      setChecked(newChecked);
      setPlayers(newPlayers);
      setPreviousPlayedCards(cardsToPlay);
      setPreviousPlayerIndex(currentPlayerIndex);
      setTurn(newTurn);
      setCurrentPlayerIndex(newCurrentPlayer);
    }
  }

  function Skip() {
    debugger;
    let newPlayers = players;
    newPlayers[currentPlayerIndex].skipped = true;
    
    let newTurn = turn + 1;
    let newCurrentPlayer = NextTurn(players, currentPlayerIndex, newTurn);
    let newChecked = new Array(newPlayers[newCurrentPlayer].hand.length).fill(false);

    let listOfSkipped = []
    newPlayers.forEach((player, index) => {
      listOfSkipped.push(player.skipped);
    });

    if (newCurrentPlayer === previousPlayerIndex || newCurrentPlayer === currentPlayerIndex || allSkipped(newPlayers)) {
      setPreviousPlayedCards([]);
      newPlayers = RemoveSkips(newPlayers);
    }
    else {
      newPlayers.forEach((player, index) => {
        if (player.finished) {
          newPlayers[index].skipped = true;
        }
      });
    }
    setPlayers(newPlayers);
    setChecked(newChecked);
    setTurn(newTurn);
    setCurrentPlayerIndex(newCurrentPlayer);
  }

  function renderLastPlayed() {
    if (previousPlayedCards.length === 0){
        return (
          <div className='last-played'>
            <div className={`card`}>
                <div className="value">?</div>
                    <img src={process.env.PUBLIC_URL + '/assets/questionmark.png'} alt="Question mark" />
            </div>
          </div>
        )
    }
    return (
      <div className='last-played'>
        {previousPlayedCards.map((card, index) => (
          <div
            className={`card`}
            key={index}
          >
            <div className="value">{card.Value}</div>
            <div className={`suit ${card.Suit}`}></div>
          </div>
        ))}
      </div>
    );
  }

  function renderOtherPlayers(players) {
    return (
      <div className="other-players-container">
        {players.map((player, index) => (
          <div key={index} >
              <div 
                className=
                {
                  `player 
                  ${player.skipped === true && `skipped`} 
                  ${index == currentPlayerIndex && `current`}
                  ${player.finished === true && `finished`}
                  ${player.position === true && `${position}`}`
                }
              >
                <div>
                    {player.name}<br/>
                </div>
                <div>{player.hand.length}</div>
                {player.hand.length > 0 && (
                  <div>  
                  <div className="centered">
                      {
                      }
                  </div>
                  </div>
                )}
              </div>
          </div>
        ))}
      </div>
    );
  }

  function renderDeck(cards, checked) {
    return cards.map((card, index) => (
      <div
        className={`card hand ${checked[index] ? 'selected' : ''}`}
        key={index}
        onClick={() => {
          const newChecked = [...checked];
          newChecked[index] = !newChecked[index];
          setChecked(newChecked);
        }}
      >
        <div className="value">{card.Value}</div>
        <div className={`suit ${card.Suit}`}></div>
      </div>
    ));
  }

  function renderPlayer(player) {
    return (
      <div className="hand">
        {player.name}<br />
      <div>{player.hand.length} cards left</div>
        <div className="player-cards">
          {player.hand.length > 0 && (
            <div>
                {renderDeck(player.hand, checked)}
            </div>
          )}
        </div>
      </div>
    );
  }

  function Modal({ message }) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h1 style={{ color: 'gold' }}>{message}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="App deck parent-container">
      {isGameComplete && <Modal message="Game Complete" />}

      <div className='above-div'>
      <h1>A Deck of Cards</h1>
      </div>

      <div className='centered-div'>
        {renderLastPlayed()}
        {renderOtherPlayers(players)}
        {illegalMoveErrorMessage && <p style={{color: 'red', alignSelf: 'flex-end'}}>{illegalMoveErrorMessage}</p>}
      </div>

      <div className='below-div'>
          <button onClick={Play} style={{ marginTop: '5px'}}>Play Cards</button> <br/>
          <button onClick={Skip} style={{ marginTop: '5px'}}>Skip Turn</button>
        {renderPlayer(players[currentPlayerIndex])}
      </div>

    </div>
  );
}

export default Game;