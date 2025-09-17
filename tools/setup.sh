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

echo "⏳ Waiting for services to be ready..."
echo "   This may take a few minutes for the LLM model to download and load..."
echo ""

# Wait a moment for services to start
sleep 10

# Download status checker for ongoing use
echo "📥 Setting up status checker..."
curl -fsSL "https://raw.githubusercontent.com/loqalabs/loqa/main/tools/status.sh" -o status.sh
chmod +x status.sh

# Run comprehensive status check
echo "🔍 Running system readiness check..."
if ./status.sh; then
    echo ""
    echo "🎉 Loqa setup complete and ready!"
else
    echo ""
    echo "⚠️  Setup completed, but some services are still starting."
    echo "   Run './status.sh' again in a minute to check readiness"
fi

echo ""
echo "📖 Quick reference:"
echo "  • Check system status: ./status.sh"
echo "  • Commander UI: http://localhost:5173"
echo "  • Check logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo ""
echo "For development setup with source code:"
echo "  Use: docker-compose -f docker-compose.dev.yml up -d"
echo ""
echo "🚀 Ready to use your local voice assistant!"