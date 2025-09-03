[![Sponsor](https://img.shields.io/badge/Sponsor-Loqa-ff69b4?logo=githubsponsors&style=for-the-badge)](https://github.com/sponsors/annabarnes1138)
[![Ko-fi](https://img.shields.io/badge/Buy%20me%20a%20coffee-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white&style=for-the-badge)](https://ko-fi.com/annabarnes)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge)](LICENSE)
[![Made with ❤️ by LoqaLabs](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-by%20LoqaLabs-ffb6c1?style=for-the-badge)](https://loqalabs.com)

![Loqa Social Preview](https://github.com/user-attachments/assets/99016e57-ace5-4140-a4f3-c49262f83253)

# 🦜 Loqa – A Local-First Voice Assistant

[![CI/CD Pipeline](https://github.com/loqalabs/loqa/actions/workflows/ci.yml/badge.svg)](https://github.com/loqalabs/loqa/actions/workflows/ci.yml)

**Loqa** is a privacy-respecting voice assistant that runs entirely on your own devices. No cloud, no Big Tech, no data mining — just fast, private voice control that you actually own.

> 🎯 Think "personal Alexa" that never leaves your house.

---

## 🚀 Try It Now

**Get running in under 5 minutes with one command:**

```bash
curl -fsSL "https://raw.githubusercontent.com/loqalabs/loqa/main/setup.sh?$(date +%s)" | bash
```

Then open http://localhost:5173 to see the voice assistant UI

**For voice testing:** Run `curl -fsSL "https://raw.githubusercontent.com/loqalabs/loqa/main/test-voice.sh?$(date +%s)" | bash` to test with your microphone, or see the **[5-Minute Setup Guide](./docs/getting-started-5min.md)** for details.

👉 **Having issues?** Check **[Troubleshooting](./docs/troubleshooting.md)**

---

## ✨ What You Get

- 🎤 **Wake word detection** - Just say "Hey Loqa"
- 🧠 **Natural language** - Talk normally, not like a robot
- 🏠 **Smart home control** - Lights, music, devices (simulated for now)
- 📊 **Voice Command Timeline** - Visual web interface to see every interaction
- 🔒 **100% private** - Everything stays on your network
- 🛠️ **Fully hackable** - Build your own skills and commands

---

## 🧱 How It Works

1. **Speak** → Microphone captures your voice
2. **Process** → Local AI understands what you want  
3. **Act** → Your devices respond instantly
4. **Visualize** → See all interactions in real-time web timeline
5. **Privacy** → Nothing ever leaves your house

👉 **[See the Full Architecture](./docs/architecture.md)** with diagrams and technical details

---

## 📋 What You Need

**Minimum:**
- Computer with 4+ CPU cores and 8GB+ RAM
- Docker installed
- Microphone (built-in or USB)

**That's it!** Loqa downloads and runs everything locally.

👉 **[Detailed Requirements](./docs/quickstart.md#system-requirements)** for optimal performance

---

## 🔧 Recent Improvements

**2025 Infrastructure Enhancements:**
- ✅ **Modern CI/CD** - GitHub Actions with automated testing, security scanning, and multi-platform builds
- ✅ **Quality Assurance** - Automated commit message validation and coding standards enforcement  
- ✅ **Security-First** - Comprehensive security policies and vulnerability reporting processes
- ✅ **AGPLv3 License** - Strong copyleft protection ensuring community contributions stay open source
- ✅ **Cross-Platform** - Linux, Docker, and embedded device support with proper dependency management
- ✅ **Developer Experience** - Consistent tooling, documentation, and contribution workflows across all repositories

**Milestone 2: Observability & Event Tracking:**
- ✅ **Complete Voice Traceability** - Every voice interaction generates structured, queryable events with full metadata
- ✅ **SQLite Integration** - Persistent storage with optimized performance (WAL mode, indexes, migrations)
- ✅ **Structured Logging** - Rich context logging with Zap (JSON/console output, configurable levels)
- ✅ **HTTP API** - RESTful endpoints for event access: `/api/voice-events` with filtering and pagination
- ✅ **Audio Fingerprinting** - SHA-256 hashing for deduplication and analysis
- ✅ **Real-time Metrics** - Processing time tracking and error state capture throughout the pipeline

**Milestone 3: Voice Command Timeline UI (NEW):**
- ✅ **Real-time Web Interface** - Vue.js timeline showing all voice interactions as they happen
- ✅ **Event Visualization** - See transcriptions, intents, confidence scores, and success/failure states
- ✅ **Audio Playback** - Listen to original voice commands directly in the browser
- ✅ **Detailed Event Inspection** - Drill-down modals with complete JSON payloads for debugging
- ✅ **Dark Mode Support** - Modern, responsive interface that adapts to your preferences
- ✅ **Auto-refresh** - Timeline updates automatically every 5 seconds to show new voice events

**All repositories now feature:**
- Automated CI/CD pipelines with status badges
- Security vulnerability scanning with Trivy
- Modern Go 1.24+ with static analysis  
- Protocol buffer integration and code generation
- Comprehensive documentation and security policies

---

## 🏗️ Setup Options

### 🚀 5-Minute User Setup (Recommended)

For users who just want to run Loqa quickly with pre-built images:

```bash
curl -fsSL "https://raw.githubusercontent.com/loqalabs/loqa/main/setup.sh?$(date +%s)" | bash
```

This downloads the docker-compose.yml and uses pre-built Docker images from our CI/CD pipeline - no compilation needed!

### 🛠️ Development Setup

For developers who want to build from source and modify the code:

```bash
git clone https://github.com/loqalabs/loqa.git
cd loqa/scripts && ./setup-dev.sh
# OR use Make commands
cd loqa/scripts && make setup-dev
```

This clones all repositories and builds Docker images locally from source.

### 📋 Development Roadmap

- **[TODO.md](./TODO.md)** - Priority 1 & 2 tasks: Must-fix issues and high-impact UX improvements
- **[BACKLOG.md](./BACKLOG.md)** - Priority 3 features: Optional post-MVP enhancements and future ideas

### 🔧 Developer Resources

Building something with Loqa? Start here:

- **[Developer Guide](./docs/DEVELOPER.md)** - Repository structure, workflows, and contribution
- **[Architecture Overview](./docs/architecture.md)** - How everything fits together  
- **[Skills Development](./docs/skills.md)** - Build your own voice commands
- **[API Reference](./docs/messaging.md)** - NATS messaging and protocols
- **[Security Policy](./SECURITY.md)** - Vulnerability reporting and security guidelines

---

## 🤝 Community

- 🐛 **Found a bug?** Open an issue in the relevant repository
- 💡 **Have an idea?** Start a discussion or contribute!
- 🔒 **Security concern?** Email security@loqalabs.com (see [SECURITY.md](./SECURITY.md))
- ❓ **Questions?** Check the **[FAQ](./docs/faq.md)**
- 💖 **Support the project** via [GitHub Sponsors](https://github.com/sponsors/annabarnes1138) or [Ko-fi](https://ko-fi.com/annabarnes)

---

## 🌟 Why Loqa?

We believe voice assistants should be **powerful, private, and personal** — without surrendering your data to Big Tech surveillance.

> Local-first. Values-first. Your voice, your choice.

**[Contributing](./CONTRIBUTING.md)** • **[Code of Conduct](./CODE_OF_CONDUCT.md)** • **[AGPLv3 License](./LICENSE)**

---

*Created with 🧠 + ❤️ by [Anna Barnes](https://www.linkedin.com/in/annabethbarnes) — because voice assistants should serve you, not surveillance capitalism.*