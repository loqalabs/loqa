![Loqa Social Preview](https://github.com/user-attachments/assets/99016e57-ace5-4140-a4f3-c49262f83253)

# 🦜 Loqa – A Local-First Voice Assistant

**Loqa** is a privacy-respecting, local-first voice assistant platform. It’s designed to be fully functional without the cloud — giving you fast, private, and intelligent voice interaction that runs on your own devices.

Whether you're automating your smart home, talking to a local journaling assistant, or building custom voice tools, Loqa is built to give you full control — with zero Big Tech dependency.

---

## ✨ Features

- 🧠 **Natural Voice Control** with Whisper.cpp + Ollama LLM
- 🏠 **Home Assistant Integration** (planned as first major skill)
- 📦 **Modular Skills System** with opt-in extensions
- 🎙️ **Edge Audio Devices ("Pucks")** using ESP32 or test clients
- 🔁 **Event-Driven Architecture** using NATS pub/sub
- 🚫 **Privacy-First by Design** — local-first, no cloud required

---

## 🚀 Try It Out

### ⚡ **New User? Start Here!**
👉 **[Get Running in 5 Minutes](./docs/getting-started-5min.md)** ← Fastest way to try Loqa

### 🛠️ **Developer Setup**
👉 **[Detailed Quickstart Guide](./docs/quickstart.md)** ← Full setup and configuration

### 🏃‍♂️ **One-Command Demo:**
```bash
git clone https://github.com/loqalabs/loqa.git
cd loqa && ./scripts/setup.sh

# Test voice: "Hey Loqa, turn on the lights"
```

---

## 📦 Repository Structure

The Loqa platform consists of multiple focused repositories that work together:

### Core Services
| Repository | Purpose | Status |
|------------|---------|---------|
| **[loqa-hub](https://github.com/loqalabs/loqa-hub)** | Central orchestrator: gRPC API, STT/LLM pipeline, NATS integration | ✅ Active |
| **[loqa-device-service](https://github.com/loqalabs/loqa-device-service)** | Device control service that listens on NATS for commands | ✅ Active |
| **[loqa-puck](https://github.com/loqalabs/loqa-puck)** | Embedded and test clients for audio capture and streaming | ✅ Active |
| **[loqa-proto](https://github.com/loqalabs/loqa-proto)** | Shared gRPC protocol definitions and generated bindings | ✅ Active |

### Extensions & Documentation  
| Repository | Purpose | Status |
|------------|---------|---------|
| **[loqa-skills](https://github.com/loqalabs/loqa-skills)** | Official and sample skills packaged as external services | 🏗️ In Development |
| **[loqa](https://github.com/loqalabs/loqa)** | User and developer-facing documentation & main entry point | ✅ Active |

---

## 🧱 How It Works

Loqa follows a local-first, modular architecture:

1. 🗣️ **Audio Puck** streams voice via gRPC
2. 📝 **Speech-to-Text** via Whisper.cpp
3. 🤖 **Intent Parsing** via LLM (Ollama)
4. 📡 **Commands Published** over NATS
5. 🏠 **Skills or Devices Respond** with actions

> 🎯 It’s like a tiny personal Alexa that runs entirely on your own terms.

👉 **[Complete Architecture Details](./docs/architecture.md)** with system diagram and data flows

---

## 🧩 Skill System (WIP)

Loqa uses a flexible skill system that allows custom commands, behaviors, and integrations — all locally hosted, with simple metadata and message contracts.

Planned examples:
- 🔌 Home Assistant bridge
- 📓 Journaling / notes
- 🎵 Media playback (local or optional remote)
- 🧠 AI chat / memory assistant

👉 Details in [`docs/skills.md`](./docs/skills.md)

---

## 📋 System Requirements

### Minimum
- **CPU**: 4+ cores
- **RAM**: 8GB+ 
- **Storage**: 10GB+ for models
- **OS**: Linux, macOS, or Windows with Docker

### Recommended  
- **CPU**: 8+ cores with AVX2 support
- **RAM**: 16GB+
- **Storage**: SSD for model loading performance
- **Network**: Isolated network segment for privacy

---

## 🏗️ Development Workflow

The main setup script handles everything automatically, but for advanced users who want to work with individual repositories:

### Alternative: Individual Repository Setup

If you prefer to work with individual repositories:

```bash
# Core services
git clone https://github.com/loqalabs/loqa-hub.git
git clone https://github.com/loqalabs/loqa-device-service.git  
git clone https://github.com/loqalabs/loqa-puck.git
git clone https://github.com/loqalabs/loqa-proto.git

# Documentation
git clone https://github.com/loqalabs/loqa.git

# Use docker-compose from loqa-hub for orchestration
cd loqa-hub
docker-compose up -d
```

### Development Commands
For multi-repository development, use the Makefile in the `scripts/` directory:

```bash
cd loqa/scripts/

make setup    # Initial setup and model download
make build    # Build all Docker images  
make start    # Start all services
make test     # Run test suite across all repos
make dev      # Start development environment with status
make logs     # View service logs
make help     # See all available commands
```

---

## 💸 Sustainability + Future Plans

Loqa is free and open by default — and it always will be.

That said, building high-quality privacy software takes time, and we want Loqa to be sustainable. In the future, we plan to offer optional **paid features** that support development:

- 📡 Remote access to your system
- ☁️ Cloud backups of settings or skill data
- 🪄 Premium skill packs or dashboards
- 🛠️ Loqa-hosted instances for those who don't want to self-host

These features will be **opt-in**, transparent, and built with the same values of user control and data sovereignty.

> 🤝 Local-first. Values-first. Sustainability through trust.

---

## 🛣️ Roadmap

- [x] Core platform (STT, LLM, gRPC, NATS)
- [x] Test puck with wake word and VAD
- [ ] Home Assistant integration skill
- [ ] Skill framework (load, metadata, lifecycle)
- [ ] ESP32 puck firmware (local wake word)
- [ ] Premium remote access tier (opt-in)
- [ ] Skill marketplace (revenue sharing model)

---

## 👩‍💻 Developer Docs

Want to build with or contribute to Loqa? Start here:

### 🚀 **Getting Started**
- [`docs/getting-started-5min.md`](./docs/getting-started-5min.md) – 5-minute setup
- [`docs/quickstart.md`](./docs/quickstart.md) – Detailed setup guide
- [`docs/troubleshooting.md`](./docs/troubleshooting.md) – Common issues & fixes

### 🏗️ **Architecture & Development**
- [`docs/architecture.md`](./docs/architecture.md) – System overview
- [`docs/config.md`](./docs/config.md) – Environment variables
- [`docs/messaging.md`](./docs/messaging.md) – NATS subjects & flows
- [`docs/testing.md`](./docs/testing.md) – Test tools & CLI commands

### 🧩 **Extensions**
- [`docs/skills.md`](./docs/skills.md) – Skill format and framework
- [`docs/hardware.md`](./docs/hardware.md) – Puck hardware (ESP32)

---

## 🤝 Contributing

We welcome contributions to any part of the Loqa ecosystem! Please see:

- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./docs/security.md)

## 💬 Community & Support

- 🐛 **Bug Reports**: Open issues in the relevant repository
- 💡 **Feature Requests**: Discuss in GitHub Discussions  
- 📧 **Security Issues**: Email anna@loqalabs.com
- 💬 **General Questions**: Check the [FAQ](./docs/faq.md)

---

## 📜 License

Loqa is licensed under the Apache License 2.0. See LICENSE for full details.

## 🌟 Vision

Loqa exists to reclaim voice computing for the people. We believe voice assistants can be **powerful, private, and personal** — without requiring you to surrender your data to Big Tech.

> Local-first. Values-first. Sustainability through trust.

---

**Created with 🧠 + ❤️ by [Anna Barnes](https://www.linkedin.com/in/annabethbarnes)**  
*Because voice assistants should serve you — not surveillance capitalism.*