# 🚀 Get Loqa Running in 5 Minutes

The fastest way to experience Loqa's local-first voice assistant capabilities.

## ✅ Prerequisites (30 seconds)

```bash
# Verify you have Docker and Docker Compose
docker --version && docker-compose --version

# Verify Go 1.21+ (for puck testing)
go version
```

**Requirements:**
- Docker & Docker Compose
- Go 1.21+ (for voice testing)
- PortAudio (`brew install portaudio` on macOS)

## 🏃‍♂️ One-Command Setup (2 minutes)

```bash
# Clone and start the complete system
git clone https://github.com/loqalabs/loqa-labs.git
cd loqa-labs
./setup.sh
```

This automatically:
- 🐳 Starts NATS, Ollama, Hub, and Device services
- 🤖 Downloads Llama 3.2 3B model
- 📝 Sets up Whisper.cpp for speech recognition
- 💡 Configures simulated smart devices

## 🎤 Test Voice Commands (1 minute)

```bash
# Start the voice client
cd loqa-puck/test-go
go run ./cmd --hub localhost:50051

# Speak these commands:
# "Hey Loqa, turn on the kitchen lights"
# "Hey Loqa, play music in the living room"
# "Hey Loqa, turn off all lights"
```

**Expected behavior:**
1. 🎤 See "Voice detected!" when you speak
2. 📝 Watch speech-to-text conversion
3. 🤖 See LLM parse your intent
4. 💡 Observe device actions in logs

## 🔍 Verify It's Working (1 minute)

```bash
# Check all services are running
docker-compose ps

# Watch the logs
docker-compose logs -f hub device-service

# Test manual device command
nats pub loqa.devices.commands.lights '{
  "device_type": "lights",
  "action": "on", 
  "location": "bedroom"
}' --server=nats://localhost:4222
```

## 🎯 What You Just Experienced

**Complete Voice Pipeline:**
- 🗣️ **Voice Input** → Puck captures audio via microphone
- 📡 **gRPC Streaming** → Audio sent to Hub service  
- 📝 **Speech-to-Text** → Whisper.cpp converts to text
- 🧠 **Intent Parsing** → Ollama LLM extracts commands
- 📨 **Message Routing** → NATS delivers to device service
- 🏠 **Device Control** → Smart home devices respond

**All Local & Private:**
- ✅ No cloud services involved
- ✅ No data leaves your network
- ✅ Full offline functionality
- ✅ Sub-2-second response times

## 🛠️ Next Steps

### Customize Your Setup
- **Add Real Devices**: Configure Home Assistant integration
- **Build Hardware Pucks**: Deploy ESP32 firmware
- **Create Custom Skills**: Extend with your own voice commands
- **Production Deploy**: Use Kubernetes or Docker Swarm

### Learn More
- 📖 [Full Documentation](./quickstart.md)
- 🏗️ [Architecture Deep Dive](./architecture.md)  
- 🔧 [Configuration Guide](./config.md)
- 🧩 [Build Your First Skill](./skills.md)

## 🛑 Stop Everything

```bash
# Clean shutdown
docker-compose down
```

---

## ❓ Troubleshooting

**Voice not detected?**
- Check microphone permissions
- Verify PortAudio installation: `brew install portaudio`
- Speak clearly and wait for "🎤 Voice detected!" message

**Docker issues?**
- Ensure Docker has sufficient memory (8GB+ recommended)
- Check port conflicts: `lsof -i :4222,3000,50051,11434`

**LLM responses slow?**
- First run downloads 2GB model (one-time)
- Ensure sufficient CPU/RAM (4+ cores, 8GB+ RAM recommended)
- Consider using smaller model: `OLLAMA_MODEL=llama3.2:1b`

---

**🎉 Congratulations!** You're now running a complete local-first voice assistant that rivals commercial solutions — but respects your privacy.

*Average setup time: 3-4 minutes on modern hardware*