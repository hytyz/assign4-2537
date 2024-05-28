
$(function(){
    let cards = [];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matches = 0;
    let clicks = 0;
    let timer;
    let timeElapsed = 0;
  
    // fetches a random Pokémon image from the PokéAPI using the Pokémon ID and returns the image URL
    async function fetchPokemonImage(id) {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();
      return data.sprites.front_default;
    }
    
    // Fetches a random Pokémon image from the PokéAPI using the Pokémon ID and returns the image URL
    async function getRandomPokemonIds(count) {
      const maxPokemonId = 898; // As of now, there are 898 Pokémon
      const randomIds = new Set();
      while (randomIds.size < count) {
        const randomId = Math.floor(Math.random() * maxPokemonId) + 1;
        randomIds.add(randomId);
      }
      return Array.from(randomIds);
    }
  
    // creates a card element with a Pokémon image
    async function createCard(id) {
      const img = await fetchPokemonImage(id);
      //return the card element
      return `
        <div class="card" data-id="${id}">
          <div class="card-inner">
            <div class="card-front">
              <img src="${img}" alt="Pokemon">
            </div>
            <div class="card-back"></div>
          </div>
        </div>
      `;
    }
    
    // Initialize the game
    async function initializeGame() {
      $('#game_grid').empty();
      const selectedDifficulty = $('input[name="options"]:checked').val();
      let numPairs;
      switch (selectedDifficulty) {
        //how many cards to show
        case 'easy':
          numPairs = 5;
          break;
        case 'medium':
          numPairs = 7;
          break;
        case 'hard':
          numPairs = 10;
          break;
      }
  
      // Fetch random Pokémon images
      const randomIds = await getRandomPokemonIds(numPairs);
      cards = [...randomIds, ...randomIds]; // Duplicate for pairs
      shuffle(cards);
      for (let id of cards) {
        $('#game_grid').append(await createCard(id));
      }
      $('.card').on('click', handleCardClick);
      resetGameStats();
      startTimer();
    }
  
    // shuffle the cards
    function shuffle(array) {
      return array.sort(() => Math.random() - 0.5);
    }
  
    // handle the card click
    function handleCardClick() {
      if (lockBoard || $(this).hasClass('flipped') || $(this).hasClass('matched')) return;
  
      $(this).addClass('flipped');
      clicks++;
      $('#clicks').text(clicks);
  
      if (!firstCard) {
        firstCard = $(this);
      } else {
        secondCard = $(this);
        checkForMatch();
      }
    }
  
    // check for a match
    function checkForMatch() {
      const isMatch = firstCard.data('id') === secondCard.data('id');
      isMatch ? disableCards() : unflipCards();
    }
  
    // disable the cards if they match and check if the game is over
    function disableCards() {
      firstCard.addClass('matched').off('click');
      secondCard.addClass('matched').off('click');
      resetBoard();
      matches++;
      $('#matches').text(matches);
      $('#left').text((cards.length / 2) - matches);
      checkGameOver();
    }
  
    // unflip the cards if they don't match
    function unflipCards() {
        //lock the board if the cards don't match
      lockBoard = true;
      setTimeout(() => {
        //unflip the cards
        firstCard.removeClass('flipped');
        secondCard.removeClass('flipped');
        //reset the board if the cards don't match for the next turn
        resetBoard();
      }, 1500);
    }
  
    // reset the board
    function resetBoard() {
      [firstCard, secondCard, lockBoard] = [null, null, false];
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
      [matches, clicks, timeElapsed] = [0, 0, 0];
      $('#matches').text(matches);
      $('#clicks').text(clicks);
      $('#total').text(cards.length / 2);
      $('#left').text(cards.length / 2);
      $('#time').text(timeElapsed);
    }
  
    // start the timer
    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => {
        timeElapsed++;
        $('#time').text(timeElapsed);
      }, 1000);
    }
  
    // reveal all cards for 1 second as a power up
    function revealAllCards() {
      $('.card').addClass('flipped');
      setTimeout(() => {
        $('.card').not('.matched').removeClass('flipped');
      }, 1000); // Reveal cards for 1 second
    }
  
    $('#start').on('click', initializeGame);
  
    $('#dark').on('click', function() {
      $('body').addClass('dark-theme');
    });
  
    $('#light').on('click', function() {
      $('body').removeClass('dark-theme');
    });
  
    $('#reveal').on('click', revealAllCards);
  
    initializeGame();
  });
  