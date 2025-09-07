# 🧪 Testing

Testing tools, CLI commands, and development workflows for Loqa.

## Test Architecture

Loqa includes multiple levels of testing:
- **Unit Tests**: Individual service logic
- **Integration Tests**: Service-to-service communication  
- **End-to-End Tests**: Full voice pipeline testing
- **Hardware Tests**: Relay device validation

## Development Tools

### Test Relay (Go Client)

Quick voice testing with the Go test relay:

```bash
# Start the test relay
./tools/run-test-relay.sh

# Or manually
cd relay/test-go
go run ./cmd --hub localhost:50051 --id test-relay-001
```

### Manual Command Testing

Send commands directly via NATS CLI:

```bash
# Install NATS CLI
go install github.com/nats-io/natscli/nats@latest

# Test device command
nats pub loqa.devices.commands.lights '{
  "device_type": "lights",
  "action": "on", 
  "location": "kitchen",
  "request_id": "test-123"
}'

# Watch for responses
nats sub "loqa.devices.responses"
```

### Wake Word Testing

Test wake word detection:

```bash
# Run wake word test script
./tools/test-wake-word.sh

# Manual testing with verbose output
cd relay/test-go
DEBUG=1 go run ./cmd --wake-word-sensitivity 0.6
```

## Automated Testing

### Unit Tests

Run unit tests for all services:

```bash
# Hub service tests
cd hub
go test ./...

# Proto validation tests
cd proto
go test ./...
```

### Integration Tests

Integration tests validate service interactions:

```bash
# Start test dependencies
docker-compose -f docker-compose.test.yml up -d

# Run integration test suite
cd tests/integration
go test ./...
```

### End-to-End Tests

Full pipeline tests from voice to device action:

```bash
# E2E test suite (requires running services)
cd tests/e2e  
go test ./...

# Specific voice pipeline test
go test -run TestVoicePipeline ./...
```

## Testing Scripts

### Complete System Test

```bash
# tools/test-system.sh
#!/bin/bash
set -e

echo "🚀 Starting Loqa system test..."

# Start services
docker-compose up -d
sleep 10

# Run test suite
echo "🧪 Running integration tests..."
cd tests/integration && go test ./...

echo "🎤 Running voice pipeline tests..."  
cd ../e2e && go test ./...

echo "✅ All tests passed!"
```

### Performance Testing

```bash
# Test voice processing latency
cd tests/performance
go test -bench=BenchmarkVoiceProcessing

# Test concurrent relay connections
go test -bench=BenchmarkConcurrentRelays
```

## Debugging Tools

### Service Health Check

```bash
# Check all services are responding
curl http://localhost:3000/health

# NATS connectivity test
nats server check --server=nats://localhost:4222
```

### Log Analysis

```bash
# View hub service logs
docker-compose logs -f hub

# Watch for errors across all services  
docker-compose logs --tail=100 | grep -i error

# Real-time log monitoring
docker-compose logs -f | grep -E "(error|warn|fail)"
```

### Audio Debugging

```bash
# Test microphone access
cd relay/test-go
go run ./internal/audio --test-mic

# Audio quality validation
go run ./tools/audio-validator --input sample.wav
```

## Mock Services

For testing without full infrastructure:

### Mock Hub Service

```bash
cd tests/mocks
go run ./mock-hub --port 50051
```

### Mock NATS

```bash
# Use NATS embedded mode for testing
go run ./tests/mocks/mock-nats
```

## Test Data

### Sample Audio Files

Located in `tests/fixtures/`:
- `hey_loqa_clear.wav` - Clean wake word
- `hey_loqa_noisy.wav` - Noisy environment
- `commands_various.wav` - Different command types

### Mock Device Responses

Predefined responses for device testing:

```json
{
  "lights": {
    "kitchen": {"status": "success", "brightness": 100},
    "bedroom": {"status": "offline"}
  }
}
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v6
        with:
          go-version: '1.21'
      
      - name: Run tests
        run: |
          docker-compose -f docker-compose.test.yml up -d
          sleep 10
          make test-all
```

## Performance Benchmarks

Target performance metrics:
- **Voice to Command**: < 2 seconds end-to-end
- **Wake Word Detection**: < 500ms response time
- **Concurrent Relays**: Support 10+ simultaneous streams  
- **Memory Usage**: < 500MB per service under load