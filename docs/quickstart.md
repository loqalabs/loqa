# 🚀 Quickstart Guide

Welcome to **Loqa** — a local-first, privacy-respecting voice assistant platform. This guide will help you get up and running quickly using Docker or local development tools.

---

## 🧰 Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Go 1.24+](https://go.dev/dl/) (for development)
- PortAudio (for voice testing)

**Optional (for full local LLM/STT):**
- [`ollama`](https://ollama.com/) – Local LLM runner
- [`natscli`](https://docs.nats.io/running-a-nats-service/nats-tools/natscli) – CLI for inspecting the NATS message bus

---

## 🚀 Quick Start Options

### ⚡ **5-Minute Setup** (Recommended)
For the fastest experience, follow our streamlined guide:

👉 **[Get Loqa Running in 5 Minutes](./getting-started-5min.md)**

### 🐳 **Docker Setup** (Standard)
```bash
git clone https://github.com/loqalabs/loqa-labs.git
cd loqa-labs
./setup.sh
```

This launches:
- NATS message bus
- Ollama with Llama 3.2 model
- Hub service (STT, LLM, command parsing)
- Device service (simulated smart home devices)

---

## 🎤 Run the Test Relay (Voice Input)

From the root directory:

```bash
./tools/run-test-relay.sh
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
export STT_URL="http://localhost:8000"
export OLLAMA_URL="http://localhost:11434"
export NATS_URL="nats://localhost:4222"
go run ./cmd
```

### 3. Run the Device Service

```bash
NATS_URL="nats://localhost:4222" go run ./cmd/device-service
```

### 4. Launch the Test Relay

```bash
cd ../../relay/test-go
go build -o test-relay ./cmd
./test-relay --hub localhost:50051 --id test-relay-001
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

## 🆘 Having Issues?

If you encounter problems, check our comprehensive troubleshooting guide:

👉 **[Troubleshooting Guide](./troubleshooting.md)**

Common quick fixes:
- Restart services: `docker-compose restart`
- Check microphone permissions
- Verify PortAudio installation: `brew install portaudio`

## 📄 Next Steps

- ⚡ **Quick Start**: [`getting-started-5min.md`](./getting-started-5min.md)
- 🏗️ **Architecture**: [`architecture.md`](./architecture.md)
- 🧩 **Build Skills**: [`skills.md`](./skills.md)
- ⚙️ **Configuration**: [`config.md`](./config.md)
- 🔧 **Troubleshooting**: [`troubleshooting.md`](./troubleshooting.md)

---

> Built with 🧠 and ⚙️ by curious tinkerers — for tinkerers.