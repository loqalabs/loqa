#!/bin/bash
set -e

echo "🦜 Loqa Labs - 5-Minute Voice Assistant Setup"
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

# Download docker-compose.yml if it doesn't exist
if [ ! -f "docker-compose.yml" ]; then
    echo "📥 Downloading docker-compose.yml..."
    if command -v curl &> /dev/null; then
        curl -L -o "docker-compose.yml" "https://raw.githubusercontent.com/loqalabs/loqa/main/docker-compose.yml?$(date +%s)"
    elif command -v wget &> /dev/null; then
        wget -O "docker-compose.yml" "https://raw.githubusercontent.com/loqalabs/loqa/main/docker-compose.yml?$(date +%s)"
    else
        echo "❌ Neither curl nor wget found. Please install one of them."
        exit 1
    fi
fi

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

echo "📥 Downloading Whisper model..."
# Get the Docker Compose project name (directory name) to find the correct volume
PROJECT_NAME=$(basename "$(pwd)")
VOLUME_NAME="${PROJECT_NAME}_whisper-models"

# Create volumes that Docker Compose will use (prevents warning messages)
docker volume create "${PROJECT_NAME}_ollama-data" >/dev/null 2>&1 || true
docker volume create "${PROJECT_NAME}_hub-data" >/dev/null 2>&1 || true  
docker volume create "${PROJECT_NAME}_whisper-models" >/dev/null 2>&1 || true

# Create a temporary container to download the model to the volume
docker run --rm -v "${VOLUME_NAME}:/tmp/whisper.cpp/models" alpine/curl:latest sh -c "
  if [ ! -f /tmp/whisper.cpp/models/ggml-tiny.bin ]; then
    echo 'Downloading Whisper model...'
    curl -L -o /tmp/whisper.cpp/models/ggml-tiny.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
    echo 'Model downloaded successfully'
  else
    echo 'Whisper model already exists'
  fi
"

echo "📥 Pulling latest Docker images..."
docker-compose pull

echo "🐳 Starting Loqa services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 15

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
echo "  🕹️  Observer UI: http://localhost:5173"  
echo "  📡 gRPC Audio: localhost:50051"
echo "  🤖 Ollama: http://localhost:11434"
echo "  📨 NATS: localhost:4222"
echo ""
echo "Next steps:"
echo "  📱 Open the Observer UI to see your voice assistant in action"
echo "  🎙️  Use a test puck to send voice commands (requires audio setup)"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "For development setup with source code:"
echo "  Use: docker-compose -f docker-compose.dev.yml up -d"
echo ""
echo "🚀 Ready to use your local voice assistant!"