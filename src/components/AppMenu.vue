<template>
  <div class="menu-container" :class="{ 'menu-collapsed': collapsed }">
    <div class="menu-header">
      <h1>Xing Xing Simulator</h1>
      <button class="toggle-button" @click="toggleMenu">
        {{ collapsed ? '☰' : '×' }}
      </button>
    </div>
    
    <div class="menu-items" v-if="!collapsed">
      <router-link 
        v-for="app in apps" 
        :key="app.id" 
        :to="app.route" 
        class="menu-item"
        @click="onAppSelect"
        :class="{ active: currentApp === app.id }">
        {{ app.name }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  currentApp: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['appSelected']);

const collapsed = ref(false);

const apps = [
  { id: 'xingxing3d', name: 'Xing Xing 3D', route: '/xingxing3d' },
  { id: 'pou', name: 'Pou', route: '/pou' },
  { id: 'paint', name: 'Xing Xing Paint', route: '/paint' },
  { id: 'memory', name: 'Xing Xing Memory', route: '/memory' },
  { id: 'clock', name: 'Xing Xing Clock', route: '/clock' },
  { id: 'weather', name: 'Xing Xing Weather', route: '/weather' },
  { id: 'chat', name: 'Xing Xing Chat', route: '/chat' },
  // More apps will be added here in the future
];

const toggleMenu = () => {
  collapsed.value = !collapsed.value;
};

const onAppSelect = () => {
  emit('appSelected');
  // On mobile, we might want to collapse the menu after selection
  if (window.innerWidth < 768) {
    collapsed.value = true;
  }
};
</script>

<style scoped>
.menu-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  padding: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.menu-collapsed {
  width: 60px;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #4a637a;
}

.menu-collapsed .menu-header h1 {
  display: none;
}

.menu-header h1 {
  margin: 0;
  font-size: 1.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toggle-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
}

.menu-items {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #ddd;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #4a637a;
  color: white;
}

.menu-item.active {
  background-color: #5a738a;
  color: white;
  font-weight: bold;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .menu-container {
    width: 100%;
    height: auto;
    position: fixed;
  }
  
  .menu-collapsed {
    height: 60px;
  }
  
  .menu-items {
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }
}
</style>