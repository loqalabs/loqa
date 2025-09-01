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

# Clone the test puck repository if it doesn't exist
if [ ! -d "loqa-puck" ]; then
    echo "📥 Cloning loqa-puck repository..."
    git clone https://github.com/loqalabs/loqa-puck.git
else
    echo "✅ loqa-puck repository already exists"
    echo "🔄 Updating repository..."
    cd loqa-puck && git pull && cd ..
fi

# Clone the proto repository if it doesn't exist (needed for dependencies)
if [ ! -d "loqa-proto" ]; then
    echo "📥 Cloning loqa-proto repository..."
    git clone https://github.com/loqalabs/loqa-proto.git
else
    echo "✅ loqa-proto repository already exists"
    echo "🔄 Updating repository..."
    cd loqa-proto && git pull && cd ..
fi

# Navigate to test-go directory
cd loqa-puck/test-go

# Check if hub is running
echo "🔍 Checking if Loqa hub is running..."
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "❌ Loqa hub is not running at localhost:3000"
    echo "   Please run the main setup first:"
    echo "   curl -fsSL \"https://raw.githubusercontent.com/loqalabs/loqa/main/setup.sh?\$(date +%s)\" | bash"
    exit 1
fi

echo "✅ Hub is running"

# Download dependencies
echo "📦 Installing Go dependencies..."
go mod download

echo ""
echo "🎙️  Starting voice test puck..."
echo "   - Hub address: localhost:50051"
echo "   - Puck ID: host-test-puck"
echo "   - Wake word: 'Hey Loqa'"
echo ""
echo "Try saying:"
echo "   'Hey Loqa, turn on the kitchen lights'"
echo "   'Hey Loqa, play music in the living room'"
echo "   'Hey Loqa, what time is it?'"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Run the test puck with microphone access
go run ./cmd --hub-address localhost:50051 --puck-id host-test-puck