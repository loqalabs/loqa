#!/bin/bash

# Universal Proto Development Mode Toggle Script
# This script manages proto development mode across all Loqa services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Service configurations: service_name:go_mod_path:replace_path
SERVICES=(
    "loqa-hub:loqa-hub/go.mod:../loqa-proto/go"
    "loqa-relay:loqa-relay/test-go/go.mod:../../loqa-proto/go"
)

print_usage() {
    echo "Usage: $0 [dev|prod|status] [service]"
    echo ""
    echo "Commands:"
    echo "  dev     - Enable development mode (use local proto changes)"
    echo "  prod    - Enable production mode (use released proto version)"  
    echo "  status  - Show current mode"
    echo ""
    echo "Services (optional, default: all):"
    echo "  loqa-hub    - Hub service only"
    echo "  loqa-relay  - Relay service only"
    echo "  all         - All services (default)"
    echo ""
    echo "Examples:"
    echo "  $0 dev              # Enable dev mode for all services"
    echo "  $0 dev loqa-hub     # Enable dev mode for hub only"
    echo "  $0 status           # Show status for all services"
}

check_proto_dir() {
    local proto_path="$ROOT_DIR/loqa-proto/go"
    if [[ ! -d "$proto_path" ]]; then
        echo "❌ Error: loqa-proto directory not found at $proto_path"
        echo "   Make sure loqa-proto is cloned in the workspace"
        exit 1
    fi
}

toggle_service() {
    local service_name="$1"
    local go_mod_path="$2"
    local replace_path="$3"
    local mode="$4"
    
    local full_go_mod_path="$ROOT_DIR/$go_mod_path"
    
    if [[ ! -f "$full_go_mod_path" ]]; then
        echo "⚠️  Skipping $service_name: go.mod not found at $go_mod_path"
        return
    fi
    
    echo "🔧 $service_name:"
    
    case "$mode" in
        "dev")
            if grep -q "^replace github.com/loqalabs/loqa-proto/go" "$full_go_mod_path"; then
                echo "   ✅ Development mode already enabled"
            else
                sed -i.bak "s|^// replace github.com/loqalabs/loqa-proto/go.*|replace github.com/loqalabs/loqa-proto/go => $replace_path|g" "$full_go_mod_path"
                
                # Run go mod tidy in the correct directory
                local go_mod_dir="$(dirname "$full_go_mod_path")"
                (cd "$go_mod_dir" && go mod tidy)
                
                echo "   ✅ Development mode enabled"
            fi
            ;;
        "prod")
            if grep -q "^// replace github.com/loqalabs/loqa-proto/go" "$full_go_mod_path"; then
                echo "   ✅ Production mode already enabled"
            else
                sed -i.bak "s|^replace github.com/loqalabs/loqa-proto/go.*|// replace github.com/loqalabs/loqa-proto/go => $replace_path|g" "$full_go_mod_path"
                
                # Run go mod tidy in the correct directory
                local go_mod_dir="$(dirname "$full_go_mod_path")"
                (cd "$go_mod_dir" && go mod tidy)
                
                echo "   ✅ Production mode enabled"
            fi
            ;;
        "status")
            if grep -q "^replace github.com/loqalabs/loqa-proto/go" "$full_go_mod_path"; then
                echo "   📍 Development mode - using local proto changes"
            elif grep -q "^// replace github.com/loqalabs/loqa-proto/go" "$full_go_mod_path"; then
                echo "   📦 Production mode - using released proto version"
            else
                echo "   📦 Production mode - using released proto version (no directive)"
            fi
            ;;
    esac
}

process_services() {
    local mode="$1"
    local target_service="$2"
    
    if [[ "$mode" == "dev" ]]; then
        check_proto_dir
    fi
    
    for service_config in "${SERVICES[@]}"; do
        IFS=':' read -r service_name go_mod_path replace_path <<< "$service_config"
        
        if [[ -z "$target_service" || "$target_service" == "all" || "$target_service" == "$service_name" ]]; then
            toggle_service "$service_name" "$go_mod_path" "$replace_path" "$mode"
        fi
    done
}

# Main script logic
MODE="${1:-}"
SERVICE="${2:-all}"

case "$MODE" in
    "dev"|"prod"|"status")
        process_services "$MODE" "$SERVICE"
        ;;
    *)
        print_usage
        exit 1
        ;;
esac