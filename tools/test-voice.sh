#!/bin/bash
set -e

echo "🎤 Loqa Voice Testing Setup"
echo "=========================="
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go first."
    echo "   Visit: https://golang.org/doc/install"
    exit 1
fi

echo "✅ Go found: $(go version)"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git found"

# Clone the test relay repository if it doesn't exist
if [ ! -d "loqa-relay" ]; then
    echo "📥 Cloning loqa-relay repository..."
    git clone https://github.com/loqalabs/loqa-relay.git
else
    echo "✅ loqa-relay repository already exists"
    echo "🔄 Updating repository..."
    cd loqa-relay && git pull && cd ..
fi

# Proto dependencies are now handled via Go modules (v0.0.17+)
# No need to clone loqa-proto repository locally

# Navigate to test-go directory
cd loqa-relay/test-go

# Check if hub is running
echo "🔍 Checking if Loqa hub is running..."
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "❌ Loqa hub is not running at localhost:3000"
    echo "   Please run the main setup first:"
    echo "   curl -fsSL \"https://raw.githubusercontent.com/loqalabs/loqa/main/tools/setup.sh?\$(date +%s)\" | bash"
    exit 1
fi

echo "✅ Hub is running"

# Download dependencies
echo "📦 Installing Go dependencies..."
go mod download

echo ""
echo "🎙️  Starting voice test relay..."
echo "   - Hub address: localhost:50051"
echo "   - Relay ID: host-test-relay"
echo "   - Wake word: 'Hey Loqa'"
echo ""
echo "Try saying:"
echo "   'Hey Loqa, turn on the kitchen lights'"
echo "   'Hey Loqa, play music in the living room'"
echo "   'Hey Loqa, what time is it?'"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Run the test relay with microphone access
go run ./cmd -hub localhost:50051 -id host-test-relay