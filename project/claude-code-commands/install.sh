#!/bin/bash

# Claude Code Commands Installer for Loqa
# This script installs the Loqa development commands for Claude Code

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default installation directory
INSTALL_DIR="$HOME/.claude/commands"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --dir DIR     Install to custom directory (default: ~/.claude/commands)"
    echo "  -f, --force       Overwrite existing commands"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                          # Install to default location"
    echo "  $0 --dir /custom/path       # Install to custom location"
    echo "  $0 --force                  # Overwrite existing commands"
}

# Parse command line arguments
FORCE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dir)
            INSTALL_DIR="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

echo ""
echo "🚀 Claude Code Commands Installer for Loqa"
echo "========================================="
echo ""

# Check if Claude Code is available
if ! command -v claude &> /dev/null; then
    print_warning "Claude Code CLI not detected. Make sure it's installed and in your PATH."
    print_info "You can install Claude Code from: https://claude.ai/code"
    echo ""
fi

# Create installation directory
print_info "Installing commands to: $INSTALL_DIR"

if [[ ! -d "$INSTALL_DIR" ]]; then
    print_info "Creating directory: $INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# List of commands to install
COMMANDS=(
    "loqa.md"
)

# Install each command
echo ""
print_info "Installing commands..."
INSTALLED_COUNT=0
SKIPPED_COUNT=0

for cmd in "${COMMANDS[@]}"; do
    SOURCE_FILE="$SCRIPT_DIR/$cmd"
    DEST_FILE="$INSTALL_DIR/$cmd"
    
    if [[ ! -f "$SOURCE_FILE" ]]; then
        print_error "Source file not found: $SOURCE_FILE"
        continue
    fi
    
    if [[ -f "$DEST_FILE" ]] && [[ "$FORCE" != "true" ]]; then
        print_warning "Skipping $cmd (already exists, use --force to overwrite)"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        continue
    fi
    
    cp "$SOURCE_FILE" "$DEST_FILE"
    print_status "Installed $cmd"
    INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
done

echo ""
echo "📊 Installation Summary:"
echo "   • Installed: $INSTALLED_COUNT commands"
echo "   • Skipped: $SKIPPED_COUNT commands"
echo ""

if [[ $INSTALLED_COUNT -gt 0 ]]; then
    print_status "Installation completed successfully!"
    echo ""
    echo "🎯 Unified Loqa Command:"
    echo "   /loqa                  - Show all available categories (task, dev, plan, capture)"
    echo ""
    echo "📋 Discovery Pattern:"
    echo "   /loqa                  - Show categories: task, dev, plan, capture"
    echo "   /loqa task             - Show task actions: create, list, update, resume"
    echo "   /loqa dev              - Show dev actions: work, branch, pr, test, analyze"
    echo "   /loqa plan             - Show planning actions: recommend, strategy"  
    echo "   /loqa capture          - Show capture actions: thought, idea"
    echo ""
    echo "🚀 Example Usage:"
    echo "   /loqa task create \"Fix login bug\""
    echo "   /loqa dev work --priority=P1"
    echo "   /loqa plan recommend --roleContext=developer"
    echo "   /loqa capture thought \"Memory leak in audio processing\""
    echo ""
    print_info "Commands are ready to use in Claude Code!"
    print_info "See DEVELOPER_COMMANDS.md for full documentation."
else
    print_warning "No commands were installed."
fi

echo ""