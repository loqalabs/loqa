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
PRE_COMMIT_HOOK_SOURCE="$SCRIPT_DIR/pre-commit-hook.sh"
COMMIT_MSG_HOOK_SOURCE="$SCRIPT_DIR/commit-msg-hook.sh"

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

# Check if dependencies are installed and MCP server is built
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Installing now...${NC}"
    cd "$SCRIPT_DIR"
    if command -v npm >/dev/null 2>&1; then
        npm install
    else
        echo -e "${RED}❌ npm not found. Please install dependencies manually:${NC}"
        echo -e "   cd $SCRIPT_DIR && npm install"
        exit 1
    fi
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
    PRE_COMMIT_TARGET="$GIT_HOOKS_DIR/pre-commit"
    COMMIT_MSG_TARGET="$GIT_HOOKS_DIR/commit-msg"
    
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
    
    REPO_INSTALLED_COUNT=0
    
    # Install pre-commit hook (branch protection)
    if [ -f "$PRE_COMMIT_TARGET" ]; then
        # Check if it's already our hook
        if grep -q "Loqa Pre-commit Hook" "$PRE_COMMIT_TARGET" 2>/dev/null; then
            echo -e "${GREEN}   ✅ Pre-commit hook already installed${NC}"
        else
            # Backup existing hook
            BACKUP_NAME="$PRE_COMMIT_TARGET.backup.$(date +%Y%m%d-%H%M%S)"
            cp "$PRE_COMMIT_TARGET" "$BACKUP_NAME"
            echo -e "${YELLOW}   📋 Backed up existing pre-commit hook to: $(basename "$BACKUP_NAME")${NC}"
            
            # Install our hook
            cp "$PRE_COMMIT_HOOK_SOURCE" "$PRE_COMMIT_TARGET"
            chmod +x "$PRE_COMMIT_TARGET"
            echo -e "${GREEN}   ✅ Pre-commit hook installed${NC}"
            ((REPO_INSTALLED_COUNT++))
        fi
    else
        # Install our hook
        cp "$PRE_COMMIT_HOOK_SOURCE" "$PRE_COMMIT_TARGET"
        chmod +x "$PRE_COMMIT_TARGET"
        echo -e "${GREEN}   ✅ Pre-commit hook installed${NC}"
        ((REPO_INSTALLED_COUNT++))
    fi
    
    # Install commit-msg hook (AI attribution detection)
    if [ -f "$COMMIT_MSG_TARGET" ]; then
        # Check if it's already our hook
        if grep -q "Loqa Commit Message Hook" "$COMMIT_MSG_TARGET" 2>/dev/null; then
            echo -e "${GREEN}   ✅ Commit-msg hook already installed${NC}"
        else
            # Backup existing hook
            BACKUP_NAME="$COMMIT_MSG_TARGET.backup.$(date +%Y%m%d-%H%M%S)"
            cp "$COMMIT_MSG_TARGET" "$BACKUP_NAME"
            echo -e "${YELLOW}   📋 Backed up existing commit-msg hook to: $(basename "$BACKUP_NAME")${NC}"
            
            # Install our hook
            cp "$COMMIT_MSG_HOOK_SOURCE" "$COMMIT_MSG_TARGET"
            chmod +x "$COMMIT_MSG_TARGET"
            echo -e "${GREEN}   ✅ Commit-msg hook installed${NC}"
            ((REPO_INSTALLED_COUNT++))
        fi
    else
        # Install our hook
        cp "$COMMIT_MSG_HOOK_SOURCE" "$COMMIT_MSG_TARGET"
        chmod +x "$COMMIT_MSG_TARGET"
        echo -e "${GREEN}   ✅ Commit-msg hook installed${NC}"
        ((REPO_INSTALLED_COUNT++))
    fi
    
    if [ $REPO_INSTALLED_COUNT -eq 0 ]; then
        echo -e "${GREEN}   ✅ All Loqa hooks already installed${NC}"
    fi
    
    ((INSTALLED_COUNT += REPO_INSTALLED_COUNT))
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
    echo -e "   • Pre-commit hooks prevent direct commits to main/master branches"
    echo -e "   • Commit-msg hooks block AI attribution in commit messages"
    echo -e "   • Branch name suggestions provided for better conventions"
    echo -e "   • All validation happens automatically during git commits"
    echo ""
    echo -e "${YELLOW}💡 To test hooks manually:${NC}"
    echo -e "   Pre-commit: echo 'test' | .git/hooks/pre-commit"
    echo -e "   Commit-msg: echo 'test message 🤖 Generated with Claude Code' > /tmp/msg && .git/hooks/commit-msg /tmp/msg"
else
    echo -e "${YELLOW}ℹ️  No new hooks were installed.${NC}"
fi