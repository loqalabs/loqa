# 🚀 Get Loqa Running in 5 Minutes

The fastest way to experience Loqa's local-first voice assistant capabilities, including the real-time voice command timeline interface.

## ✅ Prerequisites (30 seconds)

```bash
# Verify you have Docker and Docker Compose
docker --version && docker-compose --version
```

**Requirements:**
- Docker & Docker Compose
- curl

## 🏃‍♂️ Complete System Setup (4 minutes)

**Just copy and paste this single command:**

```bash
curl -fsSL "https://raw.githubusercontent.com/loqalabs/loqa/main/setup.sh?$(date +%s)" | bash
```

That's it! This command:
- Downloads the setup script
- Downloads the Docker Compose configuration  
- Pulls all pre-built images
- Starts all services automatically

### Alternative: Full Repository
If you prefer to have the full repository locally:

```bash
git clone https://github.com/loqalabs/loqa.git && cd loqa && ./setup.sh
```

This automatically:
- 🐳 Starts NATS, Ollama, Hub, Device services, and Timeline UI
- 🤖 Downloads Llama 3.2 3B model
- 📝 Sets up Whisper.cpp for speech recognition
- 💡 Configures simulated smart devices
- 📊 Launches web interface at http://localhost:5173

## 🎤 Test Voice Commands (2-3 minutes)

The containerized test puck cannot access your microphone. For real voice testing, you need to run the test puck on your host system:

### Option 1: Quick Container Test (gRPC connection only)
```bash
# Start the test puck container (no audio, just connection testing)
docker-compose --profile testing up -d test-puck

# Check connection status
docker logs loqa-test-puck
```

### Option 2: Real Voice Testing (Recommended)
Use the automated voice testing script:

```bash
curl -fsSL "https://raw.githubusercontent.com/loqalabs/loqa/main/test-voice.sh?$(date +%s)" | bash
```

The script will:
- Check for Go and Git
- Clone the loqa-puck repository
- Install dependencies
- Start the test puck with microphone access
- Show you example voice commands to try

**Manual approach** (if you prefer):
```bash
# Clone the test puck repository
git clone https://github.com/loqalabs/loqa-puck.git
cd loqa-puck/test-go

# Install Go dependencies
go mod download

# Run the test puck with microphone access
go run ./cmd -hub localhost:50051

# Now speak these commands near your microphone:
# "Hey Loqa, turn on the kitchen lights"
# "Hey Loqa, play music in the living room"  
# "Hey Loqa, turn off all lights"
```

**Expected behavior:**
1. 🎤 See "Voice detected!" in the terminal when you speak
2. 📝 Watch speech-to-text conversion in real-time
3. 🤖 See LLM parse your intent and extract commands
4. 💡 Observe device actions in the service logs
5. 📊 **Watch events appear instantly in the Timeline UI at http://localhost:5173**

## 🔍 Verify It's Working (1 minute)

**Check All Services:**
```bash
# Check all services are running (including Timeline UI)
docker-compose ps

# Watch the logs
docker-compose logs -f hub device-service observer
```

**Check Timeline UI:**
1. Open http://localhost:5173 in your browser
2. You should see the "Voice Command Timeline" interface
3. After speaking commands, events will appear showing:
   - 📝 **Transcription** of what you said
   - 🎯 **Intent** parsed by the AI (e.g., "turn_on_lights") 
   - 📊 **Confidence** score for the recognition
   - ✅/❌ **Success/failure** status
   - 🔊 **Audio playback** of your original voice command
   - 📋 **Full event data** when you click for details

**Manual Testing:**
```bash
# Test manual device command (will also appear in timeline)
nats pub loqa.devices.commands.lights '{
  "device_type": "lights",
  "action": "on", 
  "location": "bedroom"
}' --server=nats://localhost:4222
```

## 🎯 What You Just Experienced

**Complete Voice-to-Visualization Pipeline:**
- 🗣️ **Voice Input** → Puck captures audio via microphone
- 📡 **gRPC Streaming** → Audio sent to Hub service  
- 📝 **Speech-to-Text** → Whisper.cpp converts to text
- 🧠 **Intent Parsing** → Ollama LLM extracts commands
- 💾 **Event Storage** → Hub records structured event data in SQLite
- 📨 **Message Routing** → NATS delivers to device service
- 🏠 **Device Control** → Smart home devices respond
- 📊 **Real-time UI** → Timeline interface shows all events via API

**All Local & Private:**
- ✅ No cloud services involved
- ✅ No data leaves your network
- ✅ Full offline functionality
- ✅ Sub-2-second response times
- ✅ Complete observability of all voice interactions

## 🛠️ Next Steps

### For Users
- **Timeline UI**: Explore dark mode, event filtering, and analytics
- **Add Real Devices**: Configure Home Assistant integration
- **Create Custom Skills**: Extend with your own voice commands

### For Developers
- 🛠️ **[Developer Guide](./DEVELOPER.md)** - Development setup, testing, and contributing
- 🏗️ **[Architecture Deep Dive](./architecture.md)** - System design and technical details
- 🧩 **[Build Your First Skill](./skills.md)** - Skills development guide

### Learn More
- 📖 [Full Documentation](./quickstart.md)
- 🔧 [Configuration Guide](./config.md)

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

## 📱 What You've Built

You now have a complete local-first voice assistant system running:

**🎤 Voice Processing Stack:**
- Puck client using your laptop's microphone/speakers
- Hub service processing speech-to-text and intent parsing
- Device service controlling smart home devices (simulated)
- Timeline UI automatically running at http://localhost:5173

**📊 Complete Observability:**
- Real-time web interface showing all voice interactions
- Event details with transcriptions, intents, and confidence scores
- Audio playback and full JSON event inspection
- Dark mode support and auto-refresh

**🔒 Privacy-First:**
- Everything runs on your local network
- No data sent to external services
- Complete control and ownership of your voice data

**🎉 Congratulations!** You're now running a complete local-first voice assistant that rivals commercial solutions — but respects your privacy.

*Average setup time: 4-5 minutes on modern hardware*