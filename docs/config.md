# ⚙️ Configuration

Configuration options and environment variables for Loqa services.

## Environment Variables

### Hub Service

| Variable | Description | Default |
|----------|-------------|---------|
| `STT_URL` | OpenAI-compatible STT service URL | `http://stt:8000` |
| `TTS_URL` | TTS service base URL (OpenAI-compatible) | `http://tts:8880/v1` |
| `TTS_VOICE` | Voice ID (provider-specific) | `af_bella` |
| `TTS_SPEED` | Speech speed multiplier (0.5-2.0) | `1.0` |
| `TTS_FORMAT` | Audio format (mp3, wav, opus, flac) | `wav` |
| `TTS_NORMALIZE` | Enable audio normalization | `true` |
| `TTS_MAX_CONCURRENT` | Max concurrent TTS requests | `10` |
| `TTS_TIMEOUT` | Request timeout | `10s` |
| `TTS_FALLBACK_ENABLED` | Enable graceful fallback | `true` |
| `OLLAMA_URL` | Ollama API endpoint | `http://localhost:11434` |
| `NATS_URL` | NATS server connection string | `nats://localhost:4222` |
| `GRPC_PORT` | gRPC server port for audio | `50051` |
| `HTTP_PORT` | HTTP API port | `3000` |
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |

### Device Service

| Variable | Description | Default |
|----------|-------------|---------|
| `NATS_URL` | NATS server connection string | `nats://localhost:4222` |
| `LOG_LEVEL` | Logging level | `info` |
| `DEVICE_CONFIG_PATH` | Path to device configuration | `./devices.yaml` |

### Relay (Go Test Client)

| Variable | Description | Default |
|----------|-------------|---------|
| `HUB_GRPC_ENDPOINT` | Hub gRPC endpoint | `localhost:50051` |
| `RELAY_ID` | Unique identifier for relay | `test-relay-001` |
| `WAKE_WORD_SENSITIVITY` | Wake word detection sensitivity | `0.8` |
| `AUDIO_SAMPLE_RATE` | Audio sample rate | `16000` |

## Configuration Files

### Docker Compose

The main configuration is handled via `docker-compose.yml`:

```yaml
services:
  hub:
    environment:
      - STT_URL=http://stt:8000
      - TTS_URL=http://tts:8880/v1
      - TTS_VOICE=af_bella
      - TTS_SPEED=1.0
      - TTS_FORMAT=wav
      - TTS_NORMALIZE=true
      - TTS_MAX_CONCURRENT=10
      - TTS_TIMEOUT=10s
      - TTS_FALLBACK_ENABLED=true
      - OLLAMA_URL=http://ollama:11434
      - NATS_URL=nats://nats:4222
```

### Device Configuration

Devices are configured via YAML:

```yaml
devices:
  lights:
    kitchen:
      type: hue_bulb
      ip: 192.168.1.100
    living_room:
      type: smart_switch
      ip: 192.168.1.101
```

## Model Configuration

### STT Models

The STT service supports various models through the OpenAI-compatible API:
- `tiny` - Fastest, lower accuracy
- `base` - Balanced speed/accuracy
- `small` - Better accuracy, slower
- `medium` - High accuracy, much slower

### LLM Models

Ollama models for intent parsing:
- `llama3.2:3b` - Default, good balance
- `llama3.2:1b` - Faster, lower resource usage
- `llama3.2:8b` - Better understanding, more resources

### TTS Models

The TTS system uses OpenAI-compatible API with professional voice synthesis. Current implementation uses Kokoro-82M:

**Available Voices** (provider-specific):
- **af_bella** - Default female voice, clear and expressive
- **af_sarah** - Alternative female voice option  
- **am_adam** - Male voice (if available in your deployment)

**Configuration Options**:
- **Speed Control**: 0.5x to 2.0x playback speed
- **Format Options**: MP3 (default), WAV, OPUS, FLAC
- **Normalization**: Audio level normalization (recommended: enabled)

## Performance Tuning

### Resource Allocation

Recommended minimum requirements:
- **CPU**: 4+ cores (6+ recommended for TTS)
- **RAM**: 8GB+ (12GB+ recommended with TTS)
- **GPU**: Optional but recommended for TTS (2GB+ VRAM)
- **Storage**: 15GB+ for models and logs (TTS models are ~1-2GB)

### Optimization Tips

**General:**
- Use smaller Whisper models for real-time performance
- Adjust `WAKE_WORD_SENSITIVITY` based on environment noise
- Configure log levels to `warn` or `error` in production
- Use SSD storage for model loading performance

**TTS Optimization:**
- Use GPU variant (`ghcr.io/remsky/kokoro-fastapi-gpu`) for best performance
- Adjust `TTS_MAX_CONCURRENT` based on your CPU/GPU capacity
- Set `TTS_FORMAT=wav` for compatibility with relay audio processing (mp3 requires additional decoding)
- Use `TTS_SPEED=1.2` for slightly faster speech if needed
- Enable `TTS_FALLBACK_ENABLED=true` for graceful degradation