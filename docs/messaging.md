# 📡 Messaging & NATS

NATS message bus subjects, data structures, and communication flows.

## Architecture

Loqa uses [NATS](https://nats.io/) as the central message bus for inter-service communication. All services publish and subscribe to structured messages using well-defined subjects.

## Subject Hierarchy

### Voice Input Flow

```
loqa.voice.input     -> Raw audio processing requests
loqa.voice.transcribed -> STT results from Hub
loqa.voice.commands    -> Parsed commands from LLM
```

### Device Commands

```
loqa.devices.commands.*      -> Device control commands
loqa.devices.commands.lights -> Light control messages  
loqa.devices.commands.music  -> Music/audio commands
loqa.devices.commands.climate -> Temperature/HVAC control
```

### Device Responses

```
loqa.devices.responses    -> Device status updates
loqa.devices.status.*     -> Device state notifications
loqa.skills.responses     -> Skill execution results
```

### System Events

```
loqa.system.health     -> Service health checks
loqa.system.config     -> Configuration updates
loqa.system.metrics    -> Performance metrics
```

## Message Formats

### Voice Command Message

```json
{
  "request_id": "req_12345",
  "timestamp": "2025-01-15T10:30:00Z",
  "relay_id": "relay_001",
  "text": "turn on the kitchen lights",
  "confidence": 0.92,
  "intent": {
    "action": "turn_on",
    "device_type": "lights",
    "location": "kitchen",
    "entities": {}
  }
}
```

### Device Command Message

```json
{
  "request_id": "req_12345", 
  "device_type": "lights",
  "action": "on",
  "location": "kitchen",
  "parameters": {
    "brightness": 80,
    "color": "warm_white"
  },
  "timestamp": "2025-01-15T10:30:01Z"
}
```

### Device Response Message

```json
{
  "request_id": "req_12345",
  "device_type": "lights", 
  "location": "kitchen",
  "status": "success",
  "state": {
    "power": "on",
    "brightness": 80,
    "color": "warm_white"
  },
  "timestamp": "2025-01-15T10:30:02Z"
}
```

## Message Flow Examples

### Complete Voice Command Flow

1. **Relay** → `loqa.voice.input`: Audio data
2. **Hub** → `loqa.voice.transcribed`: "turn on kitchen lights"  
3. **Hub** → `loqa.voice.commands`: Parsed intent with entities
4. **Device Service** ← `loqa.devices.commands.lights`: Light command
5. **Device Service** → `loqa.devices.responses`: Success confirmation

### Health Check Flow

1. **All Services** → `loqa.system.health`: Periodic heartbeat
2. **Monitor** ← `loqa.system.health`: Service status aggregation

## NATS Configuration

### Connection Settings

```bash
# Development
NATS_URL=nats://localhost:4222

# Production (with auth)  
NATS_URL=nats://user:pass@nats-cluster:4222
```

### Subscription Patterns

Services should use durable subscriptions for reliability:

```go
// Go example
js.Subscribe("loqa.devices.commands.lights", handler, 
    nats.Durable("device-service-lights"))
```

## Debugging Messages

Use `natscli` to monitor message flow:

```bash
# Watch all voice commands
nats sub "loqa.voice.commands"

# Watch device responses
nats sub "loqa.devices.responses"

# Publish test command
nats pub loqa.devices.commands.lights '{
  "device_type": "lights",
  "action": "on",
  "location": "test"
}'
```

## Message Schemas

All message types are defined in the [loqa-proto](https://github.com/loqalabs/loqa-proto) repository with Protocol Buffers for type safety and versioning.

## Error Handling

### Retry Logic
- Failed commands are retried with exponential backoff
- Max 3 retry attempts for device commands  
- Permanent failures are logged and reported

### Dead Letter Queue
- Messages that cannot be processed are moved to `loqa.system.failed`
- Failed message analysis helps identify system issues