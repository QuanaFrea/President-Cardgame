/* eslint-disable */
import '../App.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {CreatePlayer, RemovePlayer, EmptyHands, CreateDeck, Shuffle, DealDeck, CheckStarter, NextTurn, IsPlayable} from '../utils/DeckAndPlayers'

function Home() {
  const navigate = useNavigate()
  const suits = ["spades", "diamonds", "clubs", "hearts"];
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const [deck, setDeck] = useState(Shuffle(CreateDeck(suits, values)));
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState();
  const [addPlayerErrorMessage, setAddPlayerErrorMessage] = useState('');
  const [dealDeckErrorMessage, setDealDeckErrorMessage] = useState('');
  const [starter, setStarter] = useState();

  function checking() {
    setStarter(CheckStarter(players))
  }

  function GoToGame(e) {
    e.preventDefault();
    if (players.length >= 2) {
      navigate('/game', {state: {allPlayers: players}})
    }
    setDealDeckErrorMessage('Must have at least 2 players to start the game.')
  }

  function handleAddPlayer() {
    try {
      setPlayers(CreatePlayer(players, newPlayerName));
      setAddPlayerErrorMessage('');
      setDealDeckErrorMessage('');
    } catch (error) {
      setAddPlayerErrorMessage(error.message);
    }
  }

  function handleDealDeck() {
    try {
      setPlayers(DealDeck(Shuffle(deck), players))
      setAddPlayerErrorMessage('');
      setDealDeckErrorMessage('');
    } catch (error) {
      setDealDeckErrorMessage(error.message);
    }
  }

  function renderDeck(cards) {
    return cards.map((card, index) => (
        <div className="card" key={index}>
        <div className="value">{card.Value}</div>
        <div className={`suit ${card.Suit}`}></div>
        </div>
    ));
  }

  function renderPlayers(players) {
    return (
      <div className="players-container">
        {players.map((player, index) => (
          <div key={index} className="player">
            <div>
              {player.name}<br/>
              <button onClick={() => setPlayers(RemovePlayer(EmptyHands(players), index))}>Remove Player</button>
            </div>
            <div>{player.hand.length}</div>
            {player.hand.length > 0 && (
              <div>  
                <button onClick={() => setPlayers(RemovePlayer(EmptyHands(players), index))}>Remove Player</button>
                <div className="centered">
                    {
                    renderDeck(player.hand)
                    }
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="App">
      <div className="deck">
        <h1>A Deck of Cards</h1>
        <button onClick={GoToGame}>Start the Game</button> <br/>

        <input type="text" placeholder="Enter Player Name" onChange={e => setNewPlayerName(e.target.value)} /> <br/>
        <button onClick={handleAddPlayer}>Add Player</button> <br/>
        {addPlayerErrorMessage && <p style={{color: 'red'}}>{addPlayerErrorMessage}</p>}

        <div className="players">{renderPlayers(players)}</div>

        <p>{starter}</p>
        <button onClick={checking}>Check Starter Player</button> <br/>

        <button onClick={handleDealDeck}>Deal the Deck</button> <br/>
        {dealDeckErrorMessage && <p style={{color: 'red'}}>{dealDeckErrorMessage}</p>}
        <button onClick={() => setPlayers(EmptyHands(players))}>Reset Hands</button> <br/>

        <button className="btn" onClick={() => setDeck(Shuffle(CreateDeck(suits, values)))}>Shuffle</button>
        <div id="deck" className="centered-big">{renderDeck(deck)}</div>
      </div>
    </div>
  );
}

export default Home;