# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Loqa is a local-first voice assistant platform built with a microservice architecture. It consists of multiple Go services and a Vue.js web interface, orchestrated with Docker Compose. The system processes voice commands locally without cloud dependencies.

## Repository Structure

This is a multi-repository project with individual services:

- `loqa/` - Main documentation and orchestration scripts
- `loqa-hub/` - Central service (Go): gRPC API, STT/LLM pipeline, SQLite storage
- `loqa-device-service/` - Device control service (Go): handles smart device commands
- `loqa-observer/` - Vue.js web timeline UI for voice event visualization
- `loqa-puck/` - Audio capture client (Go): test implementation and future embedded firmware
- `loqa-proto/` - gRPC protocol definitions and generated bindings
- `loqa-skills/` - Modular skill plugin system with manifest-driven architecture

## Development Commands

### Primary Development (from loqa/scripts/)
```bash
make setup      # Initial setup, clone repos, download models
make build      # Build all Docker images  
make start      # Start all services via Docker Compose
make test       # Run Go tests across all services
make dev        # Start development environment with status
make logs       # View service logs
make stop       # Stop all services
make clean      # Clean containers and volumes
```

### Docker Compose (from loqa/)
```bash
docker-compose up -d      # Start all services
docker-compose build     # Build all images
docker-compose down      # Stop all services
docker-compose ps        # Show running services
docker-compose logs -f   # Follow service logs
```

### Individual Service Development
```bash
# Hub service
cd loqa-hub && go run ./cmd
cd loqa-hub && go build -o bin/hub ./cmd
cd loqa-hub && go test ./...

# Device service  
cd loqa-device-service && go run ./cmd
cd loqa-device-service && go build -o bin/device-service ./cmd
cd loqa-device-service && go test ./...

# Test puck
cd loqa-puck/test-go && go run ./cmd
cd loqa-puck/test-go && go build -o bin/test-puck ./cmd
cd loqa-puck/test-go && go test ./...

# Observer UI
cd loqa-observer && npm run dev     # Development server
cd loqa-observer && npm run build   # Production build
cd loqa-observer && npm run lint    # ESLint with --fix
cd loqa-observer && npm run format  # Prettier formatting

# Skills Management
cd loqa-hub && go run ./cmd/skills-cli --help     # Skills CLI help
cd loqa-hub && go run ./cmd/skills-cli --action list    # List loaded skills
```

### Protocol Buffer Generation
```bash
cd loqa-proto && ./generate.sh
```

### Testing Commands
```bash
# End-to-end tests
cd loqa-hub/tests/e2e && go test -v

# Integration tests
cd loqa-hub/tests/integration && go test -v

# Test tools
./loqa-hub/tools/run-test-puck.sh    # Start test audio client
./loqa-hub/tools/test-wake-word.sh   # Wake word detection test
```

## Architecture

### Core Services & Ports
- **Hub** (`:3000` HTTP, `:50051` gRPC) - Central orchestrator with STT/LLM pipeline
- **Observer UI** (`:5173`) - Vue.js timeline interface
- **NATS** (`:4222`, `:8222` monitoring) - Message bus
- **Ollama** (`:11434`) - Local LLM (Llama 3.2)
- **Device Service** - Listens on NATS for device commands

### Voice Processing Flow
1. Audio captured by puck → gRPC to Hub
2. Hub transcribes with Whisper.cpp → text to Ollama LLM  
3. Parsed intent published to NATS message bus
4. Device Service receives commands → controls devices
5. Events stored in SQLite → visualized in Observer Timeline

### Key Technologies
- **Backend**: Go 1.24+, gRPC, NATS messaging, SQLite with WAL mode
- **AI**: Whisper.cpp (STT), Ollama + Llama 3.2 (LLM)
- **Frontend**: Vue.js 3, Vite, Tailwind CSS, Pinia
- **Infrastructure**: Docker Compose, Protocol Buffers

## Docker Organization

The project uses a centralized docker-compose.yml in the `loqa/` repo root that references individual Dockerfiles in each service repository:

```
loqa/
├── docker-compose.yml          # Main orchestration file
├── scripts/Makefile           # Development commands
└── ...

loqa-hub/
├── Dockerfile                 # Hub service build
├── go.mod
└── ...

loqa-device-service/
├── Dockerfile                 # Device service build  
├── go.mod
└── ...

loqa-observer/
├── Dockerfile                 # Observer UI build
├── package.json
└── ...
```

Each service can be built individually from its own directory or collectively via the main docker-compose.yml.

## Development Patterns

### Go Services
- Use structured logging with zap (`go.uber.org/zap`)
- SQLite with WAL mode for persistence
- gRPC for audio streaming, HTTP for REST APIs
- NATS pub/sub for inter-service communication
- Standard Go project layout with `cmd/` and `internal/`

### Protocol Buffers
- Audio streaming protocol defined in `loqa-proto/audio.proto`
- Regenerate bindings with `./generate.sh` after changes
- Go bindings in `loqa-proto/go/` with module replacement

### Vue.js Frontend
- Vue 3 with Composition API and `<script setup>`
- Tailwind CSS for styling with dark mode support
- Pinia for state management
- Auto-refresh timeline (5-second intervals)
- ESLint + Prettier for code quality

### Testing Strategy
- Unit tests in each service with `go test ./...`
- Integration tests in `tests/integration/`
- E2E tests in `tests/e2e/` using Docker Compose
- Manual testing tools for wake word and voice pipeline

## Configuration

### Environment Variables (Hub Service)
```bash
WHISPER_MODEL_PATH=/models/ggml-tiny.bin
OLLAMA_URL=http://ollama:11434
NATS_URL=nats://nats:4222
GRPC_PORT=50051
HTTP_PORT=3000
LOG_LEVEL=info
```

### Docker Compose
- Services defined in `loqa/docker-compose.yml` (main orchestration)
- Individual Dockerfiles in each service repository
- Volumes for Ollama models, Hub data, and Whisper binaries
- Network isolation with `loqa-network`
- Health checks for service dependencies
- Test puck service in `testing` profile (optional)

## Common Tasks

### Adding New Voice Commands
1. Create a skill manifest in `loqa-skills/` with intent patterns
2. Implement the skill using the SkillPlugin interface
3. Load the skill via CLI: `skills-cli --action load --path /path/to/skill`
4. Test with `./tools/run-test-puck.sh` or via Observer UI

### Managing Skills  
1. List skills: `skills-cli --action list`
2. Enable/disable: `skills-cli --action enable --skill skill-id`
3. Configure via Observer UI Skills page
4. View logs and metrics in the Timeline

### Protocol Changes
1. Modify `loqa-proto/audio.proto`
2. Run `./generate.sh` to regenerate bindings
3. Update both hub and puck implementations

### Database Schema Changes
1. Update `loqa-hub/internal/storage/schema.sql`
2. Add migration logic in `database.go`
3. Test with clean database: `make clean && make start`

### Observer UI Features
1. Add components in `loqa-observer/src/components/`
2. Update API calls in composables or stores
3. Test with `npm run dev` and hub API at `:3000`

## Security & License

- AGPLv3 licensed - copyleft requirements for derivatives
- No cloud dependencies - fully local processing
- Security reporting via security@loqalabs.com
- All repositories include security scanning in CI/CD