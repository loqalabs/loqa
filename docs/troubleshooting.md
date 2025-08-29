# 🔧 Troubleshooting Guide

Common issues and solutions for Loqa voice assistant platform.

## 🎤 Audio & Voice Issues

### Voice Not Detected

**Symptoms:** Puck client runs but doesn't respond to "Hey Loqa"

**Solutions:**
```bash
# Check microphone permissions (macOS)
# System Preferences → Security & Privacy → Privacy → Microphone

# Test microphone access
cd loqa-puck/test-go
DEBUG=1 go run ./cmd --hub localhost:50051

# Adjust wake word sensitivity
go run ./cmd --wake-word-sensitivity 0.5  # Lower = more sensitive
```

**Common Causes:**
- Microphone permissions not granted
- PortAudio not installed or configured
- Background noise interfering with detection
- Wake word sensitivity too high

### PortAudio Issues

**Error:** `fatal error: 'portaudio.h' file not found`

**Solutions:**
```bash
# macOS
brew install portaudio

# Ubuntu/Debian  
sudo apt-get install portaudio19-dev

# CentOS/RHEL
sudo yum install portaudio-devel

# Verify installation
pkg-config --cflags portaudio-2.0
```

### Audio Quality Problems

**Symptoms:** Poor speech recognition accuracy

**Solutions:**
- Use a dedicated USB microphone
- Reduce background noise
- Speak clearly and at normal volume
- Position microphone 6-12 inches from mouth
- Check audio sample rate: should be 16kHz

## 🐳 Docker & Container Issues

### Services Won't Start

**Error:** `Container name already in use`

**Solution:**
```bash
# Clean up existing containers
docker-compose down
docker system prune -f

# Restart fresh
docker-compose up -d
```

### Out of Memory Issues

**Error:** `killed` or containers randomly stopping

**Solutions:**
```bash
# Increase Docker memory limit (macOS)
# Docker Desktop → Preferences → Resources → Memory → 8GB+

# Check memory usage
docker stats

# Use smaller models
export OLLAMA_MODEL=llama3.2:1b  # Instead of 3b
```

### Port Conflicts

**Error:** `port is already allocated`

**Solutions:**
```bash
# Check what's using ports
lsof -i :4222,3000,50051,11434

# Kill conflicting processes
sudo kill -9 <PID>

# Or modify ports in docker-compose.yml
```

## 🧠 LLM & AI Issues

### Ollama Model Download Fails

**Error:** `failed to pull model`

**Solutions:**
```bash
# Manual model download
docker exec -it loqa-ollama ollama pull llama3.2:3b

# Check available space (models are ~2GB)
df -h

# Try smaller model
docker exec -it loqa-ollama ollama pull llama3.2:1b

# Check Ollama logs
docker-compose logs ollama
```

### Slow LLM Response

**Symptoms:** Long delays between voice command and device action

**Solutions:**
- Ensure adequate RAM (8GB+ recommended)
- Use faster CPU (8+ cores recommended)  
- Switch to smaller model
- Check Ollama is using GPU acceleration (if available)

**Optimization:**
```bash
# Monitor resource usage
docker stats loqa-ollama

# Use CPU optimization flags
export OLLAMA_NUM_THREAD=8  # Match your CPU cores
```

## 📡 NATS & Messaging Issues

### NATS Connection Failed

**Error:** `failed to connect to NATS`

**Solutions:**
```bash
# Check NATS is running
docker-compose ps nats

# Check NATS connectivity  
nats server check --server=nats://localhost:4222

# View NATS logs
docker-compose logs nats

# Restart NATS
docker-compose restart nats
```

### Messages Not Being Processed

**Symptoms:** Commands sent but devices don't respond

**Debug Steps:**
```bash
# Monitor NATS traffic
nats sub "loqa.>" --server=nats://localhost:4222

# Send manual test
nats pub loqa.devices.commands.lights '{
  "device_type": "lights",
  "action": "on",
  "location": "test"
}' --server=nats://localhost:4222

# Check device service logs
docker-compose logs device-service
```

## 🔧 Build & Development Issues

### Go Build Failures

**Error:** `whisper.h file not found`

**Solution:**
This is expected for hub service - use Docker build:
```bash
# Use Docker instead of local build
docker-compose build hub

# For local development, install whisper.cpp:
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
make
export CGO_CFLAGS="-I$(pwd)"
export CGO_LDFLAGS="-L$(pwd) -lwhisper"
```

### Module Dependency Issues

**Error:** `module not found`

**Solutions:**
```bash
# Update dependencies
go mod tidy

# Clear module cache
go clean -modcache

# Verify local module replacements
grep "replace" go.mod

# Re-download dependencies
go mod download
```

### Protocol Buffer Issues

**Error:** `protoc command not found`

**Solutions:**
```bash
# Install protoc
# macOS
brew install protobuf

# Ubuntu/Debian
sudo apt-get install protobuf-compiler

# Install Go plugins
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Regenerate protos
cd loqa-proto && ./generate.sh
```

## 🏠 Device & Integration Issues

### Device Commands Not Working

**Symptoms:** Voice commands recognized but devices don't respond

**Debug:**
```bash
# Check device service status
docker-compose logs device-service

# List available devices
# Look for "Device Status" in logs

# Send direct command
nats pub loqa.devices.commands.lights '{
  "device_type": "lights",
  "action": "on",
  "location": "kitchen"
}' --server=nats://localhost:4222
```

### Home Assistant Integration

**Common Issues:**
- Network connectivity between services
- Authentication tokens expired
- Home Assistant API changes

**Solutions:**
- Verify network connectivity
- Check Home Assistant API documentation
- Update skill configuration

## 🔍 Debugging Tips

### Enable Debug Logging

```bash
# Device service debug
NATS_URL="nats://localhost:4222" LOG_LEVEL=debug ./bin/device-service

# Hub service debug  
export LOG_LEVEL=debug
docker-compose up hub

# Puck client debug
DEBUG=1 go run ./cmd --hub localhost:50051
```

### Health Check Commands

```bash
# Overall system health
./health-check.sh

# Individual service health
curl http://localhost:3000/health  # Hub
nats server check --server=nats://localhost:4222  # NATS
curl http://localhost:11434/api/tags  # Ollama
```

### Log Analysis

```bash
# View all logs with timestamps
docker-compose logs -t

# Follow specific service logs
docker-compose logs -f hub device-service

# Search for errors
docker-compose logs | grep -i error

# Export logs for analysis  
docker-compose logs > loqa-debug.log 2>&1
```

## 📊 Performance Optimization

### System Requirements

**Minimum:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 10GB free
- Network: 100Mbps local

**Recommended:**
- CPU: 8+ cores with AVX2
- RAM: 16GB+  
- Storage: SSD with 20GB+ free
- Network: Gigabit local

### Resource Monitoring

```bash
# Container resource usage
docker stats

# System resource usage  
htop  # or top

# Disk usage
du -sh loqa-* whisper-models/

# Network usage
iftop  # or netstat -i
```

## 🆘 Getting Help

### Collect Debug Information

Before reporting issues:

```bash
# System information
./collect-debug-info.sh > debug-report.txt

# Or manually:
echo "=== System Info ===" > debug-report.txt
uname -a >> debug-report.txt
docker --version >> debug-report.txt
go version >> debug-report.txt

echo "=== Service Status ===" >> debug-report.txt  
docker-compose ps >> debug-report.txt

echo "=== Recent Logs ===" >> debug-report.txt
docker-compose logs --tail=50 >> debug-report.txt
```

### Where to Get Help

- 🐛 **Bug Reports**: GitHub Issues in relevant repository
- 💬 **Questions**: GitHub Discussions 
- 📧 **Security Issues**: security@loqalabs.com
- 📖 **Documentation**: [docs.loqalabs.com](https://loqalabs.github.io/loqa)

### Issue Templates

Use the appropriate issue template:
- Bug Report: For functional issues
- Feature Request: For new capabilities
- Skill Request: For new voice skills

---

## ✅ Quick Fixes Checklist

When Loqa isn't working:

1. ☐ Restart all services: `docker-compose restart`
2. ☐ Check available disk space: `df -h`
3. ☐ Verify microphone permissions  
4. ☐ Test with manual NATS command
5. ☐ Check Docker memory allocation
6. ☐ Review logs for error messages
7. ☐ Verify port availability
8. ☐ Test with smaller LLM model
9. ☐ Clear Docker caches if needed
10. ☐ Restart Docker if all else fails

**Still having issues?** Open a GitHub issue with your debug information!