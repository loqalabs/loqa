[![Sponsor](https://img.shields.io/badge/Sponsor-Loqa-ff69b4?logo=githubsponsors&style=for-the-badge)](https://github.com/sponsors/annabarnes1138)
[![Ko-fi](https://img.shields.io/badge/Buy%20me%20a%20coffee-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white&style=for-the-badge)](https://ko-fi.com/annabarnes)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL--3.0-blue?style=for-the-badge)](LICENSE)
[![Made with ❤️ by Loqa Labs](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F-by%20LoqaLabs-ffb6c1?style=for-the-badge)](https://loqalabs.com)

![Loqa Social Preview](https://github.com/user-attachments/assets/99016e57-ace5-4140-a4f3-c49262f83253)

# 🦜 Loqa – A Rebellion Against the Cloud

🔉 A local-first voice assistant core — built for privacy, sub-300ms interaction, and extensibility. Designed to grow into ambient intelligence.

---

## 🌱 About Loqa Core

This repository contains **Loqa Core** — the foundational architecture for a local-first, privacy-preserving voice assistant.

It includes:

- Streaming audio capture and playback
- Arbitration between multiple relays
- Reflex intent parsing and local LLM fallback
- Plugin-based skill execution
- Fallback handling and Commander UI

### ❗This is not the final product

Loqa Core is the **scaffolding** — a solid base from which truly innovative interaction can grow.

We're building a platform that can one day support:

- Natural skill learning (teach Loqa by example)
- Long-term conversational memory
- Multi-agent collaboration across rooms
- Context-aware emotional intelligence

### 🧠 Our goal:

> “Build the foundation for the future of voice AI — not just another clone.”

Join us in shaping what comes next.

---

Loqa is an open-source, privacy-first voice platform for developers, makers, and tinkerers who believe voice interfaces should be as local and controllable as any keyboard or shell script. Run it where Big Tech can't listen.

> **Privacy isn't a feature — it's the architecture.**

---

## 🚀 Try It Now

**Get running in under 5 minutes with one command:**

```bash
curl -fsSL "https://raw.githubusercontent.com/loqalabs/loqa/main/tools/setup.sh?$(date +%s)" | bash
```

Then open http://localhost:5173 to see the voice assistant UI

**For voice testing:** Run `curl -fsSL "https://raw.githubusercontent.com/loqalabs/loqa/main/tools/test-voice.sh?$(date +%s)" | bash` to test with your microphone, or see the **[5-Minute Setup Guide](./docs/getting-started-5min.md)** for details.

👉 **Having issues?** Check **[Troubleshooting](./docs/troubleshooting.md)**

---

## ✨ What Makes Loqa Different

- 🧠 **State-of-the-art, not state-of-the-shelf** - WhisperX, streaming STT/LLM pipelines, experimental sandboxing. We're exploring what's next, not rebuilding Alexa
- 🧩 **Composable, not monolith** - Swap Piper for Dia or Moshi. Replace OpenAI's Whisper with Meta's SeamlessM4T. Use symbolic reasoning engines instead of Ollama. Every component is modular
- 🔒 **Privacy-first, always** - Nothing leaves your network unless you explicitly opt in. No metrics collection, no voice recording, no cloud surveillance
- 🌍 **Run from anywhere** - Your Raspberry Pi, air-gapped homelab, or offline cabin. Built for mobility and location independence
- 🛠️ **Hackable APIs and plugin SDK** - Write skills in Python, shell scripts, or WASM modules. Built for homelab and Raspberry Pi setups
- 💡 **Community-powered innovation** - We'd rather be the Blender of voice than the Salesforce. Think weird, prototype freely, take Loqa in unexpected directions

---

## 🧱 How Loqa Liberates Voice AI

1. **Your Voice** → Processed locally with cutting-edge models
2. **Your AI** → Experimental features and novel approaches
3. **Your Control** → Complete transparency and user autonomy
4. **Your Creativity** → Build experiences impossible elsewhere
5. **Your Privacy** → Data never leaves your control
6. **Your Innovation** → Contribute to the future of voice AI

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

## 🧮 Reference Hardware

All timing SLAs and performance benchmarks assume the following hardware:

| Role      | Device           | Cores | RAM   | Notes                               |
| --------- | ---------------- | ----- | ----- | ----------------------------------- |
| Hub       | Mac Mini M2      | 8     | 8GB   | Baseline for Standard tier SLAs     |
| Hub (Pro) | Mac Mini M2 Pro  | 10    | 16GB  | Used to validate Pro-tier targets   |
| Hub (R&D) | Mac Studio Ultra | 24    | 64GB  | Future chaining / NSL experiments   |
| Relay     | ESP32-S3         | 1     | 512KB | Constrained streaming target device |

All tests are run on real hardware. Loqa avoids cloud dependencies and GPU assumptions by design.

---

## 📖 Learn More

- [Getting Started Guide](./docs/getting-started-5min.md)
- [Architecture Overview](./docs/architecture.md)
- [Skills Development](./docs/skills.md)
- [FAQ](./docs/faq.md)
- [Security Policy](./SECURITY.md)

---

## 🏗️ Setup Options

See the [Setup Guide](./docs/getting-started-5min.md) for quick install instructions and dev setup.

---

## 🤝 Community

- 🐛 **Found a bug?** Open an issue in the relevant repository
- 💡 **Have an idea?** Start a discussion or contribute!
- 🔒 **Security concern?** Email security@loqalabs.com (see [SECURITY.md](./SECURITY.md))
- ❓ **Questions?** Check the **[FAQ](./docs/faq.md)**
- 💖 **Support the project** via [GitHub Sponsors](https://github.com/sponsors/annabarnes1138) or [Ko-fi](https://ko-fi.com/annabarnes)

---

## 🌟 Why Loqa Exists

Loqa isn't just another voice assistant — it's a **rebellion against the cloud**.

**For Developers**: Experiment with bleeding-edge voice AI without corporate gatekeepers  
**For Makers**: Build voice experiences that respect your values and creativity  
**For Privacy Advocates**: Prove that cutting-edge AI doesn't require surveillance capitalism  
**For Communities**: Own your voice technology instead of being owned by it

**Business second, autonomy first.** The OSS core will always be powerful, expressive, and self-sufficient.

**[Contributing](./CONTRIBUTING.md)** • **[Code of Conduct](./CODE_OF_CONDUCT.md)** • **[AGPLv3 License](./LICENSE)**

---

_Created with 🧠 + ❤️ by [Anna Barnes](https://www.linkedin.com/in/annabethbarnes) — because voice assistants should serve you, not surveillance capitalism._
