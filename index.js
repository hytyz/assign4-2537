document.addEventListener('DOMContentLoaded', function() {
  let cards = [];
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matches = 0;
  let clicks = 0;
  let timer = 0;
  let timeElapsed = 0;

  async function fetchPokemonImage(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    return data.sprites.front_default;
  }

  async function getRandomPokemonIds(count) {
    const maxPokemonId = 898; // As of now, there are 898 Pokémon
    const randomIds = new Set();
    while (randomIds.size < count) {
      const randomId = Math.floor(Math.random() * maxPokemonId) + 1;
      randomIds.add(randomId);
    }
    return Array.from(randomIds);
  }

  async function createCard(id) {
    const img = await fetchPokemonImage(id);
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = id;

    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');
    card.appendChild(cardInner);

    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front');
    cardInner.appendChild(cardFront);

    const imgElement = document.createElement('img');
    imgElement.src = img;
    imgElement.alt = 'Pokemon';
    cardFront.appendChild(imgElement);

    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');
    cardInner.appendChild(cardBack);

    return card;
  }

  // Initialize the game
  async function initializeGame() {
    const gameGrid = document.getElementById('game_grid');
    gameGrid.innerHTML = '';
    const selectedDifficulty = document.querySelector('input[name="options"]:checked').value;
    let numPairs;
    switch (selectedDifficulty) {
      //how many cards to show
      case 'easy':
        numPairs = 6;
        break;
      case 'medium':
        numPairs = 12;
        break;
      case 'hard':
        numPairs = 18;
        break;
    }

    // Fetch random Pokémon images
    const randomIds = await getRandomPokemonIds(numPairs);
    cards = [...randomIds, ...randomIds]; // Duplicate for pairs
    shuffle(cards);
    for (let id of cards) {
      const card = await createCard(id);
      gameGrid.appendChild(card);
    }
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach(function(card) {
      card.addEventListener('click', handleCardClick);
    });
    resetGameStats();
    startTimer();
  }

  // shuffle the cards
  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  // handle the card click
  function handleCardClick() {
    if (lockBoard || this.classList.contains('flipped') || this.classList.contains('matched')) return;

    this.classList.add('flipped');
    clicks++;
    document.getElementById('clicks').textContent = clicks;

    if (!firstCard) {
      firstCard = this;
    } else {
      secondCard = this;
      checkForMatch();
    }
  }

  // check for a match
  function checkForMatch() {
    const isMatch = firstCard.dataset.id === secondCard.dataset.id;
    isMatch ? disableCards() : unflipCards();
  }

  // disable the cards if they match and check if the game is over
  function disableCards() {
    firstCard.classList.add('matched');
    firstCard.removeEventListener('click', handleCardClick);
    secondCard.classList.add('matched');
    secondCard.removeEventListener('click', handleCardClick);
    resetBoard();
    matches++;
    document.getElementById('matches').textContent = matches;
    document.getElementById('left').textContent = (cards.length / 2) - matches;
    checkGameOver();
  }

  // unflip the cards if they don't match
  function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetBoard();
    }, 1500);
  }

  // reset the board
  function resetBoard() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }

  // check if the game is over
  function checkGameOver() {
    if (matches === cards.length / 2) {
      clearInterval(timer);
      alert(`You win! Time taken: ${timeElapsed} seconds.`);
    }
  }

  // reset the game stats when the game is restarted
  function resetGameStats() {
    matches = 0;
    clicks = 0;
    timeElapsed = 0;
    document.getElementById('matches').textContent = matches;
    document.getElementById('clicks').textContent = clicks;
    document.getElementById('total').textContent = cards.length / 2;
    document.getElementById('left').textContent = cards.length / 2;
    document.getElementById('time').textContent = timeElapsed;
  }

  // start the timer
  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      timeElapsed++;
      document.getElementById('time').textContent = timeElapsed;
    }, 1000);
  }

  // reveal all cards for 1 second as a power up
  function revealAllCards() {
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach(function(card) {
      card.classList.add('flipped');
    });
    setTimeout(() => {
      cardElements.forEach(function(card) {
        if (!card.classList.contains('matched')) {
          card.classList.remove('flipped');
        }
      });
    }, 1000); // Reveal cards for 1 second
  }

  document.getElementById('start').addEventListener('click', initializeGame);

  document.getElementById('dark').addEventListener('click', function() {
    document.body.classList.add('dark-theme');
  });

  document.getElementById('light').addEventListener('click', function() {
    document.body.classList.remove('dark-theme');
  });

  document.getElementById('reveal').addEventListener('click', revealAllCards);

  initializeGame();
});