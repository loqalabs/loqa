#!/bin/bash
set -e

echo "🏥 Loqa System Health Check"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check functions
check_dependency() {
    local cmd=$1
    local name=$2
    if command -v "$cmd" &> /dev/null; then
        echo -e "✅ $name: ${GREEN}$(command -v "$cmd")${NC}"
        return 0
    else
        echo -e "❌ $name: ${RED}Not found${NC}"
        return 1
    fi
}

check_port() {
    local port=$1
    local service=$2
    if lsof -i :$port &> /dev/null; then
        local process=$(lsof -i :$port | tail -1 | awk '{print $1}')
        echo -e "✅ Port $port ($service): ${GREEN}$process${NC}"
        return 0
    else
        echo -e "❌ Port $port ($service): ${RED}Not listening${NC}"
        return 1
    fi
}

check_docker_service() {
    local service=$1
    if docker-compose ps --format json 2>/dev/null | jq -r ".Name" | grep -q "$service" 2>/dev/null; then
        local status=$(docker-compose ps --format "table" | grep "$service" | awk '{print $4}' || echo "Unknown")
        if [[ "$status" == "Up"* ]]; then
            echo -e "✅ Docker service $service: ${GREEN}$status${NC}"
            return 0
        else
            echo -e "❌ Docker service $service: ${RED}$status${NC}"
            return 1
        fi
    else
        echo -e "❌ Docker service $service: ${RED}Not found${NC}"
        return 1
    fi
}

# Start health checks
echo "🔍 Checking Dependencies..."
echo "----------------------------"

deps_ok=0
check_dependency "docker" "Docker" && ((deps_ok++))
check_dependency "docker-compose" "Docker Compose" && ((deps_ok++))
check_dependency "go" "Go" && ((deps_ok++))

echo ""
echo "🐳 Checking Docker Services..."
echo "------------------------------"

services_ok=0
if docker-compose ps &> /dev/null; then
    check_docker_service "nats" && ((services_ok++))
    check_docker_service "device-service" && ((services_ok++))
    if docker-compose ps --format json 2>/dev/null | jq -r ".Name" | grep -q "hub" 2>/dev/null; then
        check_docker_service "hub" && ((services_ok++))
    else
        echo -e "ℹ️  Hub service: ${YELLOW}Optional - not running${NC}"
    fi
    if docker-compose ps --format json 2>/dev/null | jq -r ".Name" | grep -q "ollama" 2>/dev/null; then
        check_docker_service "ollama" && ((services_ok++))
    else
        echo -e "ℹ️  Ollama service: ${YELLOW}Optional - not running${NC}"
    fi
else
    echo -e "❌ Docker Compose: ${RED}No services running${NC}"
fi

echo ""
echo "🌐 Checking Network Ports..."
echo "----------------------------"

ports_ok=0
check_port "4222" "NATS" && ((ports_ok++))
if lsof -i :50051 &> /dev/null; then
    check_port "50051" "Hub gRPC" && ((ports_ok++))
else
    echo -e "ℹ️  Port 50051 (Hub gRPC): ${YELLOW}Optional - not listening${NC}"
fi
if lsof -i :3000 &> /dev/null; then
    check_port "3000" "Hub HTTP" && ((ports_ok++))
else
    echo -e "ℹ️  Port 3000 (Hub HTTP): ${YELLOW}Optional - not listening${NC}"
fi
if lsof -i :11434 &> /dev/null; then
    check_port "11434" "Ollama" && ((ports_ok++))
else
    echo -e "ℹ️  Port 11434 (Ollama): ${YELLOW}Optional - not listening${NC}"
fi

echo ""
echo "🧪 Testing Service Connectivity..."
echo "---------------------------------"

connectivity_ok=0

# Test NATS connectivity
if command -v nats &> /dev/null; then
    if timeout 5s nats server check --server=nats://localhost:4222 &> /dev/null; then
        echo -e "✅ NATS connectivity: ${GREEN}OK${NC}"
        ((connectivity_ok++))
    else
        echo -e "❌ NATS connectivity: ${RED}Failed${NC}"
    fi
else
    echo -e "ℹ️  NATS connectivity: ${YELLOW}nats CLI not installed${NC}"
fi

# Test HTTP endpoints
if curl -s -f http://localhost:3000/health &> /dev/null; then
    echo -e "✅ Hub HTTP health: ${GREEN}OK${NC}"
    ((connectivity_ok++))
else
    echo -e "ℹ️  Hub HTTP health: ${YELLOW}Not available${NC}"
fi

if curl -s -f http://localhost:11434/api/tags &> /dev/null; then
    echo -e "✅ Ollama API: ${GREEN}OK${NC}"
    ((connectivity_ok++))
else
    echo -e "ℹ️  Ollama API: ${YELLOW}Not available${NC}"
fi

echo ""
echo "💾 Checking System Resources..."
echo "------------------------------"

# Check disk space
available_space=$(df -h . | tail -1 | awk '{print $4}')
echo -e "💽 Available disk space: ${BLUE}$available_space${NC}"

# Check memory
if command -v free &> /dev/null; then
    available_memory=$(free -h | grep Mem | awk '{print $7}')
    echo -e "🧠 Available memory: ${BLUE}$available_memory${NC}"
elif command -v vm_stat &> /dev/null; then
    # macOS
    echo -e "🧠 Memory check: ${YELLOW}macOS - use Activity Monitor${NC}"
fi

# Check if models exist
echo ""
echo "🤖 Checking AI Models..."
echo "------------------------"

if [ -d "whisper-models" ]; then
    model_count=$(ls whisper-models/*.bin 2>/dev/null | wc -l)
    if [ $model_count -gt 0 ]; then
        echo -e "✅ Whisper models: ${GREEN}$model_count found${NC}"
    else
        echo -e "❌ Whisper models: ${RED}None found${NC}"
    fi
else
    echo -e "ℹ️  Whisper models: ${YELLOW}Directory not found${NC}"
fi

# Check Ollama models
if docker-compose ps ollama &> /dev/null && docker-compose exec -T ollama ollama list &> /dev/null; then
    model_list=$(docker-compose exec -T ollama ollama list | tail -n +2 | wc -l)
    if [ $model_list -gt 0 ]; then
        echo -e "✅ Ollama models: ${GREEN}$model_list found${NC}"
    else
        echo -e "❌ Ollama models: ${RED}None found${NC}"
    fi
else
    echo -e "ℹ️  Ollama models: ${YELLOW}Ollama not running${NC}"
fi

echo ""
echo "📊 Health Check Summary"
echo "======================="

total_score=0
max_score=0

echo -e "Dependencies: ${deps_ok}/3 ${GREEN}✓${NC}"
total_score=$((total_score + deps_ok))
max_score=$((max_score + 3))

if [ $services_ok -gt 0 ]; then
    echo -e "Services: ${services_ok}/4 ${GREEN}✓${NC}"
    total_score=$((total_score + services_ok))
fi
max_score=$((max_score + 4))

if [ $connectivity_ok -gt 0 ]; then
    echo -e "Connectivity: ${connectivity_ok}/3 ${GREEN}✓${NC}"
    total_score=$((total_score + connectivity_ok))
fi
max_score=$((max_score + 3))

echo ""
percentage=$((total_score * 100 / max_score))

if [ $percentage -ge 80 ]; then
    echo -e "🎉 Overall Health: ${GREEN}$percentage% - Excellent${NC}"
    echo "🚀 System is ready for voice commands!"
elif [ $percentage -ge 60 ]; then
    echo -e "⚠️  Overall Health: ${YELLOW}$percentage% - Good${NC}"
    echo "✅ Basic functionality available"
elif [ $percentage -ge 40 ]; then
    echo -e "🔧 Overall Health: ${YELLOW}$percentage% - Needs attention${NC}"
    echo "⚠️  Some components need fixing"
else
    echo -e "❌ Overall Health: ${RED}$percentage% - Critical${NC}"
    echo "🆘 System needs setup or repair"
fi

echo ""
echo "📋 Quick Actions:"
echo "   Start services: docker-compose up -d"
echo "   View logs: docker-compose logs -f"
echo "   Test voice: cd loqa-puck/test-go && go run ./cmd"
echo "   Get help: See docs/troubleshooting.md"

exit 0