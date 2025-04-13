<template>
  <div class="weather-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-monkey">
        <img :src="randomMonkeyImage" alt="Loading..." class="spinning-monkey" />
      </div>
      <p>{{ loadingMessage }}</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="sad-monkey">
        <img :src="monkey5" alt="Error" />
      </div>
      <h2>Oops! Something went wrong</h2>
      <p>{{ error }}</p>
      <button @click="getWeatherData" class="retry-button">Try Again</button>
    </div>
    
    <!-- Weather display -->
    <div v-else class="weather-display">
      <div class="location-container">
        <h1>{{ weatherData.name }}, {{ weatherData.sys.country }}</h1>
        <p class="date-time">{{ currentDateTime }}</p>
      </div>
      
      <div class="weather-main">
        <div class="temperature-container">
          <div class="temperature">
            {{ Math.round(weatherData.main.temp) }}°C
          </div>
          <div class="feels-like">
            Feels like {{ Math.round(weatherData.main.feels_like) }}°C
          </div>
        </div>
        
        <div class="weather-icon">
          <img 
            :src="`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`" 
            :alt="weatherData.weather[0].description" 
          />
          <p>{{ weatherData.weather[0].description }}</p>
        </div>
      </div>
      
      <div class="xingxing-reaction">
        <div class="monkey-scene" :class="weatherCondition">
          <img :src="monkeyImage" alt="XingXing" class="monkey" />
          <div v-if="weatherCondition === 'rain'" class="rain"></div>
          <div v-if="weatherCondition === 'snow'" class="snow"></div>
          <div v-if="weatherCondition === 'sunny'" class="sun"></div>
          <div v-if="weatherCondition === 'cloudy'" class="clouds"></div>
          <div v-if="weatherCondition === 'thunderstorm'" class="lightning"></div>
        </div>
        <p class="monkey-message">{{ monkeyMessage }}</p>
      </div>
      
      <div class="weather-details">
        <div class="detail-item">
          <div class="detail-icon">💨</div>
          <div class="detail-value">{{ weatherData.wind.speed }} m/s</div>
          <div class="detail-label">Wind</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">💧</div>
          <div class="detail-value">{{ weatherData.main.humidity }}%</div>
          <div class="detail-label">Humidity</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">👁️</div>
          <div class="detail-value">{{ weatherData.visibility / 1000 }} km</div>
          <div class="detail-label">Visibility</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">🌡️</div>
          <div class="detail-value">{{ weatherData.main.pressure }} hPa</div>
          <div class="detail-label">Pressure</div>
        </div>
      </div>
      
      <div class="forecast-container" v-if="forecastData && forecastData.list">
        <h2>5-Day Forecast</h2>
        <div class="forecast-items">
          <div 
            v-for="(item, index) in forecastItems" 
            :key="index" 
            class="forecast-item"
          >
            <div class="forecast-day">{{ item.day }}</div>
            <img 
              :src="`https://openweathermap.org/img/wn/${item.icon}.png`" 
              :alt="item.description" 
            />
            <div class="forecast-temp">
              <span class="max">{{ Math.round(item.maxTemp) }}°</span>
              <span class="min">{{ Math.round(item.minTemp) }}°</span>
            </div>
          </div>
        </div>
      </div>
      
      <button @click="getWeatherData" class="refresh-button">
        🔄 Refresh
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

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

export default {
  name: 'XingXingWeather',
  
  setup() {
    // API key for OpenWeatherMap - in a real app, this would be in an environment variable
    const API_KEY = '7c2703de364dce6522e294a0085114a1';
    
    // State variables
    const loading = ref(true);
    const error = ref(null);
    const weatherData = ref(null);
    const forecastData = ref(null);
    const loadingMessage = ref('Finding XingXing monkeys with weather expertise...');
    
    // Collection of all monkey images
    const monkeyImages = [
      monkey1, monkey2, monkey3, monkey4, monkey5, monkey6, 
      monkey7, monkey8, monkey9, monkey10, monkey11, monkey12,
      monkey13, monkey14
    ];
    
    // Random monkey image index for loading screen
    const randomMonkeyIndex = ref(Math.floor(Math.random() * monkeyImages.length));
    
    // Random monkey image for loading screen
    const randomMonkeyImage = computed(() => {
      return monkeyImages[randomMonkeyIndex.value];
    });
    
    // Change random monkey occasionally
    setInterval(() => {
      randomMonkeyIndex.value = Math.floor(Math.random() * monkeyImages.length);
    }, 2000);
    
    // Determine weather condition class based on weather data
    const weatherCondition = computed(() => {
      if (!weatherData.value) return 'unknown';
      
      const weatherId = weatherData.value.weather[0].id;
      const temp = weatherData.value.main.temp;
      
      // Thunderstorm
      if (weatherId >= 200 && weatherId < 300) {
        return 'thunderstorm';
      }
      // Rain or drizzle
      else if ((weatherId >= 300 && weatherId < 400) || (weatherId >= 500 && weatherId < 600)) {
        return 'rain';
      }
      // Snow
      else if (weatherId >= 600 && weatherId < 700) {
        return 'snow';
      }
      // Clear
      else if (weatherId === 800) {
        // If clear but cold
        if (temp < 5) {
          return 'cold-sunny';
        } else {
          return 'sunny';
        }
      }
      // Cloudy
      else if (weatherId > 800) {
        return 'cloudy';
      }
      // Mist, fog, etc.
      else if (weatherId >= 700 && weatherId < 800) {
        return 'foggy';
      }
      
      return 'unknown';
    });
    
    // Determine which monkey image to show based on weather
    const monkeyImage = computed(() => {
      if (!weatherData.value) return monkey1;
      
      switch (weatherCondition.value) {
        case 'thunderstorm':
          return monkey6; // Scared-looking monkey
        case 'rain':
          return monkey4; // Sadder monkey
        case 'snow':
          return monkey2; // Cute monkey
        case 'sunny':
          return monkey9; // Happy monkey
        case 'cold-sunny':
          return monkey5; // Serious monkey
        case 'cloudy':
          return monkey3; // Neutral monkey
        case 'foggy':
          return monkey8; // Mysterious-looking monkey
        default:
          return monkey1;
      }
    });
    
    // Monkey messages based on weather
    const monkeyMessage = computed(() => {
      if (!weatherData.value) return "";
      
      const temp = weatherData.value.main.temp;
      const weatherId = weatherData.value.weather[0].id;
      
      // Temperature-based messages
      if (temp > 30) {
        return "Phew! It's scorching hot! 🥵 XingXing is melting!";
      } else if (temp > 25) {
        return "It's a perfect day for bananas and sunshine! ☀️";
      } else if (temp > 15) {
        return "XingXing is enjoying this nice weather! 😊";
      } else if (temp > 5) {
        return "A bit chilly! XingXing needs a light jacket. 🧥";
      } else if (temp > 0) {
        return "Brrr! XingXing is shivering! ❄️";
      } else {
        return "XingXing is freezing! Someone bring hot cocoa! 🥶";
      }
      
      // Additional weather condition based messages could be added here
    });
    
    // Format current date and time
    const currentDateTime = computed(() => {
      const now = new Date();
      return now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });
    
    // Process forecast data to get daily forecasts
    const forecastItems = computed(() => {
      if (!forecastData.value || !forecastData.value.list) return [];
      
      // Get one forecast per day (at noon)
      const dailyForecasts = [];
      const processedDays = new Set();
      
      forecastData.value.list.forEach(forecast => {
        const forecastDate = new Date(forecast.dt * 1000);
        const day = forecastDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Only take one forecast per day
        if (!processedDays.has(day) && dailyForecasts.length < 5) {
          processedDays.add(day);
          dailyForecasts.push({
            day,
            icon: forecast.weather[0].icon,
            description: forecast.weather[0].description,
            maxTemp: forecast.main.temp_max,
            minTemp: forecast.main.temp_min
          });
        }
      });
      
      return dailyForecasts;
    });
    
    // Get user's location and weather data
    const getWeatherData = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        // Get user's geolocation
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
        
        const { latitude, longitude } = position.coords;
        
        // Update loading message
        loadingMessage.value = "XingXing is checking the weather forecast...";
        
        // Fetch current weather data
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        
        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch current weather data');
        }
        
        weatherData.value = await weatherResponse.json();
        
        // Fetch 5-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        
        if (!forecastResponse.ok) {
          throw new Error('Failed to fetch forecast data');
        }
        
        forecastData.value = await forecastResponse.json();
        
      } catch (err) {
        console.error('Error fetching weather data:', err);
        if (err.code === 1) {
          error.value = 'Location access was denied. Please allow access to your location to use this app.';
        } else {
          error.value = `Couldn't fetch weather data: ${err.message || 'Unknown error'}`;
        }
      } finally {
        loading.value = false;
      }
    };
    
    // Load weather data when component mounts
    onMounted(() => {
      getWeatherData();
      
      // Set interval to change loading message every few seconds to keep it engaging
      const loadingMessages = [
        'Finding XingXing monkeys with weather expertise...',
        'Checking if it\'s banana rain or sunshine...',
        'Teaching XingXing how to use an umbrella...',
        'Preparing monkey-friendly weather report...',
        'Searching for the perfect weather monkey...'
      ];
      
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        if (!loading.value) {
          clearInterval(messageInterval);
          return;
        }
        
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        loadingMessage.value = loadingMessages[messageIndex];
      }, 3000);
    });
    
    return {
      loading,
      loadingMessage,
      error,
      weatherData,
      forecastData,
      randomMonkeyImage,
      weatherCondition,
      monkeyImage,
      monkeyMessage,
      currentDateTime,
      forecastItems,
      getWeatherData,
      // Add explicit references to all monkey images
      monkey1, monkey2, monkey3, monkey4, monkey5, 
      monkey6, monkey7, monkey8, monkey9, monkey10, 
      monkey11, monkey12, monkey13, monkey14,
      // Add monkeyImages array to make it available to the template
      monkeyImages
    };
  }
};
</script>

<style scoped>
.weather-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(180deg, #5b9bd5, #8ed1fc);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Loading state styles */
.loading-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.loading-monkey {
  width: 150px;
  height: 150px;
  margin-bottom: 2rem;
}

.spinning-monkey {
  width: 100%;
  height: 100%;
  animation: spin 3s infinite linear;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state styles */
.error-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.sad-monkey {
  width: 150px;
  height: 150px;
  margin-bottom: 1rem;
  animation: shake 2s infinite;
}

.sad-monkey img {
  width: 100%;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotate(-5deg); }
  75% { transform: translateX(5px) rotate(5deg); }
}

.retry-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 1rem;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.retry-button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
}

/* Weather display styles */
.weather-display {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.location-container {
  text-align: center;
  margin-bottom: 10px;
}

.location-container h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

.date-time {
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 5px;
}

.weather-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.temperature-container {
  display: flex;
  flex-direction: column;
}

.temperature {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
}

.feels-like {
  font-size: 1rem;
  opacity: 0.8;
  margin-top: 5px;
}

.weather-icon {
  text-align: center;
}

.weather-icon img {
  width: 100px;
  height: 100px;
}

.weather-icon p {
  margin: 5px 0 0 0;
  text-transform: capitalize;
}

/* XingXing reaction styles */
.xingxing-reaction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.monkey-scene {
  width: 250px;
  height: 250px;
  position: relative;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.monkey {
  width: 70%;
  height: auto;
  position: relative;
  z-index: 5;
  transition: transform 0.5s ease;
}

.monkey-message {
  text-align: center;
  font-size: 1.2rem;
  margin: 0;
  padding: 15px 20px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Weather effects */
.rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 90%, rgba(255,255,255,0.3) 100%);
  background-size: 20px 100px;
  animation: rain 0.8s linear infinite;
  opacity: 0.7;
}

.rain::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 90%, rgba(255,255,255,0.3) 100%);
  background-size: 20px 100px;
  animation: rain 0.9s linear infinite;
  animation-delay: 0.2s;
  opacity: 0.6;
}

@keyframes rain {
  0% { background-position: 0 0; }
  100% { background-position: 20px 100px; }
}

.snow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle, white 1px, transparent 1px),
    radial-gradient(circle, white 1px, transparent 1px);
  background-size: 30px 30px;
  animation: snow 4s linear infinite;
}

@keyframes snow {
  0% { background-position: 0 0, 15px 15px; }
  100% { background-position: 30px 30px, 45px 45px; }
}

.sun {
  position: absolute;
  top: 10%;
  right: 10%;
  width: 60px;
  height: 60px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 30px #FFD700, 0 0 60px rgba(255, 215, 0, 0.6);
  animation: pulse 3s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.9; }
}

.clouds {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 20px, rgba(255,255,255,0) 25px),
    radial-gradient(circle at 80% 60%, rgba(255,255,255,0.8) 30px, rgba(255,255,255,0) 35px);
  background-size: 100px 100px, 120px 120px;
  animation: clouds 8s linear infinite;
}

@keyframes clouds {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 100px 0, -120px 0; }
}

.lightning {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: lightning 5s infinite;
}

@keyframes lightning {
  0%, 95%, 100% { background-color: transparent; }
  96%, 99% { background-color: rgba(255,255,255,0.3); }
}

/* Weather condition specific styles */
.thunderstorm .monkey {
  animation: shake 0.5s infinite;
}

.rain .monkey {
  /* Monkey with "hood" */
  transform: translateY(5px) scale(0.9);
}

.snow .monkey {
  transform: translateY(5px);
}

.cold-sunny .monkey {
  animation: shiver 0.5s infinite;
}

@keyframes shiver {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
}

/* Weather details section */
.weather-details {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px;
}

.detail-item {
  flex: 1;
  min-width: 100px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.detail-icon {
  font-size: 1.5rem;
}

.detail-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.detail-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Forecast section */
.forecast-container {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  margin-top: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.forecast-container h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.5rem;
  text-align: center;
}

.forecast-items {
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  gap: 15px;
  padding-bottom: 10px;
}

.forecast-item {
  flex: 1;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.forecast-day {
  font-weight: bold;
  margin-bottom: 5px;
}

.forecast-item img {
  width: 50px;
  height: 50px;
}

.forecast-temp {
  display: flex;
  gap: 10px;
}

.forecast-temp .max {
  font-weight: bold;
}

.forecast-temp .min {
  opacity: 0.7;
}

/* Refresh button */
.refresh-button {
  align-self: center;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}

.refresh-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
}

/* Responsive styles */
@media (max-width: 600px) {
  .weather-main {
    flex-direction: column;
    gap: 20px;
  }
  
  .weather-details {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .detail-item {
    min-width: 40%;
  }
  
  .monkey-scene {
    width: 200px;
    height: 200px;
  }
  
  .temperature {
    font-size: 3rem;
  }
}
</style>