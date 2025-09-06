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
- `loqa-relay/` - Audio capture client (Go): test implementation and future embedded firmware
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

# Test relay
cd loqa-relay/test-go && go run ./cmd
cd loqa-relay/test-go && go build -o bin/test-relay ./cmd
cd loqa-relay/test-go && go test ./...

# Observer UI
cd loqa-observer && npm run dev     # Development server
cd loqa-observer && npm run build   # Production build
cd loqa-observer && npm run lint    # ESLint with --fix
cd loqa-observer && npm run format  # Prettier formatting

# Skills Management
cd loqa-hub && go run ./cmd/skills-cli --help     # Skills CLI help
cd loqa-hub && go run ./cmd/skills-cli --action list    # List loaded skills

# Skills Development (from loqa-skills/)
cd loqa-skills/homeassistant-skill && make build  # Build HA skill plugin
cd loqa-skills/homeassistant-skill && make install # Install skill to hub
cd loqa-skills/homeassistant-skill && make load   # Load via API
cd loqa-skills/homeassistant-skill && make status # Check skill status
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
./loqa-hub/tools/run-test-relay.sh    # Start test audio client
./loqa-hub/tools/test-wake-word.sh   # Wake word detection test
```

## Architecture

### Core Services & Ports
- **Hub** (`:3000` HTTP, `:50051` gRPC) - Central orchestrator with STT/LLM pipeline
- **Observer UI** (`:5173`) - Vue.js timeline interface
- **STT** (`:8000` REST) - OpenAI-compatible Speech-to-Text service
- **NATS** (`:4222`, `:8222` monitoring) - Message bus
- **Ollama** (`:11434`) - Local LLM (Llama 3.2)
- **Device Service** - Listens on NATS for device commands

### Voice Processing Flow
1. Audio captured by relay → gRPC to Hub
2. Hub transcribes via OpenAI-compatible STT service REST API → text parsed locally
3. Intent routed through Skills System → appropriate skill handles command
4. Skill processes request (e.g., Home Assistant API calls) → returns structured response
5. Events stored in SQLite with skill tracking & metadata → visualized in Observer Timeline
6. Device commands published to NATS → Device Service controls hardware

### Key Technologies
- **Backend**: Go 1.24+, gRPC, NATS messaging, SQLite with WAL mode
- **AI**: OpenAI-compatible STT services, Ollama + Llama 3.2 (LLM)
- **STT Architecture**: Modular `Transcriber` interface with OpenAI-compatible REST backend
- **Skills System**: Go plugins, manifest-driven architecture, sandboxing
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

loqa-skills/
├── homeassistant-skill/       # Home Assistant integration skill
├── example-skill/             # Example skill template
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
# STT Configuration
STT_URL=http://stt:8000                 # OpenAI-compatible STT service URL

# Service URLs
OLLAMA_URL=http://ollama:11434
NATS_URL=nats://nats:4222

# Server Ports
LOQA_PORT=3000                          # HTTP server port
LOQA_GRPC_PORT=50051                    # gRPC server port

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Docker Compose
- Services defined in `loqa/docker-compose.yml` (main orchestration)
- Individual Dockerfiles in each service repository
- Volumes for Ollama models, Hub data, and STT cache
- Network isolation with `loqa-network`
- Health checks for service dependencies
- Test relay service in `testing` profile (optional)

## Workflow Templates

The repository includes structured prompt templates for consistent development practices:

- `ISSUE_WORK_PROMPT.md` - Template for working on GitHub issues with proper scope and approach guidance
- `STRATEGIC_SHIFT_PROMPT.md` - Template for making major changes in technology, focus, or design philosophy

These templates ensure comprehensive planning and consistent execution across all development work.

## Common Tasks

### Adding New Voice Commands
1. Create a skill manifest in `loqa-skills/` with intent patterns
2. Implement the skill using the SkillPlugin interface
3. Load the skill via CLI: `skills-cli --action load --path /path/to/skill`
4. Test with `./tools/run-test-relay.sh` or via Observer UI

### Managing Skills  
1. List skills: `skills-cli --action list`
2. Enable/disable: `skills-cli --action enable --skill skill-id`
3. Configure via Observer UI Skills page
4. View logs and metrics in the Timeline

### Protocol Changes
1. Modify `loqa-proto/audio.proto`
2. Run `./generate.sh` to regenerate bindings
3. Update both hub and relay implementations

### Database Schema Changes
1. Update `loqa-hub/internal/storage/schema.sql`
2. Add migration logic in `database.go`
3. Update storage methods in `voice_events_store.go` for new fields
4. Update `events/voice_event.go` struct and JSON serialization methods
5. Test with clean database: `make clean && make start`

### Observer UI Features
1. Add components in `loqa-observer/src/components/`
2. Update API calls in composables or stores
3. Test with `npm run dev` and hub API at `:3000`

## Security & License

- AGPLv3 licensed - copyleft requirements for derivatives
- No cloud dependencies - fully local processing
- Security reporting via security@loqalabs.com
- All repositories include security scanning in CI/CD