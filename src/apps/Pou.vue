<template>
  <div class="pou-container" ref="gameContainer">
    <div class="floor"></div>
    <button class="add-monkey-btn" @click="addMonkey" :disabled="monkeys.length >= 10">
      Add Monkey ({{ monkeys.length }}/10)
    </button>
    
    <button 
      class="auto-jump-btn" 
      @click="toggleAutoJump"
      :class="{ active: autoJumpActive }"
    >
      {{ autoJumpActive ? 'Stop Auto-Jump' : 'Start Auto-Jump' }}
    </button>
    
    <div 
      v-for="monkey in monkeys" 
      :key="monkey.id" 
      class="monkey" 
      :style="getMonkeyStyle(monkey)"
      @click="onMonkeyClick(monkey)"
    >
      <div class="reaction-container">
        <transition-group :name="monkey.reactionAnimation">
          <div 
            v-for="reaction in monkey.reactions" 
            :key="reaction.id" 
            class="reaction"
            :style="{ 
              left: reaction.x + 'px', 
              top: reaction.y + 'px',
              fontSize: reaction.size + 'px'
            }"
          >
            {{ reaction.symbol }}
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import image1 from '../assets/1.png';
import image2 from '../assets/2.png';
import image3 from '../assets/3.png';
import image6 from '../assets/6.png';
import image8 from '../assets/8.png';
import image5 from '../assets/5.png';
import image7 from '../assets/7.png';
import image10 from '../assets/10.png';
import image11 from '../assets/11.png';
import image13 from '../assets/13.png';
import image14 from '../assets/14.png';

// References
const gameContainer = ref(null);

// Available monkey images
const monkeyImages = [image1, image2, image3, image5, image7, image10, image11, image13, image14, image6, image8];

// Available reaction types
const reactionTypes = [
  // Love theme
  { symbols: ['❤️', '💕', '💓', '💗', '💖'], animation: 'float-up' },
  // Sparkle theme
  { symbols: ['⭐', '✨', '🌟', '💫', '⚡'], animation: 'spin-up' },
  // Fruit theme
  { symbols: ['🍌', '🥜', '🍎', '🍊', '🥭'], animation: 'bounce-up' },
  // Happy faces theme
  { symbols: ['😊', '😍', '🥰', '😁', '😸'], animation: 'fade-up' },
  // Music theme
  { symbols: ['🎵', '🎶', '🎼', '🎸', '🎺'], animation: 'float-up' },
  // Weather theme
  { symbols: ['☁️', '⛅', '🌤️', '☀️', '🌈'], animation: 'spin-up' },
  // Party theme
  { symbols: ['🎉', '🎊', '🎈', '🥳', '🎁'], animation: 'bounce-up' },
  // Ocean theme
  { symbols: ['🐠', '🐬', '🐙', '🐋', '🌊'], animation: 'fade-up' },
  // Space theme
  { symbols: ['🚀', '🛸', '👽', '🪐', '🌠'], animation: 'spin-up' },
  // Jungle theme
  { symbols: ['🐵', '🦍', '🍃', '🌴', '🦜'], animation: 'bounce-up' },
  // Flower theme
  { symbols: ['🌸', '🌺', '🌼', '🌻', '🌹'], animation: 'float-up' },
  // Dessert theme
  { symbols: ['🍦', '🍰', '🍩', '🍪', '🧁'], animation: 'fade-up' },
  // Poop theme
  { symbols: ['💩', '🧻', '🪰', '🦟', '🦨'], animation: 'bounce-up' },
  { symbols: ['💩', '💩', '💩', '💩', '💩'], animation: 'bounce-up' },
  { symbols: ['kurwa', 'KURWA', 'kurwa', 'KURWA', 'fuck'], animation: 'bounce-up' },

  { symbols: ['🌈', '✨', '🌟', '💫', '🌌'], animation: 'glow-up' },
];

// State variables
const monkeys = ref([]);
let monkeyCounter = 0;
let reactionCounter = 0;
let animationFrameId = null;
let lastTimestamp = 0;
let floorHeight = 0;
const autoJumpActive = ref(false);
let autoJumpTimers = [];

// Constants
const GRAVITY = 0.5;
const SQUISH_RECOVERY = 0.1;
const FLOOR_BOUNCE = 0.6;
const ROTATION_RECOVERY = 0.1;
const BASE_JUMP_FORCE = 10;
const AUTO_JUMP_MIN_INTERVAL = 1000; // Minimum time between auto jumps (ms)
const AUTO_JUMP_MAX_INTERVAL = 5000; // Maximum time between auto jumps (ms)

// Toggle auto-jump mode
const toggleAutoJump = () => {
  autoJumpActive.value = !autoJumpActive.value;
  
  if (autoJumpActive.value) {
    startAutoJump();
  } else {
    stopAutoJump();
  }
};

// Start automatic jumping for all monkeys
const startAutoJump = () => {
  // Clear any existing timers first
  stopAutoJump();
  
  // Set up random jumping for each monkey
  monkeys.value.forEach(monkey => {
    scheduleNextJump(monkey);
  });
};

// Schedule the next jump for a specific monkey
const scheduleNextJump = (monkey) => {
  if (!autoJumpActive.value) return;
  
  // Random interval between jumps
  const jumpDelay = AUTO_JUMP_MIN_INTERVAL + Math.random() * (AUTO_JUMP_MAX_INTERVAL - AUTO_JUMP_MIN_INTERVAL);
  
  const timerId = setTimeout(() => {
    // Only jump if the monkey is on or near the ground
    const isNearGround = monkey.position.y + monkey.size/2 >= gameContainer.value.getBoundingClientRect().height - floorHeight - 10;
    
    if (isNearGround && autoJumpActive.value) {
      onMonkeyClick(monkey);
    }
    
    // Schedule next jump if auto-jump is still active
    scheduleNextJump(monkey);
  }, jumpDelay);
  
  autoJumpTimers.push(timerId);
};

// Stop all auto-jumping
const stopAutoJump = () => {
  // Clear all timers
  autoJumpTimers.forEach(timerId => clearTimeout(timerId));
  autoJumpTimers = [];
};

// Add a new monkey
const addMonkey = () => {
  if (monkeys.value.length >= 10) return;
  
  const containerRect = gameContainer.value.getBoundingClientRect();
  
  // Create a monkey with random properties
  const monkey = {
    id: monkeyCounter++,
    image: monkeyImages[Math.floor(Math.random() * monkeyImages.length)],
    position: { 
      x: 100 + Math.random() * (containerRect.width - 200), 
      y: containerRect.height - floorHeight - 100 
    },
    velocity: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    size: 150 + Math.floor(Math.random() * 100), // Random size between 150-250px
    jumpForce: BASE_JUMP_FORCE * (0.8 + Math.random() * 0.8), // Random jump force
    reactions: [],
    reactionType: reactionTypes[Math.floor(Math.random() * reactionTypes.length)],
    reactionAnimation: reactionTypes[Math.floor(Math.random() * reactionTypes.length)].animation
  };
  
  monkeys.value.push(monkey);

  // If auto-jump is active, schedule jumps for the new monkey
  if (autoJumpActive.value) {
    scheduleNextJump(monkeys.value[monkeys.value.length - 1]);
  }
};

// Get computed style for a monkey
const getMonkeyStyle = (monkey) => {
  return {
    transform: `translate(${monkey.position.x}px, ${monkey.position.y}px) 
                rotate(${monkey.rotation}deg) 
                scale(${monkey.scale.x}, ${monkey.scale.y})`,
    backgroundImage: `url(${monkey.image})`,
    width: `${monkey.size}px`,
    height: `${monkey.size}px`
  };
};

// Handle monkey click - jump and show reactions
const onMonkeyClick = (monkey) => {
  // Make monkey jump
  monkey.velocity.y = -monkey.jumpForce;
  
  // Apply squish effect when jumping
  monkey.scale = { x: 0.8, y: 1.2 };
  
  // Add slight random horizontal movement for cute effect
  monkey.velocity.x = (Math.random() * 2 - 1) * 3;
  
  // Show reactions
  showReactions(monkey);
};

// Show reactions when monkey is clicked
const showReactions = (monkey) => {
  const size = monkey.size;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Get random symbols based on this monkey's reaction type
  const symbols = monkey.reactionType.symbols;
  
  // Create reactions with random positions around the monkey
  for (let i = 0; i < 5; i++) {
    const randomX = centerX + (Math.random() * 80 - 40);
    const randomY = centerY - (Math.random() * 80 + 20);
    
    const reaction = {
      id: reactionCounter++,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      x: randomX,
      y: randomY,
      size: 24 + Math.floor(Math.random() * 12) // Random font size between 24-36px
    };
    
    monkey.reactions.push(reaction);
    
    // Remove reaction after animation
    setTimeout(() => {
      monkey.reactions = monkey.reactions.filter(r => r.id !== reaction.id);
    }, 1000);
  }
};

// Game loop
const gameLoop = (timestamp) => {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = (timestamp - lastTimestamp) / 16; // normalize to ~60fps
  lastTimestamp = timestamp;
  
  const containerRect = gameContainer.value.getBoundingClientRect();
  
  // Update each monkey
  monkeys.value.forEach(monkey => {
    // Apply gravity
    monkey.velocity.y += GRAVITY * deltaTime;
    
    // Update position with velocity
    monkey.position.x += monkey.velocity.x * deltaTime;
    monkey.position.y += monkey.velocity.y * deltaTime;
    
    // Apply friction to x movement
    monkey.velocity.x *= 0.95;
    
    const monkeySize = monkey.size;
    
    // Floor collision (with elevated floor)
    if (monkey.position.y + monkeySize/2 > containerRect.height - floorHeight) {
      monkey.position.y = containerRect.height - floorHeight - monkeySize/2;
      monkey.velocity.y = -monkey.velocity.y * FLOOR_BOUNCE;
      
      // Only bounce if coming down with some velocity
      if (Math.abs(monkey.velocity.y) < 0.5) {
        monkey.velocity.y = 0;
      }
      
      // Apply horizontal friction when on floor
      monkey.velocity.x *= 0.9;
      
      // Squish on impact
      const impactForce = Math.abs(monkey.velocity.y);
      if (impactForce > 1) {
        monkey.scale = {
          x: 1 + impactForce * 0.04,
          y: 1 - impactForce * 0.04
        };
      }
    }
    
    // Wall collisions
    if (monkey.position.x - monkeySize/2 < 0) {
      monkey.position.x = monkeySize/2;
      monkey.velocity.x = -monkey.velocity.x * FLOOR_BOUNCE;
    } else if (monkey.position.x + monkeySize/2 > containerRect.width) {
      monkey.position.x = containerRect.width - monkeySize/2;
      monkey.velocity.x = -monkey.velocity.x * FLOOR_BOUNCE;
    }
    
    // Recovery to normal shape
    monkey.scale.x += (1 - monkey.scale.x) * SQUISH_RECOVERY * deltaTime;
    monkey.scale.y += (1 - monkey.scale.y) * SQUISH_RECOVERY * deltaTime;
    
    // Recovery to normal rotation
    monkey.rotation += -monkey.rotation * ROTATION_RECOVERY * deltaTime;
  });
  
  animationFrameId = requestAnimationFrame(gameLoop);
};

// Lifecycle hooks
onMounted(() => {
  // Calculate floor height (25% of container height)
  const containerRect = gameContainer.value.getBoundingClientRect();
  floorHeight = containerRect.height * 0.25;
  
  // Add the first monkey
  addMonkey();
  
  // Start the game loop
  animationFrameId = requestAnimationFrame(gameLoop);
  
  // Add window resize handling
  window.addEventListener('resize', updateContainerSize);
});

onUnmounted(() => {
  // Clean up
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', updateContainerSize);
  stopAutoJump(); // Make sure to clear all auto-jump timers
});

// Update container size on window resize
const updateContainerSize = () => {
  const containerRect = gameContainer.value.getBoundingClientRect();
  floorHeight = containerRect.height * 0.25;
  
  // Adjust all monkey positions to stay within boundaries
  monkeys.value.forEach(monkey => {
    if (monkey.position.x < monkey.size/2) monkey.position.x = monkey.size/2;
    if (monkey.position.x > containerRect.width - monkey.size/2) {
      monkey.position.x = containerRect.width - monkey.size/2;
    }
    if (monkey.position.y > containerRect.height - floorHeight - monkey.size/2) {
      monkey.position.y = containerRect.height - floorHeight - monkey.size/2;
    }
  });
};
</script>

<style scoped>
.pou-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
  background-image: linear-gradient(to bottom, #a0d8ef 0%, #d6f0fd 75%);
}

.floor {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 25%;
  background: linear-gradient(to bottom, #8cbe5f, #6a963a);
  border-top: 6px solid #529735;
}

.add-monkey-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 15px;
  background-color: #ff7043;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 100;
}

.add-monkey-btn:hover {
  background-color: #ff9a76;
  transform: scale(1.05);
}

.add-monkey-btn:active {
  transform: scale(0.95);
}

.add-monkey-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.auto-jump-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 100;
}

.auto-jump-btn:hover {
  background-color: #2980b9;
  transform: scale(1.05);
}

.auto-jump-btn:active {
  transform: scale(0.95);
}

.auto-jump-btn.active {
  background-color: #e74c3c;
}

.auto-jump-btn.active:hover {
  background-color: #c0392b;
}

.monkey {
  position: absolute;
  width: 200px;
  height: 200px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  will-change: transform;
  transition: transform 0.05s linear;
  cursor: pointer;
}

.monkey:hover {
  filter: brightness(1.1);
}

.reaction-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.reaction {
  position: absolute;
  opacity: 1;
  user-select: none;
  pointer-events: none;
}

/* Reaction animations */
.float-up-enter-active {
  animation: float-up 1s ease-out forwards;
}

.float-up-leave-active {
  transition: opacity 0.5s;
}

.float-up-leave-to {
  opacity: 0;
}

.spin-up-enter-active {
  animation: spin-up 1s ease-out forwards;
}

.spin-up-leave-active {
  transition: opacity 0.5s;
}

.spin-up-leave-to {
  opacity: 0;
}

.bounce-up-enter-active {
  animation: bounce-up 1s ease-out forwards;
}

.bounce-up-leave-active {
  transition: opacity 0.5s;
}

.bounce-up-leave-to {
  opacity: 0;
}

.fade-up-enter-active {
  animation: fade-up 1s ease-out forwards;
}

.fade-up-leave-active {
  transition: opacity 0.5s;
}

.fade-up-leave-to {
  opacity: 0;
}

@keyframes float-up {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(-80px) scale(1.2);
    opacity: 0;
  }
}

@keyframes spin-up {
  0% {
    transform: translateY(0) scale(0.5) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(-80px) scale(1.2) rotate(360deg);
    opacity: 0;
  }
}

@keyframes bounce-up {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 1;
    transform: translateY(-20px) scale(0.8);
  }
  40% {
    transform: translateY(-40px) scale(1);
  }
  60% {
    transform: translateY(-50px) scale(1.1);
  }
  80% {
    transform: translateY(-60px) scale(1.2);
  }
  100% {
    transform: translateY(-80px) scale(1.3);
    opacity: 0;
  }
}

@keyframes fade-up {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }
  30% {
    opacity: 1;
    transform: translateY(-30px) scale(1);
  }
  70% {
    opacity: 1;
    transform: translateY(-60px) scale(1.2);
  }
  100% {
    transform: translateY(-80px) scale(1.3);
    opacity: 0;
  }
}
</style>