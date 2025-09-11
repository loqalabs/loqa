#!/bin/bash

# Force update Loqa commit-msg hooks across all repositories with the fixed pattern

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMIT_MSG_HOOK_SOURCE="$SCRIPT_DIR/commit-msg-hook.sh"

# Find the Loqa workspace root
WORKSPACE_ROOT=""
CURRENT_DIR="$SCRIPT_DIR"

while [ "$CURRENT_DIR" != "/" ]; do
    if [ -d "$CURRENT_DIR/loqa" ] && [ -d "$CURRENT_DIR/loqa-hub" ]; then
        WORKSPACE_ROOT="$CURRENT_DIR"
        break
    fi
    CURRENT_DIR=$(dirname "$CURRENT_DIR")
done

if [ -z "$WORKSPACE_ROOT" ]; then
    echo -e "${RED}❌ Could not find Loqa workspace root${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Found workspace root: $WORKSPACE_ROOT${NC}"
echo -e "${BLUE}🔧 Force updating Loqa commit-msg hooks with fixed AI attribution pattern...${NC}"
echo ""

# List of repositories to update
REPOSITORIES=()
for dir in "$WORKSPACE_ROOT"/*; do
    if [ -d "$dir/.git" ]; then
        REPO_NAME=$(basename "$dir")
        REPOSITORIES+=("$REPO_NAME")
    fi
done

UPDATED_COUNT=0
ERROR_COUNT=0

for repo in "${REPOSITORIES[@]}"; do
    REPO_PATH="$WORKSPACE_ROOT/$repo"
    COMMIT_MSG_TARGET="$REPO_PATH/.git/hooks/commit-msg"
    
    echo -e "${BLUE}📁 Processing repository: $repo${NC}"
    
    if [ ! -d "$REPO_PATH/.git" ]; then
        echo -e "${YELLOW}   ⚠️  Not a git repository: $REPO_PATH${NC}"
        continue
    fi
    
    # Check if the current hook has the old pattern
    if [ -f "$COMMIT_MSG_TARGET" ] && grep -q "claude\.\*code" "$COMMIT_MSG_TARGET" 2>/dev/null; then
        # Backup the current hook
        BACKUP_NAME="$COMMIT_MSG_TARGET.backup.$(date +%Y%m%d-%H%M%S)"
        cp "$COMMIT_MSG_TARGET" "$BACKUP_NAME"
        echo -e "${YELLOW}   📋 Backed up existing hook to: $(basename "$BACKUP_NAME")${NC}"
        
        # Install the updated hook
        cp "$COMMIT_MSG_HOOK_SOURCE" "$COMMIT_MSG_TARGET"
        chmod +x "$COMMIT_MSG_TARGET"
        echo -e "${GREEN}   ✅ Updated commit-msg hook with fixed pattern${NC}"
        ((UPDATED_COUNT++))
        
    elif [ -f "$COMMIT_MSG_TARGET" ] && grep -q "claude\[" "$COMMIT_MSG_TARGET" 2>/dev/null; then
        echo -e "${GREEN}   ✅ Hook already has fixed pattern${NC}"
        
    elif [ ! -f "$COMMIT_MSG_TARGET" ]; then
        # Install the hook if it doesn't exist
        mkdir -p "$(dirname "$COMMIT_MSG_TARGET")"
        cp "$COMMIT_MSG_HOOK_SOURCE" "$COMMIT_MSG_TARGET"
        chmod +x "$COMMIT_MSG_TARGET"
        echo -e "${GREEN}   ✅ Installed commit-msg hook${NC}"
        ((UPDATED_COUNT++))
        
    else
        echo -e "${YELLOW}   ⚠️  Hook exists but pattern unclear - skipping${NC}"
    fi
    
    echo ""
done

echo -e "${BLUE}📊 Update Summary:${NC}"
echo -e "   • ${GREEN}Updated: $UPDATED_COUNT${NC}"
echo -e "   • ${RED}Errors: $ERROR_COUNT${NC}"
echo ""

if [ $UPDATED_COUNT -gt 0 ]; then
    echo -e "${GREEN}🎉 Hooks successfully updated with fixed AI attribution pattern!${NC}"
    echo -e "${BLUE}Fixed pattern now requires whitespace: 'claude code' (not 'claude-code-commands')${NC}"
else
    echo -e "${YELLOW}ℹ️  No hooks needed updating.${NC}"
fi