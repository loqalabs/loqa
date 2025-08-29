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

# Download Whisper model if it doesn't exist
if [ ! -f "whisper-models/ggml-tiny.bin" ]; then
    echo "📥 Downloading Whisper tiny model..."
    wget -O whisper-models/ggml-tiny.bin \
        https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin
else
    echo "✅ Whisper model already exists"
fi

echo "🐳 Starting Loqa services..."
docker-compose -f deployments/docker-compose.yml up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."
if curl -s -f http://localhost:3000/health > /dev/null; then
    echo "✅ Hub service is running"
else
    echo "⚠️  Hub service may still be starting..."
fi

if curl -s -f http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama service is running"
else
    echo "⚠️  Ollama service may still be starting..."
fi

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