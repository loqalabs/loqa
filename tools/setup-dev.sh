#!/bin/bash
set -e

echo "🛠️ Loqa Labs - Development Environment Setup"
echo "============================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Clone all repositories if they don't exist
REPOS=(
    "loqa-hub"
    "loqa-relay"
    "loqa-proto"
    "loqa-skills"
    "loqa-commander"
    # Note: loqa-device-service archived Sept 2025 - functionality moved to skills
)

echo "📦 Cloning Loqa repositories..."
cd ..
for repo in "${REPOS[@]}"; do
    if [[ ! -d "$repo" ]]; then
        echo "Cloning $repo..."
        git clone "https://github.com/loqalabs/$repo.git" "$repo"
    else
        echo "✅ $repo already exists"
    fi
done

# Go back to main directory for orchestration
cd loqa

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data logs

# Function to download files with fallback methods
download_file() {
    local url=$1
    local output=$2
    
    if command -v curl &> /dev/null; then
        echo "Using curl to download..."
        curl -L -o "$output" "$url"
    elif command -v wget &> /dev/null; then
        echo "Using wget to download..."
        wget -O "$output" "$url"
    else
        echo "❌ Neither curl nor wget found. Please install one of them."
        echo "   macOS: curl is pre-installed, or 'brew install wget'"
        echo "   Ubuntu/Debian: 'sudo apt-get install curl' or 'sudo apt-get install wget'"
        exit 1
    fi
}

# STT service will be provided via Docker container
echo "✅ STT service will be provided via faster-whisper-server container"

# Setup MCP server for Claude Code integration
echo "🤖 Setting up MCP server for Claude Code integration..."
if [[ -d "project/loqa-assistant-mcp" ]]; then
    echo "📦 Building MCP server and installing pre-commit hooks..."
    cd project/loqa-assistant-mcp
    if [[ -f "install-hooks.sh" ]]; then
        ./install-hooks.sh
        echo "✅ MCP server and pre-commit hooks installed"
    else
        echo "⚠️  MCP install script not found, running manual setup..."
        npm install && npm run build
        echo "✅ MCP server built manually"
    fi
    cd ../..
else
    echo "⚠️  MCP server directory not found, skipping MCP setup"
fi

echo "🐳 Starting Loqa services with development build..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."

# Function to check HTTP endpoints
check_endpoint() {
    local url=$1
    local service_name=$2
    
    if command -v curl &> /dev/null; then
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is running"
        else
            echo "⚠️  $service_name may still be starting..."
        fi
    else
        echo "ℹ️  $service_name status check skipped (no curl available)"
    fi
}

check_endpoint "http://localhost:3000/health" "Hub service"
check_endpoint "http://localhost:11434/api/tags" "Ollama service"

echo ""
echo "🎉 Loqa setup complete!"
echo ""
echo "Services running:"
echo "  🧠 Hub API: http://localhost:3000"
echo "  📡 gRPC Audio: localhost:50051"
echo "  🤖 Ollama: http://localhost:11434"
echo "  📨 NATS: localhost:4222"
echo ""
echo "To test with a relay:"
echo "  cd ../loqa-relay/test-go"
echo "  go run ./cmd --hub localhost:50051"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "For more information, see:"
echo "  📖 Documentation: loqa/README.md"
echo "  🚀 Quickstart: loqa/docs/quickstart.md"
echo "  🔧 Health check: ./loqa/tools/health-check.sh"
echo ""
echo "🤖 Claude Code MCP Integration:"
echo "  Add this to your ~/.mcp.json:"
echo "  {"
echo "    \"mcpServers\": {"
echo "      \"loqa-assistant\": {"
echo "        \"command\": \"$(pwd)/project/loqa-assistant-mcp/start-mcp.sh\","
echo "        \"args\": [],"
echo "        \"env\": {}"
echo "      }"
echo "    }"
echo "  }"
echo "  Then restart Claude Code to activate MCP tools."