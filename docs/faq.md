# ❓ Frequently Asked Questions

---

### 🤔 What is Loqa?

**Loqa** is a local-first, privacy-focused voice assistant.  
It runs on your own hardware and processes everything — from wake word detection to natural language understanding — entirely offline.

---

### 🔒 Does it use the cloud?

Nope! Loqa is designed to work completely offline.  
Future optional features may support limited, **opt-in** remote access, but the default experience is fully local.

---

### 🎤 What hardware do I need?

**For the Loqa Hub (required):**
- A computer or mini PC with 4+ CPU cores and 8GB+ RAM
- Docker installed

**For voice input (choose one):**
- Any USB microphone (for testing and development)
- DIY ESP32-based voice assistant device (build your own using our reference designs)
- Existing voice hardware like Home Assistant Voice Preview Edition (planned support)

> **🛠️ DIY-Friendly**: We don't manufacture hardware ourselves. Instead, we provide open-source firmware, reference designs, and assembly instructions so you can build your own voice assistant devices or use existing maker-friendly hardware.

---

### 🛠 Is this just for developers?

Not at all! While Loqa is still in early development and best suited for tinkerers, our long-term goal is to make it accessible to anyone who wants privacy-respecting voice control.

---

### 🧠 What models does it use?

- **Speech Recognition:** OpenAI-compatible STT services for offline transcription
- **LLM Parsing:** [`Ollama`](https://ollama.com) using Llama 3.2 3B by default (runs locally)

You can change the model by editing environment variables.

---

### 🔌 Does it work with Home Assistant?

We’re building an official Home Assistant skill!  
Loqa will support controlling HA devices via MQTT, REST, or WebSocket integrations.

---

### 🌍 Will it support multiple languages?

Eventually — yes. OpenAI-compatible STT services already support multilingual speech recognition, and we plan to extend Loqa's NLP capabilities to follow.

---

### 🧩 Can I build my own skills?

Yes! Loqa uses a message-based pub/sub system (NATS), so you can write skills in **any language** that speaks NATS.

A skill SDK and registry system are in development.

---

### 📡 Will there be a remote access or paid version?

Possibly. We're exploring optional remote access and cloud sync features as part of a **sustainability plan**.  
Loqa will **always be free and open-source at its core**, but advanced features may be offered via paid tiers to fund ongoing development.

---

### ❤️ Why the name “Loqa”?

It’s a mashup of **local** + **loquacious** (talkative).  
Plus it’s short, friendly, and unique — like the assistant it powers.

---

Still have questions?  
Open an issue in any relevant repository or contact anna@loqalabs.com!