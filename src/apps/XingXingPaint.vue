<template>
  <div class="paint-container">
    <div class="sidebar">
      <div class="tool-section">
        <h3>Background</h3>
        <div class="background-selector">
          <div 
            v-for="(bg, index) in backgrounds" 
            :key="'bg-' + index" 
            class="background-thumbnail"
            :class="{ active: selectedBackground === bg.src }"
            :style="{ backgroundImage: `url(${bg.src})` }"
            @click="selectedBackground = bg.src"
            :title="bg.name"
          ></div>
        </div>
      </div>
      
      <div class="tool-section">
        <h3>Monkeys</h3>
        <div class="monkey-selector">
          <div 
            v-for="i in 14" 
            :key="'monkey-' + i" 
            class="monkey-thumbnail"
            :class="{ active: selectedMonkey === monkeyImages[i-1] }"
            :style="{ backgroundImage: `url(${monkeyImages[i-1]})` }"
            @click="selectTool('monkey', monkeyImages[i-1])"
            :title="`Monkey ${i}`"
          ></div>
        </div>
      </div>
      
      <div class="tool-section">
        <h3>Monkey Size: {{ monkeySize }}</h3>
        <input 
          type="range" 
          min="30" 
          max="300" 
          v-model.number="monkeySize" 
          class="size-slider"
        />
      </div>
      
      <div class="tool-section">
        <h3>Speech Bubbles</h3>
        <div class="bubble-selector">
          <div 
            v-for="(bubble, index) in speechBubbles" 
            :key="'bubble-' + index" 
            class="bubble-thumbnail"
            :class="{ active: selectedTool === 'bubble' && selectedBubbleType === bubble.type }"
            @click="selectTool('bubble', bubble.type)"
          >
            <div :class="`bubble-preview ${bubble.type}`"></div>
          </div>
        </div>
        
        <div v-if="selectedTool === 'bubble'" class="bubble-text-input">
          <input 
            type="text" 
            v-model="bubbleText" 
            placeholder="Enter text..."
            class="text-input"
          />
          <div class="bubble-size">
            <span>Size: {{ bubbleSize }}</span>
            <input 
              type="range" 
              min="80" 
              max="300" 
              v-model.number="bubbleSize" 
              class="size-slider"
            />
          </div>
        </div>
      </div>
      
      <button class="export-btn" @click="exportImage">
        Export as JPG
      </button>
      
      <button class="clear-btn" @click="clearCanvas">
        Clear Canvas
      </button>
    </div>
    
    <div class="canvas-container">
      <div 
        ref="canvas" 
        class="canvas"
        :style="canvasStyle"
        @click="handleCanvasClick"
      >
        <div 
          v-for="(monkey, index) in placedMonkeys" 
          :key="'placed-' + index" 
          class="placed-monkey"
          :style="{ 
            left: monkey.x + 'px', 
            top: monkey.y + 'px', 
            width: monkey.size + 'px', 
            height: monkey.size + 'px',
            backgroundImage: `url(${monkey.image})`
          }"
        ></div>
        
        <div
          v-for="(bubble, index) in placedBubbles"
          :key="'bubble-' + index"
          class="speech-bubble"
          :class="bubble.type"
          :style="{
            left: bubble.x + 'px',
            top: bubble.y + 'px',
            width: bubble.size + 'px',
            minHeight: bubble.size / 2 + 'px'
          }"
        >
          {{ bubble.text }}
          <button 
            class="delete-bubble" 
            @click.stop="deleteBubble(index)"
            title="Delete bubble"
          >×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import html2canvas from 'html2canvas';

// Import all monkey images
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

// Import backgrounds
import jungleImg from '../assets/jungle.jpg';
import kopernikImg from '../assets/kopernik.jpg';
import restaurantImg from '../assets/restaurant.png';
import swampImg from '../assets/swamp.jpg';
import szczecinImg from '../assets/szczecin.jpg';
import templeImg from '../assets/temple.jpeg';

// References
const canvas = ref(null);

// Data
const monkeyImages = [
  monkey1, monkey2, monkey3, monkey4, monkey5, monkey6, monkey7,
  monkey8, monkey9, monkey10, monkey11, monkey12, monkey13, monkey14
];

const backgrounds = [
  { name: 'Jungle', src: jungleImg },
  { name: 'Kopernik', src: kopernikImg },
  { name: 'Restaurant', src: restaurantImg },
  { name: 'Swamp', src: swampImg },
  { name: 'Szczecin', src: szczecinImg },
  { name: 'Temple', src: templeImg }
];

const speechBubbles = [
  { type: 'speech-right', name: 'Speech Right' },
  { type: 'speech-left', name: 'Speech Left' },
  { type: 'thought', name: 'Thought' },
  { type: 'shout', name: 'Shout' },
  { type: 'round', name: 'Round' }
];

const selectedBackground = ref(jungleImg);
const selectedMonkey = ref(monkey1);
const monkeySize = ref(100);
const placedMonkeys = ref([]);
const placedBubbles = ref([]);
const selectedTool = ref('monkey');
const selectedBubbleType = ref('speech-right');
const bubbleText = ref('Hello!');
const bubbleSize = ref(150);

// Computed properties
const canvasStyle = computed(() => {
  return {
    backgroundImage: `url(${selectedBackground.value})`
  };
});

// Methods
const selectTool = (tool, value) => {
  selectedTool.value = tool;
  if (tool === 'monkey') {
    selectedMonkey.value = value;
  } else if (tool === 'bubble') {
    selectedBubbleType.value = value;
  }
};

const handleCanvasClick = (e) => {
  // Only handle clicks directly on the canvas (not on placed elements)
  if (e.target !== canvas.value) return;
  
  const rect = e.target.getBoundingClientRect();
  
  if (selectedTool.value === 'monkey') {
    addMonkey(e, rect);
  } else if (selectedTool.value === 'bubble') {
    addBubble(e, rect);
  }
};

const addMonkey = (e, rect) => {
  if (!selectedMonkey.value) return;

  const x = e.clientX - rect.left - (monkeySize.value / 2);
  const y = e.clientY - rect.top - (monkeySize.value / 2);
  
  placedMonkeys.value.push({
    image: selectedMonkey.value,
    x,
    y,
    size: monkeySize.value
  });
};

const addBubble = (e, rect) => {
  if (!selectedBubbleType.value) return;
  
  const x = e.clientX - rect.left - (bubbleSize.value / 2);
  const y = e.clientY - rect.top - (bubbleSize.value / 4);
  
  placedBubbles.value.push({
    type: selectedBubbleType.value,
    text: bubbleText.value || 'Hello!',
    x,
    y,
    size: bubbleSize.value
  });
};

const deleteBubble = (index) => {
  placedBubbles.value.splice(index, 1);
};

const exportImage = async () => {
  try {
    // Temporarily hide delete buttons for export
    const deleteButtons = document.querySelectorAll('.delete-bubble');
    deleteButtons.forEach(btn => btn.style.display = 'none');
    
    const canvasElement = canvas.value;
    const result = await html2canvas(canvasElement, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    });
    
    // Restore delete buttons
    deleteButtons.forEach(btn => btn.style.display = 'block');
    
    // Convert to image and download
    const link = document.createElement('a');
    link.download = `xingxing-masterpiece-${new Date().getTime()}.jpg`;
    link.href = result.toDataURL('image/jpeg', 0.9);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting image:', error);
    alert('There was an error exporting your image. Please try again.');
  }
};

const clearCanvas = () => {
  if (confirm('Are you sure you want to clear the canvas?')) {
    placedMonkeys.value = [];
    placedBubbles.value = [];
  }
};

// Life cycle hooks
onMounted(async () => {
  // Dynamically import html2canvas (will be imported at runtime)
  await import('html2canvas');
});
</script>

<style scoped>
.paint-container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
}

.tool-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-section h3 {
  margin: 0;
  font-size: 18px;
  border-bottom: 1px solid #4a637a;
  padding-bottom: 5px;
}

.background-selector,
.monkey-selector,
.bubble-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.background-thumbnail,
.monkey-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  background-color: #3a506b;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.background-thumbnail:hover,
.monkey-thumbnail:hover {
  transform: scale(1.05);
}

.background-thumbnail.active,
.monkey-thumbnail.active {
  border-color: #ffab00;
  box-shadow: 0 0 10px rgba(255, 171, 0, 0.5);
}

.bubble-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  background-color: #3a506b;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.bubble-thumbnail:hover {
  transform: scale(1.05);
}

.bubble-thumbnail.active {
  border-color: #ffab00;
  box-shadow: 0 0 10px rgba(255, 171, 0, 0.5);
}

.bubble-preview {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
  position: relative;
}

.bubble-preview.speech-right::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: -5px;
  width: 15px;
  height: 15px;
  background: white;
  clip-path: polygon(0 0, 100% 100%, 0 100%);
}

.bubble-preview.speech-left::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -5px;
  width: 15px;
  height: 15px;
  background: white;
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}

.bubble-preview.thought {
  border-radius: 50%;
  background: white;
}

.bubble-preview.thought::after {
  content: '';
  position: absolute;
  bottom: -10px;
  right: 10px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
}

.bubble-preview.thought::before {
  content: '';
  position: absolute;
  bottom: -18px;
  right: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
}

.bubble-preview.shout {
  border-radius: 5px;
  background: white;
  clip-path: polygon(
    0% 0%, 100% 0%, 95% 30%, 100% 50%, 
    95% 70%, 100% 100%, 0% 100%, 5% 70%, 
    0% 50%, 5% 30%
  );
}

.bubble-preview.round {
  border-radius: 50%;
}

.bubble-text-input {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.text-input {
  padding: 8px;
  border: none;
  border-radius: 4px;
  width: 100%;
  background: #3a506b;
  color: white;
}

.bubble-size {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.size-slider {
  width: 100%;
  cursor: pointer;
}

.export-btn,
.clear-btn {
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn {
  background-color: #4CAF50;
  color: white;
}

.export-btn:hover {
  background-color: #3e8e41;
}

.clear-btn {
  background-color: #f44336;
  color: white;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

.canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a1a1a;
  padding: 20px;
  overflow: auto;
}

.canvas {
  width: 800px;
  height: 600px;
  background-size: cover;
  background-position: center;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.placed-monkey {
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  pointer-events: none;
}

.speech-bubble {
  position: absolute;
  background-color: white;
  border-radius: 20px;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  font-size: 16px;
  text-align: center;
  word-break: break-word;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: move;
  user-select: none;
}

.speech-bubble.speech-right {
  border-radius: 20px;
  position: relative;
}

.speech-bubble.speech-right::after {
  content: '';
  position: absolute;
  bottom: 10px;
  right: -15px;
  width: 30px;
  height: 30px;
  background: white;
  clip-path: polygon(0 0, 0 100%, 100% 50%);
}

.speech-bubble.speech-left {
  border-radius: 20px;
  position: relative;
}

.speech-bubble.speech-left::after {
  content: '';
  position: absolute;
  bottom: 10px;
  left: -15px;
  width: 30px;
  height: 30px;
  background: white;
  clip-path: polygon(100% 0, 0 50%, 100% 100%);
}

.speech-bubble.thought {
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  position: relative;
}

.speech-bubble.thought::after {
  content: '';
  position: absolute;
  bottom: -20px;
  right: 20px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
}

.speech-bubble.thought::before {
  content: '';
  position: absolute;
  bottom: -35px;
  right: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
}

.speech-bubble.shout {
  border-radius: 5px;
  background: white;
  clip-path: polygon(
    0% 0%, 100% 0%, 95% 30%, 100% 50%, 
    95% 70%, 100% 100%, 0% 100%, 5% 70%, 
    0% 50%, 5% 30%
  );
  font-weight: bold;
  text-transform: uppercase;
}

.speech-bubble.round {
  border-radius: 50%;
}

.delete-bubble {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  z-index: 10;
}

.speech-bubble.shout .delete-bubble {
  top: 5px;
  right: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
  .paint-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    max-height: 30%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .tool-section {
    width: 48%;
  }
  
  .canvas-container {
    padding: 10px;
  }
  
  .canvas {
    width: 100%;
    height: auto;
    aspect-ratio: 4/3;
  }
}
</style>