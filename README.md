[![Sponsor](https://img.shields.io/badge/Sponsor-Loqa-ff69b4?logo=githubsponsors&style=for-the-badge)](https://github.com/sponsors/annabarnes1138)
[![Ko-fi](https://img.shields.io/badge/Buy%20me%20a%20coffee-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white&style=for-the-badge)](https://ko-fi.com/annabarnes)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge)](LICENSE)
[![Made with ❤️ by Loqa Labs](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-by%20LoqaLabs-ffb6c1?style=for-the-badge)](https://loqalabs.com)

# 🎛️ Loqa Commander

[![CI/CD Pipeline](https://github.com/loqalabs/loqa-commander/actions/workflows/ci.yml/badge.svg)](https://github.com/loqalabs/loqa-commander/actions/workflows/ci.yml)

Administrative Dashboard for the Loqa voice assistant system.

## Overview

Loqa Commander is a Vue.js administrative dashboard that provides comprehensive management and monitoring of your Loqa voice assistant system. Designed for business professionals, it offers an intuitive interface for system configuration, skills management, user administration, and system monitoring with optional advanced debugging capabilities.

## Features

- **Administrative Dashboard**: System overview with health metrics and quick actions
- **Skills Management**: Complete skill administration with enable/disable controls
- **System Configuration**: User-friendly settings management interface
- **Professional UI**: Business-appropriate design with dark/light mode support
- **Mobile Responsive**: Tablet-friendly for mobile administrators
- **User Management**: Basic user profiles and permission controls (coming soon)
- **Advanced Debug Mode**: Detailed voice interaction timeline for technical users
- **Performance Monitoring**: Real-time system metrics and health indicators

### 🏢 Business-Ready Administration

- **Professional Interface**: Clean, business-appropriate design for non-technical users
- **Quick System Control**: One-click enable/disable for skills and system components
- **Health Monitoring**: Visual indicators for system status and performance
- **Settings Management**: Configure system behavior through intuitive UI
- **Backup Controls**: Manual backup and restore functionality
- **Advanced Mode**: Preserve full debugging capabilities for technical users

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

Loqa Commander will be available at `http://localhost:5173`.

### API Integration

Loqa Commander connects to the Loqa Hub API via proxy configuration in `vite.config.js`. All `/api/*` requests are forwarded to `http://localhost:3000`.

## Project Structure

```
src/
├── components/           # Reusable Vue components
│   └── SkillDetailModal.vue  # Skill configuration modal
├── views/               # Page-level components
│   ├── Dashboard.vue    # Administrative dashboard (coming soon)
│   ├── Timeline.vue     # Advanced debug timeline
│   └── Skills.vue       # Skills management interface
├── stores/              # Pinia stores for state management
├── composables/         # Vue composables for shared logic
├── App.vue              # Root component
├── main.js              # Application entry point
└── style.css            # Global styles and Tailwind imports
```

## License

This project is part of the Loqa voice assistant system and follows the same AGPL 3.0 licensing. 
 
 
# Test workflow fix
