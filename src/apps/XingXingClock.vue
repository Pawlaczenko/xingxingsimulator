<template>
  <div class="clock-container">
    <div class="clock-header">
      <h2>XingXing Clock</h2>
      <div class="mode-selector">
        <button 
          v-for="mode in modes" 
          :key="mode.id"
          :class="{ active: currentMode === mode.id }"
          @click="switchMode(mode.id)"
        >
          {{ mode.name }}
        </button>
      </div>
    </div>

    <!-- Analog Clock Display -->
    <div v-if="currentMode === 'analog'" class="analog-clock-container">
      <div class="analog-clock">
        <!-- Clock Face -->
        <div class="clock-face">
          <!-- Hour markers -->
          <div 
            v-for="n in 12" 
            :key="`hour-${n}`" 
            class="hour-marker"
            :style="{ transform: `rotate(${n * 30}deg) translateY(-110px)` }"
          >
            <img :src="getMonkeyImage(n)" class="hour-monkey" :alt="`Hour ${n}`" />
          </div>
          
          <!-- Clock hands -->
          <div class="hand hour-hand" :style="{ transform: `rotate(${hourRotation}deg)` }">
            <div class="hand-image">
              <img :src="monkeyImages[0]" alt="Hour hand" />
            </div>
          </div>
          <div class="hand minute-hand" :style="{ transform: `rotate(${minuteRotation}deg)` }">
            <div class="hand-image">
              <img :src="monkeyImages[1]" alt="Minute hand" />
            </div>
          </div>
          <div class="hand second-hand" :style="{ transform: `rotate(${secondRotation}deg)` }">
            <div class="hand-image">
              <img :src="monkeyImages[2]" alt="Second hand" />
            </div>
          </div>
          
          <!-- Center piece -->
          <div class="clock-center">
            <img :src="monkeyImages[3]" alt="Clock center" />
          </div>
        </div>
      </div>
    </div>

    <!-- Digital Clock Display -->
    <div v-if="currentMode === 'digital'" class="digital-clock-container">
      <div class="digital-clock">
        <div class="time-display">
          <div class="time-unit hours">
            <img :src="getMonkeyDigit(Math.floor(hours / 10))" class="digit" alt="Hours tens" />
            <img :src="getMonkeyDigit(hours % 10)" class="digit" alt="Hours ones" />
          </div>
          <div class="time-separator">
            <div :class="['dots', { 'blink': seconds % 2 === 0 }]">:</div>
          </div>
          <div class="time-unit minutes">
            <img :src="getMonkeyDigit(Math.floor(minutes / 10))" class="digit" alt="Minutes tens" />
            <img :src="getMonkeyDigit(minutes % 10)" class="digit" alt="Minutes ones" />
          </div>
          <div class="time-separator">
            <div :class="['dots', { 'blink': seconds % 2 === 0 }]">:</div>
          </div>
          <div class="time-unit seconds">
            <img :src="getMonkeyDigit(Math.floor(seconds / 10))" class="digit" alt="Seconds tens" />
            <img :src="getMonkeyDigit(seconds % 10)" class="digit" alt="Seconds ones" />
          </div>
        </div>
        <div class="date-display">
          {{ currentDate }}
        </div>
      </div>
    </div>

    <!-- Timer Mode -->
    <div v-if="currentMode === 'timer'" class="timer-container">
      <div class="timer-display">
        <div class="timer-time">
          <div class="timer-unit">
            <input 
              type="number" 
              v-model.number="timerHours" 
              min="0" 
              max="23"
              :disabled="timerRunning" 
              class="timer-input"
            />
            <label>Hours</label>
          </div>
          <div class="timer-separator">:</div>
          <div class="timer-unit">
            <input 
              type="number" 
              v-model.number="timerMinutes" 
              min="0" 
              max="59" 
              :disabled="timerRunning"
              class="timer-input"
            />
            <label>Minutes</label>
          </div>
          <div class="timer-separator">:</div>
          <div class="timer-unit">
            <input 
              type="number" 
              v-model.number="timerSeconds" 
              min="0" 
              max="59" 
              :disabled="timerRunning"
              class="timer-input"
            />
            <label>Seconds</label>
          </div>
        </div>
        
        <div class="timer-progress-container">
          <div class="timer-progress" :style="{ width: timerProgressPercent + '%' }"></div>
          <div v-if="timerRunning" class="timer-monkey" :style="{ left: timerProgressPercent + '%' }">
            <img :src="getRandomMonkeyImage()" alt="Timer monkey" />
          </div>
        </div>

        <div class="timer-controls">
          <button 
            v-if="!timerRunning && !timerCompleted" 
            @click="startTimer" 
            class="control-button start-button"
          >
            Start
          </button>
          <button 
            v-if="timerRunning" 
            @click="pauseTimer" 
            class="control-button pause-button"
          >
            Pause
          </button>
          <button 
            v-if="timerRunning || timerCompleted || timerPaused" 
            @click="resetTimer" 
            class="control-button reset-button"
          >
            Reset
          </button>
        </div>
      </div>

      <div v-if="timerCompleted" class="timer-complete">
        <h3>Time's Up!</h3>
        <div class="celebrating-monkeys">
          <img 
            v-for="i in 5" 
            :key="i" 
            :src="getRandomMonkeyImage()" 
            :class="`celebrating-monkey cm-${i}`"
            alt="Celebrating monkey" 
          />
        </div>
        <button @click="stopAlarm" class="stop-button">Stop Alarm</button>
      </div>
    </div>

    <!-- Alarm Mode -->
    <div v-if="currentMode === 'alarm'" class="alarm-container">
      <div class="alarms-list">
        <div v-for="(alarm, index) in alarms" :key="index" class="alarm-item">
          <div class="alarm-time">{{ formatAlarmTime(alarm) }}</div>
          <div class="alarm-days">
            <span 
              v-for="(day, dayIndex) in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" 
              :key="dayIndex"
              :class="{ active: alarm.days[dayIndex] }"
            >
              {{ day }}
            </span>
          </div>
          <div class="alarm-label">{{ alarm.label }}</div>
          <div class="alarm-controls">
            <label class="switch">
              <input type="checkbox" v-model="alarm.active">
              <span class="slider round"></span>
            </label>
            <button @click="removeAlarm(index)" class="remove-alarm">×</button>
          </div>
        </div>

        <div v-if="alarms.length === 0" class="no-alarms">
          No alarms set
        </div>
      </div>

      <div class="add-alarm" v-if="!showAlarmForm">
        <button @click="showAlarmForm = true" class="add-alarm-button">+ Add Alarm</button>
      </div>

      <div v-if="showAlarmForm" class="alarm-form">
        <div class="alarm-time-input">
          <div class="time-field">
            <input type="number" v-model.number="newAlarm.hour" min="0" max="23" class="alarm-input" />
            <label>Hour</label>
          </div>
          <div class="time-field">
            <input type="number" v-model.number="newAlarm.minute" min="0" max="59" class="alarm-input" />
            <label>Min</label>
          </div>
        </div>

        <div class="alarm-days-selector">
          <button 
            v-for="(day, index) in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
            :key="index"
            :class="{ active: newAlarm.days[index] }"
            @click="toggleAlarmDay(index)"
            class="day-button"
          >
            {{ day.substring(0, 1) }}
          </button>
        </div>

        <div class="alarm-label-input">
          <input type="text" v-model="newAlarm.label" placeholder="Alarm label" class="label-input" />
        </div>

        <div class="alarm-form-controls">
          <button @click="saveAlarm" class="save-alarm">Save</button>
          <button @click="cancelAlarmForm" class="cancel-alarm">Cancel</button>
        </div>
      </div>

      <div v-if="alarmRinging" class="alarm-ringing">
        <h3>{{ activeAlarm.label || 'Alarm' }}</h3>
        <div class="ringing-animation">
          <img 
            v-for="i in 5" 
            :key="`ring-${i}`" 
            :src="getRandomMonkeyImage()" 
            :class="`ringing-monkey rm-${i}`" 
            alt="Ringing monkey" 
          />
        </div>
        <button @click="stopAlarm" class="stop-button">Stop Alarm</button>
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

// Available app modes
const modes = [
  { id: 'analog', name: 'Analog Clock' },
  { id: 'digital', name: 'Digital Clock' },
  { id: 'timer', name: 'Timer' },
  { id: 'alarm', name: 'Alarm' }
];

// Store monkey images in an array
const monkeyImages = [
  monkey1, monkey2, monkey3, monkey4, monkey5, monkey6, monkey7,
  monkey8, monkey9, monkey10, monkey11, monkey12, monkey13, monkey14
];

// App state
const currentMode = ref('analog');

// Clock state
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
const currentDate = ref('');

// Timer state
const timerHours = ref(0);
const timerMinutes = ref(5);  // Default to 5 minutes
const timerSeconds = ref(0);
const timerRunning = ref(false);
const timerPaused = ref(false);
const timerCompleted = ref(false);
const totalTimerSeconds = ref(0);
const remainingTimerSeconds = ref(0);
const timerStartTime = ref(0);
const timerEndTime = ref(0);
const timerInterval = ref(null);

// Alarm state
const alarms = ref([]);
const showAlarmForm = ref(false);
const newAlarm = ref({
  hour: new Date().getHours(),
  minute: new Date().getMinutes(),
  days: [false, false, false, false, false, false, false],
  label: '',
  active: true
});

const alarmRinging = ref(false);
const activeAlarm = ref(null);
const alarmAudio = ref(null);

// Audio context for alarm/timer sounds
let audioContext = null;
let oscillator = null;

// Computed properties for clock hand rotations
const hourRotation = computed(() => {
  return 30 * hours.value + minutes.value / 2;
});

const minuteRotation = computed(() => {
  return 6 * minutes.value + seconds.value / 10;
});

const secondRotation = computed(() => {
  return 6 * seconds.value;
});

// Timer progress percentage
const timerProgressPercent = computed(() => {
  if (totalTimerSeconds.value === 0) return 0;
  
  return (1 - (remainingTimerSeconds.value / totalTimerSeconds.value)) * 100;
});

// Methods
const switchMode = (mode) => {
  currentMode.value = mode;
  
  // Stop timers or alarms if switching away from them
  if (mode !== 'timer' && timerRunning.value) {
    pauseTimer();
  }
  
  if (mode !== 'alarm' && alarmRinging.value) {
    stopAlarm();
  }
};

const updateTime = () => {
  const now = new Date();
  hours.value = now.getHours() % 12 || 12; // Convert to 12-hour format
  minutes.value = now.getMinutes();
  seconds.value = now.getSeconds();
  
  // Update date display
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDate.value = now.toLocaleDateString(undefined, options);
  
  // Check for alarms
  checkAlarms();
};

// Get monkey image for hour marker
const getMonkeyImage = (hour) => {
  // Use a different monkey for each hour position
  const index = (hour - 1) % monkeyImages.length;
  return monkeyImages[index];
};

// Get random monkey image
const getRandomMonkeyImage = () => {
  const randomIndex = Math.floor(Math.random() * monkeyImages.length);
  return monkeyImages[randomIndex];
};

// Get monkey image for specific digit (0-9)
const getMonkeyDigit = (digit) => {
  // Map each digit to a specific monkey (cycling through if needed)
  return monkeyImages[digit % monkeyImages.length];
};

// Timer functions
const startTimer = () => {
  if (timerRunning.value) return;
  
  // Calculate total seconds for timer
  const hours = timerHours.value || 0;
  const minutes = timerMinutes.value || 0;
  const seconds = timerSeconds.value || 0;
  
  totalTimerSeconds.value = hours * 3600 + minutes * 60 + seconds;
  
  if (totalTimerSeconds.value <= 0) {
    // Don't start if no time is set
    return;
  }
  
  // If timer was paused, resume from where we left off
  if (timerPaused.value) {
    timerPaused.value = false;
  } else {
    remainingTimerSeconds.value = totalTimerSeconds.value;
  }
  
  timerRunning.value = true;
  timerCompleted.value = false;
  
  timerStartTime.value = Date.now();
  timerEndTime.value = timerStartTime.value + (remainingTimerSeconds.value * 1000);
  
  // Start the timer interval
  timerInterval.value = setInterval(updateTimer, 100); // Update more frequently for smoother progress
};

const updateTimer = () => {
  if (!timerRunning.value) return;
  
  const now = Date.now();
  
  // Calculate remaining time
  const remaining = Math.max(0, Math.floor((timerEndTime.value - now) / 1000));
  remainingTimerSeconds.value = remaining;
  
  // Update timer display values
  timerHours.value = Math.floor(remaining / 3600);
  timerMinutes.value = Math.floor((remaining % 3600) / 60);
  timerSeconds.value = remaining % 60;
  
  // Check if timer is complete
  if (remaining <= 0) {
    timerCompleted.value = true;
    timerRunning.value = false;
    clearInterval(timerInterval.value);
    playAlarmSound();
  }
};

const pauseTimer = () => {
  if (!timerRunning.value) return;
  
  timerRunning.value = false;
  timerPaused.value = true;
  clearInterval(timerInterval.value);
};

const resetTimer = () => {
  clearInterval(timerInterval.value);
  timerRunning.value = false;
  timerPaused.value = false;
  timerCompleted.value = false;
  timerHours.value = 0;
  timerMinutes.value = 5;
  timerSeconds.value = 0;
  totalTimerSeconds.value = 0;
  remainingTimerSeconds.value = 0;
  stopAlarm();
};

// Alarm functions
const toggleAlarmDay = (dayIndex) => {
  newAlarm.value.days[dayIndex] = !newAlarm.value.days[dayIndex];
};

const saveAlarm = () => {
  // Create a new alarm object
  const alarm = {
    hour: newAlarm.value.hour,
    minute: newAlarm.value.minute,
    days: [...newAlarm.value.days],
    label: newAlarm.value.label,
    active: true
  };
  
  // Add to alarms array
  alarms.value.push(alarm);
  
  // Store in localStorage
  saveAlarmsToStorage();
  
  // Reset form
  cancelAlarmForm();
};

const cancelAlarmForm = () => {
  showAlarmForm.value = false;
  newAlarm.value = {
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
    days: [false, false, false, false, false, false, false],
    label: '',
    active: true
  };
};

const removeAlarm = (index) => {
  alarms.value.splice(index, 1);
  saveAlarmsToStorage();
};

const formatAlarmTime = (alarm) => {
  const hour = alarm.hour;
  const minute = alarm.minute;
  
  // Format as 12-hour time with AM/PM
  let displayHour = hour % 12;
  if (displayHour === 0) displayHour = 12;
  
  const ampm = hour < 12 ? 'AM' : 'PM';
  
  // Format the time string
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

const checkAlarms = () => {
  if (alarmRinging.value) return; // Don't check if an alarm is already ringing
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay(); // 0 is Sunday
  
  // Check each alarm
  for (const alarm of alarms.value) {
    if (!alarm.active) continue;
    
    // Check if the alarm should ring for this day of week
    if (!alarm.days[currentDay]) continue;
    
    // Check if time matches (and seconds are 0, so alarm only triggers once)
    if (alarm.hour === currentHour && alarm.minute === currentMinute && now.getSeconds() === 0) {
      // Trigger alarm
      triggerAlarm(alarm);
      break;
    }
  }
};

const triggerAlarm = (alarm) => {
  activeAlarm.value = alarm;
  alarmRinging.value = true;
  playAlarmSound();
  
  // Switch to alarm screen if not already there
  if (currentMode.value !== 'alarm') {
    currentMode.value = 'alarm';
  }
};

const playAlarmSound = () => {
  try {
    // Create audio context if it doesn't exist
    if (!audioContext) {
      // Use Web Audio API for better sound generation
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Stop any existing sound
    if (oscillator) {
      oscillator.stop();
    }
    
    // Create oscillator for alarm sound
    oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configure sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Half volume
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Play sound
    oscillator.start();
    
    // Create alarm pattern - alternating between two frequencies
    setInterval(() => {
      oscillator.frequency.setValueAtTime(
        oscillator.frequency.value === 440 ? 880 : 440, 
        audioContext.currentTime
      );
    }, 500);
  } catch (error) {
    console.error('Error playing alarm sound:', error);
    
    // Fallback to simple audio element if Web Audio API fails
    if (!alarmAudio.value) {
      alarmAudio.value = new Audio();
      alarmAudio.value.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBhMxgdHqvHQpDRIqWIjOz6FLHxMdMlqSy8OaVi4nLDU4dPr9/Lx9RyAFBTpowPLktFca8c7Ng1QOCzq9soHpYSQPZec1rfP/+tCmeHDmNG/hm0QXJZOqm9NqCC7c/fvouHNUP/DiOJjI2q5aTLIfXP/qJpOHnpOsu9iFM8/r4/3sfqu/xMrM2fDu+fz8AwoXISYxOUM4KhMB6s7Hvr7F0uDj7vHz+/4FEh8rOElbYlxPPikTAsLW7BSJo52RjIJ6dHVydnp9g4mQmJ+krbK0tsC+vMbQ1tri5Obr5eLh4uXm6Onm7ejk6erm7vP28/r9/v38/Pz8+/v7+vr7+vr7+vv8/P3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+//7//v/+/v///v7//v/+//7//v/+//7//v/+//7//v///v////7//v////7//v////////////////////////////////7//v/+//79/vz+/f7+/v////7//v/+//7//f78/fv9/P37/fv9+/37/fv9+/78/v3+/v//////;base64,';
      alarmAudio.value.loop = true;
    }
    alarmAudio.value.play();
  }
};

const stopAlarm = () => {
  alarmRinging.value = false;
  timerCompleted.value = false;
  
  // Stop the sound
  if (oscillator) {
    oscillator.stop();
    oscillator = null;
  }
  
  if (alarmAudio.value) {
    alarmAudio.value.pause();
    alarmAudio.value.currentTime = 0;
  }
};

// localStorage functions for alarms
const saveAlarmsToStorage = () => {
  localStorage.setItem('xingxingAlarms', JSON.stringify(alarms.value));
};

const loadAlarmsFromStorage = () => {
  const storedAlarms = localStorage.getItem('xingxingAlarms');
  if (storedAlarms) {
    alarms.value = JSON.parse(storedAlarms);
  }
};

// Lifecycle hooks
onMounted(() => {
  // Initialize clock
  updateTime();
  const clockInterval = setInterval(updateTime, 1000);
  
  // Load alarms from localStorage
  loadAlarmsFromStorage();
  
  // Cleanup on component unmount
  onUnmounted(() => {
    clearInterval(clockInterval);
    
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
    }
    
    if (oscillator) {
      oscillator.stop();
    }
    
    if (alarmAudio.value) {
      alarmAudio.value.pause();
    }
  });
});
</script>

<style scoped>
.clock-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #2c3e50, #4ca1af);
  padding: 20px;
  box-sizing: border-box;
  overflow: auto;
  color: white;
}

.clock-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.clock-header h2 {
  margin: 0 0 20px 0;
  font-size: 2rem;
}

.mode-selector {
  display: flex;
  gap: 10px;
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 10px;
}

.mode-selector button {
  background: none;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.mode-selector button.active {
  background: rgba(255, 255, 255, 0.2);
  opacity: 1;
}

.mode-selector button:hover {
  opacity: 1;
  transform: translateY(-2px);
}

/* Analog Clock Styles */
.analog-clock-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.analog-clock {
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2),
              inset 0 0 30px rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.clock-face {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hour-marker {
  position: absolute;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center;
}

.hour-monkey {
  width: 30px;
  height: 30px;
  object-fit: contain;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
}

.hand {
  position: absolute;
  transform-origin: bottom center;
  bottom: 50%;
  left: 50%;
  width: 4px;
  height: 50%;
  display: flex;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44);
}

.hour-hand {
  height: 30%;
  z-index: 2;
}

.minute-hand {
  height: 40%;
  z-index: 3;
}

.second-hand {
  height: 45%;
  z-index: 4;
}

.hand-image {
  position: absolute;
  top: 0;
  width: 30px;
  height: 30px;
  transform: translateY(-50%) translateX(-50%);
}

.hand-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.clock-center {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.clock-center img {
  width: 80%;
  height: 80%;
  object-fit: contain;
}

/* Digital Clock Styles */
.digital-clock-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.digital-clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.time-display {
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.time-unit {
  display: flex;
  gap: 10px;
}

.digit {
  width: 60px;
  height: 80px;
  object-fit: contain;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.time-separator {
  padding: 0 10px;
  font-size: 3rem;
  font-weight: bold;
}

.dots.blink {
  opacity: 0.5;
}

.date-display {
  font-size: 1.2rem;
  text-align: center;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

/* Timer Styles */
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 30px;
}

.timer-display {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.timer-time {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.timer-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.timer-input {
  width: 80px;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 2.5rem;
  text-align: center;
  padding: 10px;
}

.timer-input:disabled {
  background-color: rgba(255, 255, 255, 0.1);
}

.timer-separator {
  font-size: 2.5rem;
  font-weight: bold;
  margin-top: -10px;
}

.timer-progress-container {
  height: 20px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.timer-progress {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 10px;
  transition: width 0.2s linear;
}

.timer-monkey {
  position: absolute;
  top: -15px;
  transform: translateX(-50%);
  transition: left 0.2s linear;
}

.timer-monkey img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.control-button {
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.start-button {
  background-color: #4CAF50;
  color: white;
}

.pause-button {
  background-color: #FFC107;
  color: white;
}

.reset-button {
  background-color: #F44336;
  color: white;
}

.control-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.control-button:active {
  transform: translateY(0);
}

.timer-complete {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 100;
  animation: fadeIn 0.5s;
}

.timer-complete h3 {
  font-size: 3rem;
  margin-bottom: 30px;
  color: #FFC107;
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}

.celebrating-monkeys {
  position: relative;
  width: 300px;
  height: 200px;
  margin-bottom: 30px;
}

.celebrating-monkey {
  position: absolute;
  width: 80px;
  height: 80px;
  object-fit: contain;
  animation: bounce 1s infinite alternate;
}

.cm-1 {
  left: 10%;
  top: 20%;
  animation-delay: 0s;
}

.cm-2 {
  left: 40%;
  top: 0;
  animation-delay: 0.2s;
}

.cm-3 {
  right: 10%;
  top: 20%;
  animation-delay: 0.4s;
}

.cm-4 {
  left: 25%;
  bottom: 0;
  animation-delay: 0.6s;
}

.cm-5 {
  right: 25%;
  bottom: 0;
  animation-delay: 0.8s;
}

.stop-button {
  padding: 15px 30px;
  background-color: #F44336;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.stop-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Alarm Styles */
.alarm-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  gap: 20px;
}

.alarms-list {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.alarm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.alarm-item:last-child {
  border-bottom: none;
}

.alarm-time {
  font-size: 1.5rem;
  font-weight: bold;
}

.alarm-days {
  display: flex;
  gap: 5px;
}

.alarm-days span {
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
}

.alarm-days span.active {
  background-color: #4CAF50;
  color: white;
}

.alarm-label {
  font-size: 0.9rem;
  opacity: 0.8;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alarm-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 45px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(21px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.remove-alarm {
  background-color: rgba(244, 67, 54, 0.2);
  color: #F44336;
  border: none;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
}

.remove-alarm:hover {
  background-color: #F44336;
  color: white;
}

.no-alarms {
  padding: 20px;
  text-align: center;
  opacity: 0.7;
}

.add-alarm {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 15px;
}

.add-alarm-button {
  padding: 12px 25px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-alarm-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.alarm-form {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.alarm-time-input {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.time-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.alarm-input {
  width: 80px;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 2rem;
  text-align: center;
}

.alarm-days-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.day-button {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.day-button.active {
  background-color: #4CAF50;
}

.alarm-label-input {
  width: 100%;
}

.label-input {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
}

.alarm-form-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.save-alarm {
  padding: 12px 25px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-alarm {
  padding: 12px 25px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.save-alarm:hover, .cancel-alarm:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.alarm-ringing {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 100;
  animation: fadeIn 0.5s;
}

.alarm-ringing h3 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #FFC107;
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
}

.ringing-animation {
  position: relative;
  width: 300px;
  height: 200px;
  margin-bottom: 30px;
}

.ringing-monkey {
  position: absolute;
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.rm-1 {
  left: 10%;
  top: 20%;
  animation: shake 0.5s infinite;
}

.rm-2 {
  left: 40%;
  top: 0;
  animation: shake 0.5s infinite 0.1s;
}

.rm-3 {
  right: 10%;
  top: 20%;
  animation: shake 0.5s infinite 0.2s;
}

.rm-4 {
  left: 25%;
  bottom: 0;
  animation: shake 0.5s infinite 0.15s;
}

.rm-5 {
  right: 25%;
  bottom: 0;
  animation: shake 0.5s infinite 0.25s;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-15px); }
}

@keyframes shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-10deg); }
  100% { transform: rotate(0deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .mode-selector {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .analog-clock {
    width: 250px;
    height: 250px;
  }
  
  .hour-monkey {
    width: 20px;
    height: 20px;
  }
  
  .time-display {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .digit {
    width: 40px;
    height: 60px;
  }
  
  .timer-time {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .timer-input {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
  
  .alarm-time-input {
    flex-wrap: wrap;
  }
  
  .alarm-days-selector {
    flex-wrap: wrap;
  }
}
</style>