/* eslint-disable */

function CreatePlayer(players, name) {
    if (players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("That name is already taken.");
    }
    if (name.trim() === "" || name === undefined) {
        throw new Error("Name cannot be empty.");
    }
    if (players.length >= 8) {
        throw new Error("Game is already full. Maximum of 8 players");
    }

    const newPlayer = {
        name: name,
        hand: [],
        skipped: false,
        finished: false,
        placement: undefined
    };
    return EmptyHands(players).concat(newPlayer);
}

function RemovePlayer(players, index) {
    return players.filter((_, i) => i !== index);
}

function RemoveCard(hand, index) {
    return hand.filter((_, i) => i !== index);
}

function EmptyHands(players) {
    return players.map(player => ({...player, hand: []}));
}

function SaveHand(players, newHand, index) {
    players[index].hand = newHand;
    return players;
}

function CreateDeck(suits, values) {
    let newDeck = [];

    for(let i = 0; i < suits.length; i++)
    {
        for(let x = 0; x < values.length; x++)
        {
        let card = {
            Value: values[x], 
            Suit: suits[i]
        };
        newDeck.push(card);
        }
    }
    return newDeck;
}

function Shuffle(newDeck) {  
    for (let i = 0; i < 3000; i++) {
        let location1 = Math.floor((Math.random() * newDeck.length));
        let location2 = Math.floor((Math.random() * newDeck.length));
        let tmp = newDeck[location1];

        newDeck[location1] = newDeck[location2];
        newDeck[location2] = tmp;
    }
    return newDeck;
}

function DealDeck(deck, players) {
    if (players.length < 2) {
        throw new Error("Must have a minimum of two players.");
    }

    players = EmptyHands(players);
    let i = 0;
    while(i < deck.length) {
        for (let j = 0; j < players.length; j++) {
            if (i < deck.length) {
                players[j].hand.push(deck[i])
                i++
            }
        }
    }
    return players;
}

function SortHand(hand) {
    return hand.sort((a, b) => a.Value - b.Value);
}

//Sorts all players cards numerically
function SortAllHands(players, values) {
    const valueOrder = values.reduce((acc, val, idx) => {
      acc[val] = idx;
      return acc;
    }, {});
  
    players.forEach((player) => {
      player.hand.sort((a, b) => {
        const aVal = valueOrder[a.Value];
        const bVal = valueOrder[b.Value];
        return aVal - bVal;
      });
    });
  
    return players;
}

//Checks if all players are skipped
function allSkipped(players) {
    if (players.length === 0) {
      return true;
    }
  
    return players.every((element) => element.skipped === true);
}

//Unmarks skipped variable for all players who have not finished
function RemoveSkips(players) {
    players.forEach((player, index) => {
        if (player.finished) {
            player.skipped = true;
        }
        else {
            player.skipped = false;
        }
    });
    return players;
}

//Returns index of player with 3 of diamonds
function CheckStarter(players) {
    let result = null;
    players.forEach((player, index) => {
        player.hand.forEach((card) => {
        if (card.Value == 3 && card.Suit === "diamonds") {
            result = index;
        }
        });
    });
    return result;
}

//Returns index of the next player, or 0 if at the end of array
function GetNextPlayer(players, currentPlayer) {
    if (currentPlayer >= (players.length -1)) 
        return 0;

    else 
        return ++currentPlayer;
}

//Returns the index of the player whose turn it is
function NextTurn(players, currentPlayer, turn) {
    //Checking if its the first turn
    if (turn === 1) {
        currentPlayer = CheckStarter(players);
        return currentPlayer;
    }

    let newPlayer = currentPlayer;
    //Checking for next non-skipped player and returning if found
    for (let i = 0; i < players.length; i++) {
        newPlayer = GetNextPlayer(players, newPlayer);
        if (players[newPlayer].skipped !== true) {
            return newPlayer;
        }
    }

    //Checking for next player who has not finished
    newPlayer = GetNextPlayer(players, currentPlayer);
    for (let i = 0; i < players.length; i++) {
        if (newPlayer >= (players.length -1)) 
            newPlayer = 0;
        
        else 
            newPlayer++;
    
        if (players[newPlayer].finished !== true) 
            return newPlayer;
    }
}

//Checks if the selected cards are playable
function IsLegal(cardsToPlay, lastPlayedCards, turn, values) {
    const valueOrder = values.reduce((acc, val, idx) => {
        acc[val] = idx;
        return acc;
    }, {});

    let isMoveLegal = false;
    let toPlayValue = -1;
    if (cardsToPlay.length == 0) {
        throw new Error("You must play a legal move or skip.");
    }
    if (lastPlayedCards.length != 0 && cardsToPlay.length !== lastPlayedCards.length) {
        throw new Error("You must play the same number of cards as the last player.");
    }
    cardsToPlay.forEach((card, index) => {
        if (turn === 1 && card.Value == 3 && card.Suit === "diamonds") 
            isMoveLegal = true;
        
        if (toPlayValue === -1) 
            toPlayValue = valueOrder[card.Value]
        
        if (valueOrder[card.Value] !== toPlayValue) {
            throw new Error("All cards must be the same value to play.");
        }
    });
    if (!isMoveLegal && turn === 1) {
        throw new Error("Must play 3 of diamonds on the first move.");
    }
    if (lastPlayedCards.length > 0) {
        if (toPlayValue < valueOrder[lastPlayedCards[0].Value]) {
            throw new Error("Must play a higher or equal card than the previous player.");
        }
    }

    return true;
}


export {CreatePlayer, RemovePlayer, EmptyHands, CreateDeck, Shuffle, DealDeck, CheckStarter, NextTurn, IsLegal, SortAllHands, RemoveCard, SaveHand, allSkipped, RemoveSkips};