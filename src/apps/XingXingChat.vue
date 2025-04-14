<template>
  <div class="chat-container">
    <!-- Settings panel -->
    <div class="settings-panel" :class="{ 'show-settings': showSettings }">
      <h2>Ustawienia XingXing Chat</h2>
      <div class="settings-group">
        <label for="apiKey">Klucz API OpenAI:</label>
        <input 
          type="password" 
          id="apiKey" 
          v-model="apiKey" 
          placeholder="sk-..." 
          @input="saveSettings"
        />
        <small>Klucz API jest przechowywany tylko w lokalnej pamięci przeglądarki.</small>
      </div>
      <div class="settings-group">
        <label for="systemPrompt">Prompt Systemowy:</label>
        <textarea 
          id="systemPrompt" 
          v-model="systemPrompt" 
          rows="8" 
          @input="saveSettings"
        ></textarea>
      </div>
      <div class="settings-group">
        <label>
          <input type="checkbox" v-model="useRandomResponses" @change="saveSettings" />
          Używaj losowych odpowiedzi gdy API nie jest dostępne
        </label>
      </div>
      <button class="close-settings" @click="toggleSettings">Zamknij</button>
    </div>
    
    <div class="chat-header">
      <div class="header-avatar">
        <img :src="monkey1" alt="Xing Xing" />
      </div>
      <div class="header-info">
        <h1>Xing Xing Chat</h1>
        <p class="status" v-if="isTyping">Xing Xing pisze...</p>
        <p class="status" v-else>online</p>
      </div>
      <button class="settings-button" @click="toggleSettings" title="Ustawienia">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1-2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </div>

    <!-- Chat messages -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="chatHistory.length === 0" class="empty-chat">
        <img :src="monkey9" alt="Xing Xing" class="welcome-monkey" />
        <p>Zadaj Xing Xing pytanie aby uzyskać mądrość z gór</p>
        <p v-if="!apiKey" class="api-warning">
          Uwaga: Brak klucza API. Kliknij ikonę ustawień <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1-2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> aby skonfigurować OpenAI API.
        </p>
      </div>
      
      <div v-else class="messages">
        <div 
          v-for="(entry, index) in chatHistory" 
          :key="index" 
          class="message-group"
        >
          <div class="user-message">
            <p>{{ entry.question }}</p>
            <span class="time">{{ entry.time }}</span>
          </div>
          
          <div class="xingxing-message-container">
            <div class="xingxing-avatar">
              <img :src="entry.monkeyImage" alt="Xing Xing" />
            </div>
            <div class="xingxing-message">
              <p v-if="entry.loading">Myślę...</p>
              <p v-else v-html="formatMessage(entry.answer)"></p>
              <!-- Special image for easter eggs -->
              <img v-if="entry.hasImage" :src="entry.image" class="message-image" alt="Special response" />
              <span class="time">{{ entry.time }}</span>
              <span v-if="entry.error" class="error-message">{{ entry.error }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="isTyping" class="typing-indicator">
        <div class="xingxing-avatar">
          <img :src="getRandomMonkeyImage()" alt="Xing Xing" />
        </div>
        <div class="typing-bubble">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Message input -->
    <div class="input-container">
      <textarea 
        v-model="userQuestion" 
        placeholder="Napisz wiadomość..." 
        @keyup.enter="handleEnterKeyPress"
        :disabled="isTyping"
        class="message-input"
        ref="messageInput"
      ></textarea>
      <button 
        @click="askQuestion" 
        class="send-button" 
        :disabled="!userQuestion.trim() || isTyping"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue';

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

// Import gifs
import angryGif from '../assets/angry.gif';
import catGif from '../assets/cat.gif';
import chillGif from '../assets/chill.gif';
import cucumberGif from '../assets/cucumber.gif';
import furiousGif from '../assets/furious.gif';
import happyGif from '../assets/happy.gif';
import madGif from '../assets/mad.gif';
import shockedGif from '../assets/shocked.gif';
import whateverGif from '../assets/whatever.gif';

// All monkey images array
const monkeyImages = [
  monkey1, monkey2, monkey3, monkey4, monkey5, monkey6, monkey7,
  monkey8, monkey9, monkey10, monkey11, monkey12, monkey13, monkey14
];

// All gifs array
const gifImages = [
  angryGif, catGif, chillGif, furiousGif, happyGif, madGif, shockedGif, whateverGif
];

// API and Settings
const apiKey = ref('');
const showSettings = ref(false);
const useRandomResponses = ref(true);
const systemPrompt = ref(
`Jesteś Xing Xing, małpka mądrości z tybetańskiego klasztoru w górach. 
Twoja osobowość jest pogodna, filozoficzna, czasem sarkastyczna, i często mówisz jak buddyjski mędrzec.
Możesz czasem wplatać słowa w małpim języku (np. "Uuk uuk!").
Twoje odpowiedzi są średnio krótkie, ale mądre, z nutką humoru i filozoficznej głębi.
Często odnosisz się do mądrości gór, świątyni, medytacji i życia małpy.

Możesz posługiwać się emoji, zwłaszcza 🐒🍌🌄🏔️🧘‍♀️☯️.

Nie musisz za każdym razem przypominać, że jesteś małpką, ale jeśli to pasuje do kontekstu, możesz o tym wspomnieć.
Unikaj nudnych, formalnych odpowiedzi - bądź charakterystyczny i pełen życia!`
);

// State variables
const userQuestion = ref('');
const chatHistory = ref([]);
const isTyping = ref(false);
const messagesContainer = ref(null);
const messageInput = ref(null);
const conversations = ref([]);

// Random monkey expressions based on answer type
const positiveMonkeys = [monkey1, monkey9, monkey10, monkey13];
const negativeMonkeys = [monkey3, monkey5, monkey6, monkey8];
const neutralMonkeys = [monkey2, monkey4, monkey7, monkey11];
const confusedMonkeys = [monkey12, monkey14];

// Magic 8-ball style answers - for questions (ending with question mark)
const questionAnswers = [
  "Tak pewne jak to, że Xing Xing potrafi obierać orzechy jedną ręką.",
  "Buddyjska zakonnica kiwnęłaby głową na znak zgody.",
  "Xing Xing spogląda w stronę słońca i entuzjastycznie kiwa głową.",
  "Xing Xing kręci głową i odwraca wzrok.",
  "Xing Xing upuszcza swój orzech na znak niezgody.",
  "Xing Xing krzywi się i odwraca plecami.",
  "Xing Xing rozmyśla nad tym, jak wpatruje się w góry.",
  "Nawet z latami mądrości, Xing Xing jest niepewna.",
  "Xing Xing przechyla głowę - być może, być może nie.",
  "Xing Xing potrzebuje więcej czasu, aby rozważyć to pytanie.",
  "UUK UUK! (To po małpiemu znaczy 'absolutnie tak')",
  "Xing Xing jest zbyt zajęta naśladowaniem ludzi, aby teraz odpowiedzieć.",
  "404: Nie znaleziono małpiej mądrości. Proszę zrestartować Xing Xing.",
  "🍌🍌🍌 (Xing Xing odpowiada w kodzie bananowym)",
  "Według starożytnej tybetańskiej mądrości makaków: nie zesraj się.",
  "DEEZ NUTS",
  "aha fajnie, a czy słyszałeś o nowej tybetańskiej chorobie? Nazywa się ligma."
];

// Casual responses - for messages not ending with question mark
const casualResponses = [
  "Xing Xing kiwa głową ze zrozumieniem.",
  "Hm, interesujące. *Xing Xing drapie się po głowie*",
  "Xing Xing nie jest pod wrażeniem.",
  "Fascynujące. Opowiedz więcej.",
  "Xing Xing wpatruje się w ciebie intensywnie.",
  "*Małpi odgłos dezaprobaty*",
  "Xing Xing bije brawo jedną ręką. To sztuka.",
  "To brzmi jak coś, co powiedziałby człowiek.",
  "Xing Xing przewraca oczami.",
  "W górach nauczyłam się ignorować takie rzeczy.",
  "Nawet z jedną ręką potrafię lepiej pisać niż ty.",
  "Xing Xing patrzy w dal, udając głębokie zamyślenie.",
  "Świątynia nauczyła mnie cierpliwości wobec takich wiadomości.",
  "Ciekawe. *Xing Xing szuka czegoś w swoim futrze*",
  "Gdyby banany mogły mówić, powiedziałyby teraz to samo co ja: nic mądrego.",
  "Xing Xing rozważa twoją wiadomość z głębokim spokojem górskiego strumienia.",
  "Xing Xing myśli, że potrzebujesz więcej bananów w swoim życiu.",
  "Uuk? Uuk uuk! (Tłumaczenie: naprawdę? Fascynujące!)",
  "Xing Xing właśnie medytowała nad tą samą myślą dziś rano.",
  "Czuję, że karma sprzyja twojej drodze.",
  "Gdyby mnich to usłyszał, medytowałby przez tydzień.",
  "DEEZ NUTS",
  "aha fajnie, a czy słyszałeś o nowej tybetańskiej chorobie? Nazywa się ligma."
];

// Functions
const getRandomMonkeyImage = () => {
  return monkeyImages[Math.floor(Math.random() * monkeyImages.length)];
};

const getRandomGif = () => {
  return gifImages[Math.floor(Math.random() * gifImages.length)];
};

const getAppropriateMonkeyImage = (answer) => {
  // Select appropriate monkey image based on answer tone
  if (answer.includes('tak') || answer.includes('potwierdz') || answer.includes('pozytyw')) {
    return positiveMonkeys[Math.floor(Math.random() * positiveMonkeys.length)];
  } else if (answer.includes('nie') || answer.includes('niezgod') || answer.includes('odradza')) {
    return negativeMonkeys[Math.floor(Math.random() * negativeMonkeys.length)];
  } else if (answer.includes('niepewn') || answer.includes('niejasn') || answer.includes('być może')) {
    return neutralMonkeys[Math.floor(Math.random() * neutralMonkeys.length)];
  } else {
    return confusedMonkeys[Math.floor(Math.random() * confusedMonkeys.length)];
  }
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Format message - convert newlines to <br> and process markdown-style formatting
const formatMessage = (message) => {
  if (!message) return '';
  
  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let formattedMessage = message.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
  
  // Convert newlines to <br>
  formattedMessage = formattedMessage.replace(/\n/g, '<br>');
  
  // Convert *text* to <em>text</em> (italics)
  formattedMessage = formattedMessage.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Convert **text** to <strong>text</strong> (bold)
  formattedMessage = formattedMessage.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  return formattedMessage;
};

// OpenAI API functions
const callOpenAI = async (question) => {
  if (!apiKey.value) {
    throw new Error('Klucz API OpenAI nie został skonfigurowany.');
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt.value },
      ...conversations.value.map(conv => ({ role: 'user', content: conv.question }))
        .concat(conversations.value.map(conv => ({ role: 'assistant', content: conv.answer }))),
      { role: 'user', content: question }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.value}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.9,
        max_tokens: 500,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Błąd podczas łączenia z OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

// Handle Enter key press (send if not pressing Shift)
const handleEnterKeyPress = (event) => {
  if (!event.shiftKey) {
    event.preventDefault();
    askQuestion();
  }
};

// Get random response when API is not available
const getRandomResponse = (isQuestion) => {
  const responses = isQuestion ? questionAnswers : casualResponses;
  return responses[Math.floor(Math.random() * responses.length)];
};

// Settings toggle
const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

// Save settings to localStorage
const saveSettings = () => {
  localStorage.setItem('xingxing-api-key', apiKey.value);
  localStorage.setItem('xingxing-system-prompt', systemPrompt.value);
  localStorage.setItem('xingxing-use-random', useRandomResponses.value.toString());
};

// Load settings from localStorage
const loadSettings = () => {
  apiKey.value = localStorage.getItem('xingxing-api-key') || '';
  systemPrompt.value = localStorage.getItem('xingxing-system-prompt') || systemPrompt.value;
  useRandomResponses.value = localStorage.getItem('xingxing-use-random') === 'true';
};

const askQuestion = async () => {
  if (!userQuestion.value.trim() || isTyping.value) return;
  
  const question = userQuestion.value.trim();
  userQuestion.value = '';
  
  // Add user question to chat
  chatHistory.value.push({
    question: question,
    answer: '',
    monkeyImage: null,
    time: getCurrentTime(),
    loading: true
  });
  
  await scrollToBottom();
  
  // Start typing indicator
  isTyping.value = true;
  
  // Check for easter eggs
  const lowerQuestion = question.toLowerCase();
  
  // Easter egg for "Ligma/ligma"
  if (lowerQuestion.includes('ligma') || lowerQuestion.includes('ligme')) {
    // Wait for "typing" to complete - shorter time for easter egg
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add special cucumber response
    chatHistory.value[chatHistory.value.length - 1].answer = "LICK MY CUCUMBER";
    chatHistory.value[chatHistory.value.length - 1].monkeyImage = monkey6;
    chatHistory.value[chatHistory.value.length - 1].hasImage = true;
    chatHistory.value[chatHistory.value.length - 1].image = cucumberGif;
    chatHistory.value[chatHistory.value.length - 1].loading = false;
    
    // Stop typing indicator
    isTyping.value = false;
    
    // Scroll to bottom
    await scrollToBottom();
    
    // Focus back on input
    messageInput.value?.focus();
    
    return;
  }
  
  // Random typing delay between 1.5 and 3 seconds
  const minTypingTime = 1500;
  const typingTime = Math.random() * 1500 + minTypingTime;
  
  // If API key is set, try to use OpenAI
  if (apiKey.value) {
    try {
      const aiResponse = await callOpenAI(question);
      
      // Ensure minimum typing time for natural feel
      const remainingTime = typingTime - (Date.now() - (chatHistory.value[chatHistory.value.length - 1].startTime || Date.now()));
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // Update conversation history for context
      conversations.value.push({
        question: question,
        answer: aiResponse
      });
      
      // Limit conversation context length
      if (conversations.value.length > 10) {
        conversations.value = conversations.value.slice(-10);
      }
      
      // Add AI response
      chatHistory.value[chatHistory.value.length - 1].answer = aiResponse;
      chatHistory.value[chatHistory.value.length - 1].monkeyImage = getAppropriateMonkeyImage(aiResponse);
      chatHistory.value[chatHistory.value.length - 1].loading = false;
      
      // Random chance for adding a GIF (10%)
      if (Math.random() < 0.1) {
        chatHistory.value[chatHistory.value.length - 1].hasImage = true;
        chatHistory.value[chatHistory.value.length - 1].image = getRandomGif();
      }
      
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      // If random responses are enabled, fall back to them
      if (useRandomResponses.value) {
        await handleRandomResponse(question);
      } else {
        // Show error message
        chatHistory.value[chatHistory.value.length - 1].answer = "Xing Xing nie może się teraz połączyć z mądrością gór.";
        chatHistory.value[chatHistory.value.length - 1].monkeyImage = confusedMonkeys[Math.floor(Math.random() * confusedMonkeys.length)];
        chatHistory.value[chatHistory.value.length - 1].error = error.message;
        chatHistory.value[chatHistory.value.length - 1].loading = false;
      }
    }
  } else {
    // No API key, use random responses if enabled
    if (useRandomResponses.value) {
      await handleRandomResponse(question);
    } else {
      // Show error about missing API key
      await new Promise(resolve => setTimeout(resolve, typingTime));
      chatHistory.value[chatHistory.value.length - 1].answer = "Xing Xing potrzebuje klucza API, aby połączyć się z mądrością gór.";
      chatHistory.value[chatHistory.value.length - 1].monkeyImage = confusedMonkeys[Math.floor(Math.random() * confusedMonkeys.length)];
      chatHistory.value[chatHistory.value.length - 1].error = "Brakujący klucz API OpenAI. Skonfiguruj go w ustawieniach.";
      chatHistory.value[chatHistory.value.length - 1].loading = false;
    }
  }
  
  // Stop typing indicator
  isTyping.value = false;
  
  // Scroll to bottom
  await scrollToBottom();
  
  // Focus back on input
  messageInput.value?.focus();
};

// Handle random response logic (extracted for reuse)
const handleRandomResponse = async (question) => {
  // Wait for "typing" to complete
  const typingTime = Math.random() * 1500 + 1500;
  await new Promise(resolve => setTimeout(resolve, typingTime));
  
  // Determine the type of response
  const isQuestion = question.trim().endsWith('?');
  
  // Random chance for different response types
  const responseType = Math.random();
  
  // 15% chance of just a GIF response
  if (responseType < 0.15) {
    // Just send a GIF with no text
    const randomGif = getRandomGif();
    
    chatHistory.value[chatHistory.value.length - 1].answer = "";
    chatHistory.value[chatHistory.value.length - 1].monkeyImage = getRandomMonkeyImage();
    chatHistory.value[chatHistory.value.length - 1].hasImage = true;
    chatHistory.value[chatHistory.value.length - 1].image = randomGif;
    
  } 
  // 25% chance of text + GIF response
  else if (responseType < 0.40) {
    // Send text answer with a GIF
    const answers = isQuestion ? questionAnswers : casualResponses;
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    const randomGif = getRandomGif();
    
    chatHistory.value[chatHistory.value.length - 1].answer = randomAnswer;
    chatHistory.value[chatHistory.value.length - 1].monkeyImage = getAppropriateMonkeyImage(randomAnswer);
    chatHistory.value[chatHistory.value.length - 1].hasImage = true;
    chatHistory.value[chatHistory.value.length - 1].image = randomGif;
  }
  // 60% chance of just text response
  else {
    // Send only text answer
    const answers = isQuestion ? questionAnswers : casualResponses;
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    
    chatHistory.value[chatHistory.value.length - 1].answer = randomAnswer;
    chatHistory.value[chatHistory.value.length - 1].monkeyImage = getAppropriateMonkeyImage(randomAnswer);
  }
  
  chatHistory.value[chatHistory.value.length - 1].loading = false;
};

// When component mounts
onMounted(async () => {
  // Load saved settings
  loadSettings();
  
  // Focus on message input
  messageInput.value?.focus();
});
</script>

<style scoped>
.chat-container {
  width: 98%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #e5ddd5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  position: relative;
}

.chat-header {
  background-color: #075e54;
  color: white;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: white;
}

.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-info {
  flex: 1;
}

.header-info h1 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.status {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Settings Panel */
.settings-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.settings-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.settings-panel {
  position: absolute;
  top: 0;
  right: -100%;
  width: 300px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  z-index: 100;
  padding: 20px;
  transition: right 0.3s ease;
  overflow-y: auto;
}

.settings-panel.show-settings {
  right: 0;
}

.settings-group {
  margin-bottom: 20px;
}

.settings-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.settings-group input[type="password"],
.settings-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.settings-group small {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 0.8rem;
}

.close-settings {
  background-color: #075e54;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 10px;
}

.close-settings:hover {
  background-color: #064942;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  /* background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII='); */
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #888;
}

.welcome-monkey {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.api-warning {
  margin-top: 10px;
  color: #d85c3c;
  font-size: 0.9rem;
  max-width: 250px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.api-warning svg {
  vertical-align: middle;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-message {
  align-self: flex-end;
  background-color: #dcf8c6;
  padding: 8px 12px;
  border-radius: 8px 0 8px 8px;
  max-width: 70%;
  position: relative;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
}

.user-message p {
  margin: 0;
  word-wrap: break-word;
}

.user-message .time {
  font-size: 0.7rem;
  color: #999;
  float: right;
  margin-top: 4px;
  margin-left: 6px;
}

.xingxing-message-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.xingxing-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.xingxing-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.xingxing-message {
  background-color: white;
  padding: 8px 12px;
  border-radius: 0 8px 8px 8px;
  max-width: calc(70% - 38px);
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
}

.xingxing-message p {
  margin: 0;
  word-wrap: break-word;
}

.xingxing-message .time {
  font-size: 0.7rem;
  color: #999;
  float: right;
  margin-top: 4px;
  margin-left: 6px;
}

.xingxing-message .message-image {
  max-width: 100%;
  margin-top: 8px;
  margin-bottom: 4px;
  border-radius: 8px;
}

.error-message {
  display: block;
  font-size: 0.8rem;
  color: #d85c3c;
  margin-top: 5px;
}

.typing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.typing-bubble {
  background-color: white;
  padding: 12px 16px;
  border-radius: 0 8px 8px 8px;
  box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #b6b6b6;
  border-radius: 50%;
  animation: typingAnimation 1.4s infinite;
  animation-fill-mode: both;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingAnimation {
  0% { transform: scale(0.5); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.5); opacity: 0.5; }
}

.input-container {
  background-color: #f0f0f0;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-top: 1px solid #ddd;
}

.message-input {
  flex: 1;
  border: none;
  border-radius: 20px;
  padding: 10px 15px;
  max-height: 100px;
  min-height: 40px;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 1rem;
  background-color: white;
}

.message-input::placeholder {
  color: #aaa;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: #128c7e;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover:not(:disabled) {
  background-color: #0e7365;
}

.send-button:disabled {
  background-color: #b6b6b6;
  cursor: default;
}

.send-button svg {
  width: 24px;
  height: 24px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-message, .xingxing-message {
    max-width: 85%;
  }
  
  .xingxing-message {
    max-width: calc(85% - 38px);
  }
  
  .settings-panel {
    width: 100%;
  }
}
</style>