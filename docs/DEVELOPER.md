# 🛠️ Loqa Developer Guide

This guide covers everything you need to know for developing with, contributing to, or extending the Loqa voice assistant platform.

---

## 📦 Repository Structure

The Loqa platform consists of multiple focused repositories that work together:

### Core Services
| Repository | Purpose | Status |
|------------|---------|---------|
| **[loqa-hub](https://github.com/loqalabs/loqa-hub)** | Central orchestrator: gRPC API, STT/LLM pipeline, NATS integration | ✅ Active |
| **[loqa-device-service](https://github.com/loqalabs/loqa-device-service)** | Device control service that listens on NATS for commands | ✅ Active |
| **[loqa-relay](https://github.com/loqalabs/loqa-relay)** | DIY hardware reference designs, firmware, and test clients | ✅ Active |
| **[loqa-proto](https://github.com/loqalabs/loqa-proto)** | Shared gRPC protocol definitions and generated bindings | ✅ Active |

### Extensions & Documentation  
| Repository | Purpose | Status |
|------------|---------|---------|
| **[loqa-skills](https://github.com/loqalabs/loqa-skills)** | Official and sample skills packaged as external services | 🏗️ In Development |
| **[loqa](https://github.com/loqalabs/loqa)** | User and developer-facing documentation & main entry point | ✅ Active |

---

## 🏗️ Development Workflow

### Quick Development Setup

For developers who want to build from source and modify the code:

```bash
git clone https://github.com/loqalabs/loqa.git
cd loqa && ./tools/setup-dev.sh
```

This automatically:
- Clones all Loqa repositories
- Sets up STT service container
- Builds Docker images from source
- Starts all services in development mode

### User Setup (Pre-built Images)

For users who just want to run Loqa without development:

```bash
git clone https://github.com/loqalabs/loqa.git
cd loqa && ./setup.sh
```

### Alternative: Individual Repository Setup

For advanced users who want to work with individual repositories:

```bash
# Core services
git clone https://github.com/loqalabs/loqa-hub.git
git clone https://github.com/loqalabs/loqa-device-service.git  
git clone https://github.com/loqalabs/loqa-relay.git
# Note: loqa-proto is automatically handled via Go modules (v0.0.17+)

# Documentation and skills
git clone https://github.com/loqalabs/loqa.git
git clone https://github.com/loqalabs/loqa-skills.git

# Use docker-compose from loqa-hub for orchestration
cd loqa-hub
docker-compose up -d
```

### Development Commands

For multi-repository development, use the Makefile in the `tools/` directory:

```bash
cd loqa/tools/

make setup-dev # Development setup (build from source)
make build     # Build all Docker images  
make start-dev # Start development services
make test      # Run test suite across all repos
make dev       # Start development environment with status
make logs      # View service logs
make help      # See all available commands
```

### Testing Voice Commands (Development)

After running development setup, test with the local relay:

```bash
# Navigate to the test relay
cd loqa-relay/test-go

# Start the voice client (connects to Hub at localhost:50051)
go run ./cmd --hub localhost:50051

# Speak these commands:
# "Hey Loqa, turn on the kitchen lights"
# "Hey Loqa, play music in the living room"
# "Hey Loqa, turn off all lights"
```

**Expected behavior:**
1. 🎤 See "Voice detected!" in the terminal when you speak
2. 📝 Watch speech-to-text conversion in real-time
3. 🤖 See LLM parse your intent and extract commands
4. 💡 Observe device actions in the service logs
5. 📊 Watch events appear instantly in the Timeline UI at http://localhost:5173

---

## 📋 System Requirements

### Minimum Development Environment
- **CPU**: 4+ cores
- **RAM**: 8GB+ 
- **Storage**: 10GB+ for models
- **OS**: Linux, macOS, or Windows with Docker

### Recommended Development Setup  
- **CPU**: 8+ cores with AVX2 support
- **RAM**: 16GB+
- **Storage**: SSD with 20GB+ free space
- **Network**: Isolated network segment for testing
- **Tools**: Docker, Go 1.24+, Protocol Buffers compiler

---

## 🧩 Skills Development

Loqa uses a flexible skill system that allows custom commands, behaviors, and integrations — all locally hosted, with simple metadata and message contracts.

### Planned Skills Examples
- 🔌 Home Assistant bridge
- 📓 Journaling / notes
- 🎵 Media playback (local or optional remote)
- 🧠 AI chat / memory assistant

### Creating Skills

Skills communicate via NATS pub/sub, so you can write them in **any language** that has NATS support.

👉 **[Complete Skills Development Guide](./skills.md)**

---

## 🚀 Contributing

We welcome contributions to any part of the Loqa ecosystem!

### Getting Started
1. Read our **[Contributing Guidelines](../CONTRIBUTING.md)**
2. Check the **[Code of Conduct](../CODE_OF_CONDUCT.md)**
3. Review our **[Security Policy](./security.md)**

### Development Process
1. Fork the relevant repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request with detailed description

### Code Standards
- Follow existing code style in each repository
- Add tests for new functionality
- Update documentation for user-facing changes
- Use meaningful commit messages

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

## 🛣️ Development Roadmap

### Completed ✅
- [x] Core platform (STT, LLM, gRPC, NATS)
- [x] Test relay with wake word and VAD
- [x] Multi-repository architecture
- [x] Docker-based development environment

### In Progress 🏗️
- [ ] Home Assistant integration skill
- [ ] Skill framework (load, metadata, lifecycle)
- [ ] ESP32 relay firmware (local wake word)

### Future Plans 🚀
- [ ] Premium remote access tier (opt-in)
- [ ] Skill marketplace (revenue sharing model)
- [ ] Mobile companion app
- [ ] Multi-language support

---

## 📚 Technical Documentation

### Core Architecture
- **[Architecture Overview](./architecture.md)** – System design and data flows
- **[Message Bus Guide](./messaging.md)** – NATS subjects and protocols
- **[Configuration](./config.md)** – Environment variables and settings

### Development Tools
- **[Testing Guide](./testing.md)** – Test tools, frameworks, and best practices
- **[Hardware Guide](./hardware.md)** – ESP32 relay development and firmware

### User Documentation
- **[Quickstart Guide](./quickstart.md)** – Complete setup instructions
- **[5-Minute Setup](./getting-started-5min.md)** – Fastest way to try Loqa
- **[Troubleshooting](./troubleshooting.md)** – Common issues and solutions
- **[FAQ](./faq.md)** – Frequently asked questions

---

## 🤝 Community & Support

### Getting Help
- 🐛 **Bug Reports**: Open issues in the relevant repository
- 💡 **Feature Requests**: Start a GitHub Discussion
- 📧 **Security Issues**: Email anna@loqalabs.com privately
- 💬 **General Questions**: Check the [FAQ](./faq.md) first

### Contributing
- **Code**: Submit pull requests with clear descriptions
- **Documentation**: Help improve guides and examples
- **Testing**: Test on different platforms and report issues
- **Community**: Help answer questions and welcome new contributors

---

*This guide is a living document. Help us improve it by submitting suggestions or corrections!*