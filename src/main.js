import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Skills from './views/Skills.vue'
import Settings from './views/Settings.vue'
import Timeline from './views/Timeline.vue'
import Analytics from './views/Analytics.vue'

import './style.css'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Dashboard' },
  },
  {
    path: '/skills',
    name: 'Skills',
    component: Skills,
    meta: { title: 'Skills Management' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { title: 'Settings' },
  },
  {
    path: '/debug',
    name: 'Debug',
    component: Timeline,
    meta: { title: 'Debug Timeline' },
  },
  // Legacy routes for compatibility
  {
    path: '/timeline',
    redirect: '/debug'
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { title: 'Analytics' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  document.title = `${to.meta.title} - Loqa Commander`
})

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)
app.mount('#app')
