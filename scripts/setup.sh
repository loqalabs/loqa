#!/bin/bash
set -e

echo "🦜 Setting up Loqa Labs - Local Voice Assistant Platform"
echo "========================================================="
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
    "loqa-device-service" 
    "loqa-puck"
    "loqa-proto"
    "loqa-skills"
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

# Go to hub directory for orchestration
cd loqa-hub

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p whisper-models

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

# Download Whisper model if it doesn't exist
if [ ! -f "whisper-models/ggml-tiny.bin" ]; then
    echo "📥 Downloading Whisper tiny model..."
    download_file "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin" "whisper-models/ggml-tiny.bin"
else
    echo "✅ Whisper model already exists"
fi

echo "🐳 Starting Loqa services..."
docker-compose -f deployments/docker-compose.yml up -d

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
echo "To test with a puck:"
echo "  cd ../loqa-puck/test-go"
echo "  go run ./cmd --hub localhost:50051"
echo ""
echo "To stop services:"
echo "  cd loqa-hub && docker-compose -f deployments/docker-compose.yml down"
echo ""
echo "For more information, see:"
echo "  📖 Documentation: loqa/README.md"
echo "  🚀 Quickstart: loqa/docs/quickstart.md"
echo "  🔧 Health check: ./loqa/scripts/health-check.sh"