<template>
  <div class="app">
    <AppMenu :currentApp="currentAppId" @appSelected="onAppSelected" />
    <div class="app-content" :class="{ 'menu-open': !menuCollapsed }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import AppMenu from './components/AppMenu.vue';

const route = useRoute();
const menuCollapsed = ref(false);

// Get current app ID from route metadata
const currentAppId = computed(() => route.meta.appId || '');

const onAppSelected = () => {
  // Optional: Add any logic needed when app is selected
};
</script>

<style>
/* Global styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f4f4f4;
  overflow: hidden;
}

.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  position: relative;
}

.app-content {
  flex: 1;
  margin-left: 210px;
  height: 100vh;
  position: relative;
  transition: margin-left 0.3s ease;
  overflow: hidden;
}

.menu-open {
  margin-left: 210px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-content {
    margin-left: 0;
    margin-top: 60px;
    height: calc(100vh - 60px);
  }
  
  .menu-open {
    margin-left: 0;
  }
}
</style>