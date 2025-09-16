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

# Always download the latest docker-compose.yml
echo "📥 Downloading latest docker-compose.yml..."
if command -v curl &> /dev/null; then
    curl -L -o "docker-compose.yml" "https://raw.githubusercontent.com/loqalabs/loqa/main/docker-compose.yml?$(date +%s)"
elif command -v wget &> /dev/null; then
    wget -O "docker-compose.yml" "https://raw.githubusercontent.com/loqalabs/loqa/main/docker-compose.yml?$(date +%s)"
else
    echo "❌ Neither curl nor wget found. Please install one of them."
    exit 1
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

echo "📦 Creating Docker volumes..."
# Get the Docker Compose project name (directory name) to find the correct volume
PROJECT_NAME=$(basename "$(pwd)")

# Create volumes that Docker Compose will use (prevents warning messages)
docker volume create "loqa_ollama-data" >/dev/null 2>&1 || true
docker volume create "loqa_hub-data" >/dev/null 2>&1 || true
docker volume create "loqa_stt-cache" >/dev/null 2>&1 || true
docker volume create "loqa_tts-cache" >/dev/null 2>&1 || true

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
check_endpoint "http://localhost:8000/health" "STT service"
check_endpoint "http://localhost:8880/v1/audio/voices" "TTS service (Kokoro)"

echo ""
echo "🎉 Loqa setup complete!"
echo ""
echo "Services running:"
echo "  🧠 Hub API: http://localhost:3000"
echo "  🕹️  Commander UI: http://localhost:5173"  
echo "  📡 gRPC Audio: localhost:50051"
echo "  🤖 Ollama: http://localhost:11434"
echo "  📨 NATS: localhost:4222"
echo ""
echo "Next steps:"
echo "  📱 Open the Commander UI to see your voice assistant in action"
echo "  🎙️  Use a test relay to send voice commands (requires audio setup)"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "For development setup with source code:"
echo "  Use: docker-compose -f docker-compose.dev.yml up -d"
echo ""
echo "🚀 Ready to use your local voice assistant!"