<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">🎛️ Loqa Commander</h1>
            <span
              class="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 text-xs font-medium rounded-full"
            >
              Administrative Dashboard
            </span>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Navigation -->
            <nav class="flex space-x-4">
              <router-link
                to="/"
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/' }"
              >
                Dashboard
              </router-link>
              <router-link
                to="/skills"
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/skills' }"
              >
                Skills
              </router-link>
              <router-link
                to="/settings"
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/settings' }"
              >
                Settings
              </router-link>
              <router-link
                to="/debug"
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/debug' }"
              >
                Debug
              </router-link>
            </nav>

            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md"
              aria-label="Toggle dark mode"
            >
              <SunIcon v-if="isDark" class="h-5 w-5" />
              <MoonIcon v-else class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const isDark = ref(false)

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  updateDarkMode()
}

const updateDarkMode = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', 'true')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', 'false')
  }
}

onMounted(() => {
  // Check for saved dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === 'true') {
    isDark.value = true
  } else if (savedDarkMode === 'false') {
    isDark.value = false
  } else {
    // Use system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  updateDarkMode()
})
</script>
