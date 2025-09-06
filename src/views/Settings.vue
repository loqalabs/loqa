<template>
  <div class="settings-page">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Settings</h1>
      <p class="text-gray-600 dark:text-gray-400">Configure your Loqa voice assistant system</p>
    </div>

    <!-- Settings Coming Soon -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800 dark:text-blue-300">Settings Interface Coming Soon</h3>
          <p class="mt-1 text-sm text-blue-700 dark:text-blue-400">
            The administrative settings interface is being developed as part of the Loqa Commander transformation.
            This will include system configuration, user management, backup controls, and privacy settings.
          </p>
          <div class="mt-3">
            <p class="text-xs text-blue-600 dark:text-blue-400">
              For now, system configuration is managed through environment variables and configuration files.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Planned Features Preview -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 opacity-75">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">🔧 System Configuration</h3>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>• Voice detection sensitivity</li>
          <li>• Response time settings</li>
          <li>• Audio device selection</li>
          <li>• LLM model preferences</li>
        </ul>
        <div class="mt-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Coming Soon
          </span>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 opacity-75">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">👥 User Management</h3>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>• User profiles and permissions</li>
          <li>• Voice recognition training</li>
          <li>• Access control settings</li>
          <li>• Role-based administration</li>
        </ul>
        <div class="mt-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Coming Soon
          </span>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 opacity-75">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">🔐 Privacy & Security</h3>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>• Data retention policies</li>
          <li>• Logging levels and sanitization</li>
          <li>• HIPAA compliance controls</li>
          <li>• Encryption settings</li>
        </ul>
        <div class="mt-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Coming Soon
          </span>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 opacity-75">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">💾 Backup & Restore</h3>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>• Automated backup scheduling</li>
          <li>• Manual backup creation</li>
          <li>• System restore options</li>
          <li>• Export configuration</li>
        </ul>
        <div class="mt-4">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Settings functionality will be implemented in future iterations
</script>

<style scoped>
.settings-page {
  @apply p-6;
}
</style>