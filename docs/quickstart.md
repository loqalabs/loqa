# 🚀 Quickstart Guide

Welcome to **Loqa** — a local-first, privacy-respecting voice assistant platform. This guide will help you get up and running quickly using Docker or local development tools.

---

## 🧰 Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Go 1.21+](https://go.dev/dl/) (for development)
- PortAudio (for voice testing)

**Optional (for full local LLM/STT):**
- [`ollama`](https://ollama.com/) – Local LLM runner
- [`natscli`](https://docs.nats.io/running-a-nats-service/nats-tools/natscli) – CLI for inspecting the NATS message bus

---

## 🐳 Run with Docker

Recommended for first-time users:

```bash
git clone https://github.com/YOUR_USERNAME/loqa.git
cd loqa/deployments
docker-compose up -d
```

This launches:
- NATS message bus
- Ollama with Llama 3.2 model
- Hub service (STT, LLM, command parsing)
- Device service (simulated smart home devices)

---

## 🎤 Run the Test Puck (Voice Input)

From the root directory:

```bash
./tools/run-test-puck.sh
```

> This will:
> - Compile and run a Go-based voice client
> - Connect to the Hub via gRPC
> - Start listening for "Hey Loqa" and voice commands

### 🔧 Requires PortAudio

- **macOS:** `brew install portaudio`
- **Ubuntu/Debian:** `sudo apt install portaudio19-dev`

---

## 🛠️ Local Development (Go-Based)

Want to run services manually for development?

### 1. Start dependencies

```bash
cd deployments
docker-compose up -d nats ollama
```

### 2. Run the Hub service

```bash
cd ../hub/loqa-hub
export MODEL_PATH="/tmp/whisper.cpp/models/ggml-tiny.bin"
export OLLAMA_URL="http://localhost:11434"
export NATS_URL="nats://localhost:4222"
go run ./cmd
```

### 3. Run the Device Service

```bash
NATS_URL="nats://localhost:4222" go run ./cmd/device-service
```

### 4. Launch the Test Puck

```bash
cd ../../puck/test-go
go build -o test-puck ./cmd
./test-puck --hub localhost:50051 --id test-puck-001
```

---

## 🧪 Voice Testing Tips

- Wait for 🎤 `Voice detected!` in the logs
- Use **"Hey Loqa"** as the wake phrase
- Try simple commands like:
  - “Hello”
  - “Turn on the kitchen lights”
- If audio doesn't work, check microphone permissions and PortAudio setup

---

## 🔍 Debugging Tools

### NATS CLI (optional)

```bash
# Install
go install github.com/nats-io/natscli/nats@latest

# Watch for voice command messages
nats sub "loqa.voice.commands" --server=nats://localhost:4222

# Watch device messages
nats sub "loqa.devices.commands.*" --server=nats://localhost:4222
```

### Manually publish a test command

```bash
nats pub loqa.devices.commands.lights '{
  "device_type": "lights",
  "action": "on", 
  "location": "kitchen",
  "request_id": "test-123"
}' --server=nats://localhost:4222
```

---

## 📄 Next Steps

- Learn how it all fits together: [`architecture.md`](./architecture.md)
- Build your own skill: [`skills.md`](./skills.md)
- Customize behavior and models: [`config.md`](./config.md)

---

> Built with 🧠 and ⚙️ by curious tinkerers — for tinkerers.