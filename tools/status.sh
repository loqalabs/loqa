#!/bin/bash

# Loqa System Status Checker
# Shows real-time status of all services and overall system readiness
# Includes automatic retry logic for better reliability

set -e

# Load centralized model configuration
# Try multiple possible locations for the config file
CONFIG_PATHS=(
    "./config/models.env"           # When run from loqa/ directory
    "./loqa/config/models.env"      # When run from workspace root
    "../config/models.env"          # When run from loqa/tools/
)

CONFIG_LOADED=false
for config_path in "${CONFIG_PATHS[@]}"; do
    if [ -f "$config_path" ]; then
        echo "🔍 Found config file at: $config_path"
        source "$config_path"
        CONFIG_LOADED=true
        echo "📋 Loaded model configuration from $config_path"
        echo "🔍 After loading: OLLAMA_MODEL='$OLLAMA_MODEL', WHISPER_MODEL='$WHISPER_MODEL'"
        break
    fi
done

# Set defaults if variables are empty or unset, regardless of whether config was loaded
if [ -z "$OLLAMA_MODEL" ]; then
    OLLAMA_MODEL="llama3.2:3b"
    echo "⚠️  OLLAMA_MODEL not set, using default: $OLLAMA_MODEL"
fi

if [ -z "$WHISPER_MODEL" ]; then
    WHISPER_MODEL="base.en"
    echo "⚠️  WHISPER_MODEL not set, using default: $WHISPER_MODEL"
fi

if [ "$CONFIG_LOADED" = false ]; then
    echo "⚠️  Model config file not found in any expected location"
fi

echo "🎯 Using models: LLM=${OLLAMA_MODEL}, STT=${WHISPER_MODEL}"

# Configuration
MAX_RETRIES=5
RETRY_DELAY=15  # seconds between retries

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis for status
LOADING="🔄"
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
READY="🚀"
INFO="ℹ️"

# Function to perform the complete status check
perform_status_check() {
    echo "🔍 Loqa System Status Check"
    echo "=================================="

# Function to check service health
check_service_health() {
    local service_name="$1"
    local container_name="$2"

    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*healthy"; then
        echo -e "${SUCCESS} $service_name: ${GREEN}Healthy${NC}"
        return 0
    elif docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*starting\|unhealthy"; then
        echo -e "${LOADING} $service_name: ${YELLOW}Starting...${NC}"
        return 1
    elif docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name"; then
        echo -e "${WARNING} $service_name: ${YELLOW}Running (no health check)${NC}"
        return 1
    else
        echo -e "${ERROR} $service_name: ${RED}Not running${NC}"
        return 1
    fi
}

# Function to check specific functionality (informational only - hub handles Ollama recovery)
check_ollama_model() {
    if curl -s http://localhost:11434/api/tags | grep -q "${OLLAMA_MODEL}"; then
        # Test if model can actually generate
        if curl -s -X POST http://localhost:11434/api/generate \
           -H "Content-Type: application/json" \
           -d "{\"model\":\"${OLLAMA_MODEL}\",\"prompt\":\"test\",\"stream\":false}" \
           --max-time 10 >/dev/null 2>&1; then
            echo -e "${SUCCESS} LLM Model: ${GREEN}${OLLAMA_MODEL} loaded and responding${NC}"
            return 0
        else
            echo -e "${WARNING} LLM Model: ${YELLOW}${OLLAMA_MODEL} loaded but not responding${NC}"
            echo -e "   ${INFO} Hub service will use fallback logic until model is ready"
            return 1
        fi
    else
        echo -e "${WARNING} LLM Model: ${YELLOW}${OLLAMA_MODEL} not available${NC}"
        echo -e "   ${INFO} Hub service will automatically retry connection (up to 10 attempts)"
        return 1
    fi
}

check_voice_pipeline() {
    local stt_ok=false
    local tts_ok=false

    # Check STT
    if curl -s http://localhost:8000/health >/dev/null 2>&1; then
        echo -e "${SUCCESS} Speech-to-Text: ${GREEN}Ready${NC}"
        stt_ok=true
    else
        echo -e "${ERROR} Speech-to-Text: ${RED}Not responding${NC}"
    fi

    # Check TTS
    if curl -s http://localhost:8880/v1/audio/voices >/dev/null 2>&1; then
        echo -e "${SUCCESS} Text-to-Speech: ${GREEN}Ready${NC}"
        tts_ok=true
    else
        echo -e "${ERROR} Text-to-Speech: ${RED}Not responding${NC}"
    fi

    if $stt_ok && $tts_ok; then
        return 0
    else
        return 1
    fi
}

# Check if docker-compose is running
if ! docker ps >/dev/null 2>&1; then
    echo -e "${ERROR} Docker is not running"
    exit 1
fi

echo "📋 Service Health Status:"
echo "------------------------"

# Check each service
services_ready=0
total_services=6

check_service_health "NATS Message Bus" "nats" && ((services_ready++))
check_service_health "Ollama LLM" "ollama" && ((services_ready++))
check_service_health "Speech-to-Text" "stt" && ((services_ready++))
check_service_health "Text-to-Speech" "tts" && ((services_ready++))
check_service_health "Hub Service" "hub" && ((services_ready++))
check_service_health "Commander UI" "commander" && ((services_ready++))

echo ""
echo "🧠 AI/Voice Pipeline Status:"
echo "-----------------------------"

pipeline_ready=0
total_pipeline=1  # Only voice pipeline (STT/TTS) is required for readiness

# Check Ollama status (informational only - not required for readiness)
echo ""
echo -e "${INFO} LLM Status (informational only):"
check_ollama_model

echo ""
echo "🎙️  Voice Pipeline Status:"
echo "-------------------------"
check_voice_pipeline && ((pipeline_ready++))

echo ""
echo "📊 System Readiness Summary:"
echo "=============================="

# Check if core voice services are ready (excluding Commander UI which is optional)
core_services_ready=0
total_core_services=5  # NATS, Ollama (container), STT, TTS, Hub

check_service_health "NATS Message Bus" "nats" >/dev/null && ((core_services_ready++))
# Ollama container should be running (model readiness is separate)
(check_service_health "Ollama LLM" "ollama" >/dev/null ||
 docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "ollama.*Up") && ((core_services_ready++))
check_service_health "Speech-to-Text" "stt" >/dev/null && ((core_services_ready++))
check_service_health "Text-to-Speech" "tts" >/dev/null && ((core_services_ready++))
check_service_health "Hub Service" "hub" >/dev/null && ((core_services_ready++))

if [ $pipeline_ready -eq $total_pipeline ] && [ $core_services_ready -eq $total_core_services ]; then
    echo -e "${READY} ${GREEN}System is READY for voice commands!${NC}"
    echo -e "   ${SUCCESS} Core services operational ($core_services_ready/$total_core_services)"
    echo -e "   ${SUCCESS} Voice pipeline operational ($pipeline_ready/$total_pipeline)"
    if [ $services_ready -lt $total_services ]; then
        echo -e "   ${WARNING} Commander UI offline (voice commands still work)"
    fi
    echo ""
    echo -e "${BLUE}🎤 To test voice commands:${NC}"
    echo -e "   ${BLUE}cd loqa-relay/test-go && go run ./cmd -hub localhost:50051${NC}"
    echo -e "   ${BLUE}Say: \"Hey Loqa, turn on the kitchen lights\"${NC}"
    return 0
elif [ $pipeline_ready -eq $total_pipeline ]; then
    echo -e "${WARNING} ${YELLOW}Voice pipeline ready, but core services need attention...${NC}"
    echo -e "   ${WARNING} Core services: ($core_services_ready/$total_core_services) ready"
    echo -e "   ${SUCCESS} Voice pipeline: ($pipeline_ready/$total_pipeline) ready"
    echo ""
    echo -e "${YELLOW}🔧 Check service logs: docker-compose logs${NC}"
    return 1
elif [ $core_services_ready -ge 4 ]; then
    echo -e "${WARNING} ${YELLOW}Services ready, but pipeline initializing...${NC}"
    echo -e "   ${SUCCESS} Core services operational ($core_services_ready/$total_core_services)"
    echo -e "   ${WARNING} Voice pipeline: ($pipeline_ready/$total_pipeline) ready"
    echo ""
    echo -e "${YELLOW}💡 Wait a moment for LLM model to fully load, then try again${NC}"
    return 1
else
    echo -e "${ERROR} ${RED}System NOT ready${NC}"
    echo -e "   ${WARNING} Core services: ($core_services_ready/$total_core_services) ready"
    echo -e "   ${WARNING} Voice pipeline: ($pipeline_ready/$total_pipeline) ready"
    echo ""
    echo -e "${YELLOW}🔧 Run: docker-compose up -d${NC}"
    echo -e "${YELLOW}⏳ Then wait for services to become healthy${NC}"
    return 1
fi
}

# Main script execution with retry logic
attempt=1
while [ $attempt -le $MAX_RETRIES ]; do
    if [ $attempt -gt 1 ]; then
        echo ""
        echo "${LOADING} Attempt $attempt of $MAX_RETRIES (waiting ${RETRY_DELAY}s before retry...)"
        sleep $RETRY_DELAY
        echo ""
    fi

    if perform_status_check; then
        # Success - exit with 0
        exit 0
    else
        # Failed - check if we should retry
        if [ $attempt -eq $MAX_RETRIES ]; then
            echo ""
            echo "${ERROR} System not ready after $MAX_RETRIES attempts"
            echo "   ${WARNING} Services may still be starting up"
            echo "   ${WARNING} Try running this script again in a few minutes"
            exit 1
        fi

        attempt=$((attempt + 1))
    fi
done