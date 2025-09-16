#!/bin/bash
set -e

echo "🎤 Loqa Voice Testing Setup"
echo "=========================="
echo ""

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go first."
    echo "   Visit: https://golang.org/get"
    exit 1
fi

echo "✅ Git and Go found"

# Clone the relay repository if it doesn't exist
if [ ! -d "loqa-relay" ]; then
    echo "📥 Cloning loqa-relay repository..."
    git clone https://github.com/loqalabs/loqa-relay.git
else
    echo "📁 loqa-relay directory found, updating..."
    cd loqa-relay && git pull && cd ..
fi

cd loqa-relay/test-go

echo "📦 Installing Go dependencies..."
go mod download

echo ""
echo "🎤 Starting voice test client..."
echo ""
echo "Voice Commands to Try:"
echo "  - 'Hey Loqa, turn on the kitchen lights'"
echo "  - 'Hey Loqa, play music in the living room'"
echo "  - 'Hey Loqa, turn off all lights'"
echo "  - 'Hey Loqa, what's the time?'"
echo ""
echo "💡 Make sure Loqa services are running first!"
echo "   If not started: curl -fsSL 'https://raw.githubusercontent.com/loqalabs/loqa/main/tools/setup.sh' | bash"
echo ""
echo "🔗 Watch your commands in real-time at: http://localhost:5173"
echo ""
echo "Starting test client..."

# Run the test relay with microphone access
go run ./cmd -hub localhost:50051