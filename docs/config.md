# ⚙️ Configuration

Configuration options and environment variables for Loqa services.

## Environment Variables

### Hub Service

| Variable | Description | Default |
|----------|-------------|---------|
| `STT_URL` | OpenAI-compatible STT service URL | `http://stt:8000` |
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

### Puck (Go Test Client)

| Variable | Description | Default |
|----------|-------------|---------|
| `HUB_GRPC_ENDPOINT` | Hub gRPC endpoint | `localhost:50051` |
| `PUCK_ID` | Unique identifier for puck | `test-puck-001` |
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

## Performance Tuning

### Resource Allocation

Recommended minimum requirements:
- **CPU**: 4+ cores
- **RAM**: 8GB+ (more for larger models)
- **Storage**: 10GB+ for models and logs

### Optimization Tips

- Use smaller Whisper models for real-time performance
- Adjust `WAKE_WORD_SENSITIVITY` based on environment noise
- Configure log levels to `warn` or `error` in production
- Use SSD storage for model loading performance