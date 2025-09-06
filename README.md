[![Sponsor](https://img.shields.io/badge/Sponsor-Loqa-ff69b4?logo=githubsponsors&style=for-the-badge)](https://github.com/sponsors/annabarnes1138)
[![Ko-fi](https://img.shields.io/badge/Buy%20me%20a%20coffee-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white&style=for-the-badge)](https://ko-fi.com/annabarnes)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge)](LICENSE)
[![Made with ❤️ by Loqa Labs](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-by%20LoqaLabs-ffb6c1?style=for-the-badge)](https://loqalabs.com)

# 🔍 Loqa Observer

[![CI/CD Pipeline](https://github.com/loqalabs/loqa-observer/actions/workflows/ci.yml/badge.svg)](https://github.com/loqalabs/loqa-observer/actions/workflows/ci.yml)

Voice Command Timeline UI for the Loqa voice assistant system.

## Overview

Loqa Observer is a Vue.js web application that provides real-time visualization and inspection of voice interactions processed by the Loqa system. It offers a timeline view of voice events with detailed transcription, intent parsing, and confidence metrics.

## Features

- **Real-time Timeline**: Chronological view of voice interactions
- **Skills Management**: Complete skill administration interface (Milestone 4a)
- **Dark Mode Support**: Automatic system preference detection with manual toggle
- **Mobile Responsive**: Optimized for desktop and mobile devices
- **Event Details**: Drill-down modals with complete JSON payload
- **Analytics Dashboard**: Performance metrics and insights (coming soon)
- **Auto-refresh**: Polling-based updates every 5 seconds

### 🆕 Milestone 4a: Skills Management UI

- **Skills Dashboard**: Overview of installed skills with statistics
- **Skill Configuration**: Detailed configuration interface with tabs
- **Enable/Disable**: One-click skill activation controls
- **Permission Management**: View and understand skill permissions
- **Real-time Status**: Live skill health and error monitoring
- **Configuration Editor**: Edit skill settings with validation

## Tech Stack

- Vue 3 with Composition API
- Vite for development and building
- Tailwind CSS for styling
- Vue Router for navigation
- Pinia for state management
- Headless UI for accessible components
- Heroicons for icons

## Development

### Prerequisites

- Node.js 18+
- Running Loqa Hub on `http://localhost:3000`

### Setup

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

### API Integration

The app connects to the Loqa Hub API via proxy configuration in `vite.config.js`. All `/api/*` requests are forwarded to `http://localhost:3000`.

## Project Structure

```
src/
├── components/           # Reusable Vue components
│   └── SkillDetailModal.vue  # Skill configuration modal (Milestone 4a)
├── views/               # Page-level components
│   ├── Timeline.vue     # Voice events timeline
│   └── Skills.vue       # Skills management interface (Milestone 4a)
├── stores/              # Pinia stores for state management
├── composables/         # Vue composables for shared logic
├── App.vue              # Root component
├── main.js              # Application entry point
└── style.css            # Global styles and Tailwind imports
```

## License

This project is part of the Loqa voice assistant system and follows the same AGPL 3.0 licensing. 
 
 
# Test workflow fix
