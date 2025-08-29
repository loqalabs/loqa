.PHONY: help setup build start stop clean test proto dev logs

# Default target
help:
	@echo "Loqa Development Commands"
	@echo "========================"
	@echo "  setup     - Initial setup and model download"
	@echo "  build     - Build all Docker images"
	@echo "  start     - Start all services"
	@echo "  stop      - Stop all services"
	@echo "  clean     - Clean up containers and volumes"
	@echo "  test      - Run test suite"
	@echo "  proto     - Regenerate protocol buffers"
	@echo "  dev       - Start development environment"
	@echo "  logs      - View service logs"

setup:
	@echo "🦜 Setting up Loqa development environment..."
	./setup.sh

build:
	@echo "🔨 Building all Docker images..."
	docker-compose build

start:
	@echo "🚀 Starting Loqa services..."
	docker-compose up -d
	@echo "✅ Services started. Access at:"
	@echo "   Hub API: http://localhost:3000"
	@echo "   NATS: http://localhost:8222"

stop:
	@echo "🛑 Stopping Loqa services..."
	docker-compose down

clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker-compose down -v
	docker system prune -f

test:
	@echo "🧪 Running tests..."
	cd loqa-hub && go test ./...
	cd loqa-device-service && go test ./...
	cd loqa-puck/test-go && go test ./...

proto:
	@echo "🔧 Regenerating protocol buffers..."
	cd loqa-proto && ./generate.sh

dev: start
	@echo "🛠️ Development environment ready!"
	@echo "Services running:"
	@docker-compose ps
	@echo ""
	@echo "To run test puck:"
	@echo "  cd loqa-puck/test-go && go run ./cmd"

logs:
	@echo "📊 Showing service logs..."
	docker-compose logs -f

# Individual service commands
start-hub:
	cd loqa-hub && go run ./cmd

start-device-service:
	cd loqa-device-service && go run ./cmd

start-puck:
	cd loqa-puck/test-go && go run ./cmd

# Build individual services
build-hub:
	cd loqa-hub && go build -o bin/hub ./cmd

build-device-service:
	cd loqa-device-service && go build -o bin/device-service ./cmd

build-puck:
	cd loqa-puck/test-go && go build -o bin/test-puck ./cmd