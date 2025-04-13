<template>
  <div class="memory-game-container">
    <div class="game-header">
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Moves:</span>
          <span class="stat-value">{{ moves }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Matches:</span>
          <span class="stat-value">{{ matchesFound }} / {{ totalPairs }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Time:</span>
          <span class="stat-value">{{ formatTime(timer) }}</span>
        </div>
      </div>
      
      <div class="controls">
        <button class="control-btn" @click="resetGame">New Game</button>
        <select v-model="difficulty" class="difficulty-select" @change="resetGame">
          <option value="easy">Easy (4x3)</option>
          <option value="medium">Medium (4x4)</option>
          <option value="hard">Hard (6x4)</option>
        </select>
      </div>
    </div>
    
    <div class="game-over" v-if="gameOver">
      <div class="game-over-content">
        <h2>Congratulations! 🎉</h2>
        <p>You completed the game in {{ formatTime(timer) }} with {{ moves }} moves!</p>
        <button class="play-again-btn" @click="resetGame">Play Again</button>
      </div>
    </div>

    <div class="game-board" :class="difficulty" style="width:100%;">
      <div 
        v-for="(card, index) in cards" 
        :key="index"
        class="memory-card"
        :class="{ 
          'flipped': card.flipped,
          'matched': card.matched,
          'celebrating': card.celebrating
        }"
        @click="flipCard(index)"
      >
        <div class="card-inner">
          <div class="card-front">
            <div class="card-pattern"></div>
          </div>
          <div class="card-back">
            <img :src="card.image" :alt="`Monkey ${card.id}`" class="card-image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

// Import monkey images
import monkey1 from '../assets/1.png';
import monkey2 from '../assets/2.png';
import monkey3 from '../assets/3.png';
import monkey4 from '../assets/4.png';
import monkey5 from '../assets/5.png';
import monkey6 from '../assets/6.png';
import monkey7 from '../assets/7.png';
import monkey8 from '../assets/8.png';
import monkey9 from '../assets/9.png';
import monkey10 from '../assets/10.png';
import monkey11 from '../assets/11.png';
import monkey12 from '../assets/12.png';
import monkey13 from '../assets/13.png';
import monkey14 from '../assets/14.png';

// Game state
const cards = ref([]);
const flippedCards = ref([]);
const matchesFound = ref(0);
const moves = ref(0);
const timer = ref(0);
const gameStarted = ref(false);
const gameOver = ref(false);
const difficulty = ref('medium');
let timerInterval = null;

// Available monkey images
const monkeyImages = [
  { id: 1, src: monkey1 },
  { id: 2, src: monkey2 },
  { id: 3, src: monkey3 },
  { id: 4, src: monkey4 },
  { id: 5, src: monkey5 },
  { id: 6, src: monkey6 },
  { id: 7, src: monkey7 },
  { id: 8, src: monkey8 },
  { id: 9, src: monkey9 },
  { id: 10, src: monkey10 },
  { id: 11, src: monkey11 },
  { id: 12, src: monkey12 },
  { id: 13, src: monkey13 },
  { id: 14, src: monkey14 },
];

// Computed value for total number of pairs in the game
const totalPairs = computed(() => {
  switch (difficulty.value) {
    case 'easy':
      return 6;
    case 'medium':
      return 8;
    case 'hard':
      return 12;
    default:
      return 8;
  }
});

// Initialize the game
const initGame = () => {
  // Determine how many pairs based on difficulty
  let numPairs = totalPairs.value;
  
  // Select random monkeys from available images
  const selectedMonkeys = [...monkeyImages]
    .sort(() => 0.5 - Math.random())
    .slice(0, numPairs);
  
  // Create pairs of cards
  const cardPairs = selectedMonkeys.flatMap(monkey => [
    {
      id: monkey.id,
      image: monkey.src,
      flipped: false,
      matched: false,
      celebrating: false
    },
    {
      id: monkey.id,
      image: monkey.src,
      flipped: false,
      matched: false,
      celebrating: false
    }
  ]);
  
  // Shuffle the cards
  cards.value = cardPairs.sort(() => 0.5 - Math.random());
  
  // Reset game state
  flippedCards.value = [];
  matchesFound.value = 0;
  moves.value = 0;
  timer.value = 0;
  gameStarted.value = false;
  gameOver.value = false;
};

// Start the game timer
const startTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  timerInterval = setInterval(() => {
    timer.value++;
  }, 1000);
};

// Format the time for display (MM:SS)
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Flip a card
const flipCard = (index) => {
  const card = cards.value[index];
  
  // Ignore if game is over or card is already flipped/matched
  if (gameOver.value || card.flipped || card.matched) {
    return;
  }
  
  // Start the game and timer on first flip
  if (!gameStarted.value) {
    gameStarted.value = true;
    startTimer();
  }
  
  // If we already have 2 cards flipped and not matched yet, ignore
  if (flippedCards.value.length === 2) {
    return;
  }
  
  // Flip the card
  card.flipped = true;
  flippedCards.value.push(index);
  
  // If we now have 2 cards flipped, check for a match
  if (flippedCards.value.length === 2) {
    moves.value++;
    const card1 = cards.value[flippedCards.value[0]];
    const card2 = cards.value[flippedCards.value[1]];
    
    // Check if the cards match
    if (card1.id === card2.id) {
      // Mark cards as matched
      card1.matched = true;
      card2.matched = true;
      
      // Trigger celebration animation
      card1.celebrating = true;
      card2.celebrating = true;
      
      // End celebration after animation
      setTimeout(() => {
        card1.celebrating = false;
        card2.celebrating = false;
      }, 1000);
      
      // Update matches count
      matchesFound.value++;
      
      // Check if game is over
      if (matchesFound.value === totalPairs.value) {
        gameOver.value = true;
        clearInterval(timerInterval);
      }
      
      // Reset flipped cards array
      flippedCards.value = [];
    } else {
      // If no match, flip the cards back after a delay
      setTimeout(() => {
        card1.flipped = false;
        card2.flipped = false;
        flippedCards.value = [];
      }, 1000);
    }
  }
};

// Reset the game
const resetGame = () => {
  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Initialize a new game
  initGame();
};

// Watch for game over to play victory animation
watch(gameOver, (newValue) => {
  if (newValue) {
    // Play victory sound or additional animations if desired
  }
});

// Lifecycle hooks
onMounted(() => {
  initGame();
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

<style scoped>
.memory-game-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
  padding: 20px;
  box-sizing: border-box;
  overflow: auto;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  color: white;
}

.stats {
  display: flex;
  gap: 25px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: bold;
}

.controls {
  display: flex;
  gap: 10px;
}

.control-btn, .play-again-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.control-btn:hover, .play-again-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.control-btn:active, .play-again-btn:active {
  transform: translateY(1px);
}

.difficulty-select {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  outline: none;
}

.game-board {
  flex: 1;
  display: grid;
  gap: 15px;
  justify-content: center;
  perspective: 1000px;
}

.game-board.easy {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  max-width: 700px;
  margin: 0 auto;
}

.game-board.medium {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  max-width: 700px;
  margin: 0 auto;
}

.game-board.hard {
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 1fr);
  max-width: 900px;
  margin: 0 auto;
}

.memory-card {
  position: relative;
  min-height: 120px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.3s;
  transform-style: preserve-3d;
  user-select: none;
}

.memory-card:hover {
  transform: scale(1.05);
}

.memory-card.flipped {
  transform: rotateY(180deg);
}

.memory-card.matched {
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.8);
}

.memory-card.celebrating {
  animation: celebrate 1s ease-in-out;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-front {
  background: #2c3e50;
  background: linear-gradient(135deg, #2c3e50, #4ca1af);
}

.card-pattern {
  width: 80%;
  height: 80%;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.1) 2px, transparent 2px);
  background-size: 15px 15px;
}

.card-back {
  background-color: white;
  transform: rotateY(180deg);
  padding: 10px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.game-over {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 100;
  animation: fadeIn 0.5s ease-in-out;
}

.game-over-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: popIn 0.5s ease-in-out;
}

.game-over h2 {
  margin-top: 0;
  color: #4CAF50;
}

.play-again-btn {
  margin-top: 20px;
  font-size: 1.2rem;
}

@keyframes celebrate {
  0% { transform: rotateY(180deg) scale(1); }
  25% { transform: rotateY(180deg) scale(1.2); }
  50% { transform: rotateY(180deg) scale(1); }
  75% { transform: rotateY(180deg) scale(1.1); }
  100% { transform: rotateY(180deg) scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .memory-card {
    min-height: 80px;
  }
  
  .game-board.hard {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(6, 1fr);
  }
}
</style>