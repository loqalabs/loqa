.PHONY: help setup setup-dev build start start-dev stop clean test proto dev logs status

# Docker Compose with centralized model configuration
COMPOSE_WITH_ENV = cd .. && set -a && source ./config/models.env && set +a && docker-compose
COMPOSE_DEV_WITH_ENV = cd .. && set -a && source ./config/models.env && set +a && docker-compose -f docker-compose.dev.yml

# Default target
help:
	@echo "Loqa Development Commands"
	@echo "========================"
	@echo "  setup     - 5-minute user setup (pre-built images)"
	@echo "  setup-dev - Developer setup (build from source)"
	@echo "  build     - Build all Docker images for development"
	@echo "  start     - Start all services (production images)"
	@echo "  start-dev - Start development services (from source)"
	@echo "  stop      - Stop all services"
	@echo "  clean     - Clean up containers and volumes"
	@echo "  test      - Run test suite"
	@echo "  proto     - Regenerate protocol buffers"
	@echo "  dev       - Start development environment"
	@echo "  logs      - View service logs"
	@echo "  status    - Check system readiness and health"

setup:
	@echo "🦜 5-minute Loqa setup with pre-built images..."
	cd .. && ./setup.sh

setup-dev:
	@echo "🛠️ Setting up Loqa development environment with source code..."
	./setup-dev.sh

build:
	@echo "🔨 Building all Docker images for development..."
	$(COMPOSE_DEV_WITH_ENV) build

start:
	@echo "🚀 Starting Loqa services (5-minute setup)..."
	$(COMPOSE_WITH_ENV) up -d
	@echo "✅ Services started. Access at:"
	@echo "   Hub API: http://localhost:3000"
	@echo "   Commander Timeline: http://localhost:5173"
	@echo "   NATS: http://localhost:8222"

start-dev:
	@echo "🛠️ Starting Loqa development services..."
	$(COMPOSE_DEV_WITH_ENV) up -d
	@echo "✅ Development services started. Access at:"
	@echo "   Hub API: http://localhost:3000"
	@echo "   Commander Timeline: http://localhost:5173"
	@echo "   NATS: http://localhost:8222"

stop:
	@echo "🛑 Stopping Loqa services..."
	$(COMPOSE_WITH_ENV) down
	$(COMPOSE_DEV_WITH_ENV) down

clean:
	@echo "🧹 Cleaning up containers and volumes..."
	$(COMPOSE_WITH_ENV) down -v
	$(COMPOSE_DEV_WITH_ENV) down -v
	docker system prune -f

test:
	@echo "🧪 Running tests..."
	cd ../loqa-hub && go test ./...
	cd ../loqa-relay/test-go && go test ./...

proto:
	@echo "🔧 Regenerating protocol buffers..."
	cd ../loqa-proto && ./generate.sh

dev: start
	@echo "🛠️ Development environment ready!"
	@echo "Services running:"
	@cd .. && docker-compose ps
	@echo ""
	@echo "To run test relay:"
	@echo "  cd ../loqa-relay/test-go && go run ./cmd"

logs:
	@echo "📊 Showing service logs..."
	cd .. && docker-compose logs -f

status:
	@echo "🔍 Checking Loqa system status..."
	cd .. && ./tools/status.sh

# Individual service commands
start-hub:
	cd ../loqa-hub && go run ./cmd

start-commander:
	cd ../loqa-commander && npm run dev

start-relay:
	cd ../loqa-relay/test-go && go run ./cmd

# Build individual services
build-hub:
	cd ../loqa-hub && go build -o bin/hub ./cmd

build-commander:
	cd ../loqa-commander && npm run build

build-relay:
	cd ../loqa-relay/test-go && go build -o bin/test-relay ./cmd