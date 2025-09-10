#!/bin/bash

# Install Loqa pre-commit hooks across all repositories

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK_SOURCE="$SCRIPT_DIR/pre-commit-hook.sh"

# Find the Loqa workspace root by looking for the loqa/ directory structure
WORKSPACE_ROOT=""
CURRENT_DIR="$SCRIPT_DIR"

# Walk up the directory tree to find the workspace root
while [ "$CURRENT_DIR" != "/" ]; do
    if [ -d "$CURRENT_DIR/loqa" ] && [ -d "$CURRENT_DIR/loqa-hub" ]; then
        WORKSPACE_ROOT="$CURRENT_DIR"
        break
    fi
    CURRENT_DIR=$(dirname "$CURRENT_DIR")
done

if [ -z "$WORKSPACE_ROOT" ]; then
    echo -e "${RED}❌ Could not find Loqa workspace root${NC}"
    echo -e "${YELLOW}Make sure you're running this from within the Loqa workspace${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Found workspace root: $WORKSPACE_ROOT${NC}"

# List of Loqa repositories (discover dynamically)
REPOSITORIES=()
for dir in "$WORKSPACE_ROOT"/*; do
    if [ -d "$dir/.git" ]; then
        REPO_NAME=$(basename "$dir")
        REPOSITORIES+=("$REPO_NAME")
    fi
done

echo -e "${BLUE}🔧 Installing Loqa pre-commit hooks...${NC}"
echo -e "${BLUE}📁 Found repositories: ${REPOSITORIES[*]}${NC}"
echo ""

# Check dependencies
echo -e "${BLUE}🔍 Checking dependencies...${NC}"
MISSING_DEPS=()

if ! command -v node >/dev/null 2>&1; then
    MISSING_DEPS+=("Node.js")
fi

if ! command -v npm >/dev/null 2>&1 && ! command -v yarn >/dev/null 2>&1; then
    MISSING_DEPS+=("npm or yarn")
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing dependencies: ${MISSING_DEPS[*]}${NC}"
    echo -e "${YELLOW}   Pre-commit hooks will still work, but MCP server may not build${NC}"
    echo -e "${YELLOW}   Install Node.js 18+ and npm to enable full functionality${NC}"
    echo ""
fi

# Check if MCP server is built
if [ ! -f "$SCRIPT_DIR/dist/index.js" ]; then
    echo -e "${YELLOW}⚠️  MCP server not built. Building now...${NC}"
    cd "$SCRIPT_DIR"
    if command -v npm >/dev/null 2>&1; then
        npm run build
    else
        echo -e "${RED}❌ npm not found. Please build the MCP server manually:${NC}"
        echo -e "   cd $SCRIPT_DIR && npm run build"
        exit 1
    fi
    echo ""
fi

INSTALLED_COUNT=0
SKIPPED_COUNT=0
ERROR_COUNT=0

for repo in "${REPOSITORIES[@]}"; do
    REPO_PATH="$WORKSPACE_ROOT/$repo"
    GIT_HOOKS_DIR="$REPO_PATH/.git/hooks"
    HOOK_TARGET="$GIT_HOOKS_DIR/pre-commit"
    
    echo -e "${BLUE}📁 Processing repository: $repo${NC}"
    
    # Check if repository exists (redundant but safe)
    if [ ! -d "$REPO_PATH" ]; then
        echo -e "${YELLOW}   ⚠️  Repository not found: $REPO_PATH${NC}"
        ((SKIPPED_COUNT++))
        continue
    fi
    
    # Check if it's a git repository (redundant but safe)
    if [ ! -d "$REPO_PATH/.git" ]; then
        echo -e "${YELLOW}   ⚠️  Not a git repository: $REPO_PATH${NC}"
        ((SKIPPED_COUNT++))
        continue
    fi
    
    # Create hooks directory if it doesn't exist
    mkdir -p "$GIT_HOOKS_DIR"
    
    # Check if pre-commit hook already exists
    if [ -f "$HOOK_TARGET" ]; then
        # Check if it's already our hook
        if grep -q "Loqa Pre-commit Hook" "$HOOK_TARGET" 2>/dev/null; then
            echo -e "${GREEN}   ✅ Loqa hook already installed${NC}"
        else
            # Backup existing hook
            BACKUP_NAME="$HOOK_TARGET.backup.$(date +%Y%m%d-%H%M%S)"
            cp "$HOOK_TARGET" "$BACKUP_NAME"
            echo -e "${YELLOW}   📋 Backed up existing hook to: $(basename "$BACKUP_NAME")${NC}"
            
            # Install our hook
            cp "$HOOK_SOURCE" "$HOOK_TARGET"
            chmod +x "$HOOK_TARGET"
            echo -e "${GREEN}   ✅ Loqa hook installed (replaced existing)${NC}"
            ((INSTALLED_COUNT++))
        fi
    else
        # Install our hook
        cp "$HOOK_SOURCE" "$HOOK_TARGET"
        chmod +x "$HOOK_TARGET"
        echo -e "${GREEN}   ✅ Loqa hook installed${NC}"
        ((INSTALLED_COUNT++))
    fi
    
    echo ""
done

echo -e "${BLUE}📊 Installation Summary:${NC}"
echo -e "   • ${GREEN}Installed: $INSTALLED_COUNT${NC}"
echo -e "   • ${YELLOW}Skipped: $SKIPPED_COUNT${NC}"
echo -e "   • ${RED}Errors: $ERROR_COUNT${NC}"
echo ""

if [ $INSTALLED_COUNT -gt 0 ]; then
    echo -e "${GREEN}🎉 Pre-commit hooks successfully installed!${NC}"
    echo ""
    echo -e "${BLUE}What happens now:${NC}"
    echo -e "   • All commits will be validated against Loqa workflow rules"
    echo -e "   • AI attribution will be blocked"
    echo -e "   • Branch name validation will be enforced"
    echo -e "   • Quality gate configuration will be checked"
    echo ""
    echo -e "${YELLOW}💡 To test a hook manually:${NC}"
    echo -e "   cd /path/to/repo && .git/hooks/pre-commit"
else
    echo -e "${YELLOW}ℹ️  No new hooks were installed.${NC}"
fi