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

## 🧱 How It Works

Loqa follows a local-first, modular architecture:

1. 🗣️ **Audio Puck** streams voice via gRPC
2. 📝 **Speech-to-Text** via Whisper.cpp
3. 🤖 **Intent Parsing** via LLM (Ollama)
4. 📡 **Commands Published** over NATS
5. 🏠 **Skills or Devices Respond** with actions

> 🎯 It’s like a tiny personal Alexa that runs entirely on your own terms.

![Mermaid Diagram Placeholder — See `architecture.md`](./docs/architecture.md)

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

## 📜 License

Loqa is licensed under the Apache License 2.0. See LICENSE for full details.

---

> Created with 🧠 + ❤️ by [Anna Barnes](https://www.linkedin.com/in/annabethbarnes), because voice assistants should serve *you* — not surveillance capitalism.