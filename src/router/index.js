import { createRouter, createWebHistory } from 'vue-router';
import XingXing3D from '../apps/XingXing3D.vue';
import Pou from '../apps/Pou.vue';
import XingXingPaint from '../apps/XingXingPaint.vue';
import XingXingMemory from '../apps/XingXingMemory.vue';
import XingXingClock from '../apps/XingXingClock.vue';
import XingXingWeather from '../apps/XingXingWeather.vue';
import XingXingChat from '../apps/XingXingChat.vue';

// Define routes
const routes = [
  {
    path: '/',
    redirect: '/xingxing3d'
  },
  {
    path: '/xingxing3d',
    name: 'XingXing3D',
    component: XingXing3D,
    meta: { appId: 'xingxing3d' }
  },
  {
    path: '/pou',
    name: 'Pou',
    component: Pou,
    meta: { appId: 'pou' }
  },
  {
    path: '/paint',
    name: 'XingXingPaint',
    component: XingXingPaint,
    meta: { appId: 'paint' }
  },
  {
    path: '/memory',
    name: 'XingXingMemory',
    component: XingXingMemory,
    meta: { appId: 'memory' }
  },
  {
    path: '/clock',
    name: 'XingXingClock',
    component: XingXingClock,
    meta: { appId: 'clock' }
  },
  {
    path: '/weather',
    name: 'XingXingWeather',
    component: XingXingWeather,
    meta: { appId: 'weather' }
  },
  {
    path: '/chat',
    name: 'XingXingChat',
    component: XingXingChat,
    meta: { appId: 'chat' }
  },
  // More apps will be added here in the future
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;