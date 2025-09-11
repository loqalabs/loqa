#!/bin/bash

# Loqa Commit Message Hook - AI Attribution Detection
# Runs after commit message is written, has reliable access to the message

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# The commit message is passed as the first argument (the commit message file)
COMMIT_MSG_FILE="$1"

# Check if commit message file exists
if [ ! -f "$COMMIT_MSG_FILE" ]; then
    echo -e "${RED}❌ Commit message file not found: $COMMIT_MSG_FILE${NC}"
    exit 1
fi

# Read the commit message
COMMIT_MESSAGE=$(cat "$COMMIT_MSG_FILE")

# Skip validation for merge commits and other special commits
if echo "$COMMIT_MESSAGE" | grep -q "^Merge\|^Revert\|^fixup!\|^squash!"; then
    exit 0
fi

echo -e "${YELLOW}🔍 Validating commit message for AI attribution...${NC}"

# Check for AI attribution patterns
AI_ATTRIBUTION_FOUND=false

if echo "$COMMIT_MESSAGE" | grep -qi "🤖.*generated\|generated.*with.*claude\|co-authored-by.*claude\|claude[[:space:]]code\|anthropic\.com"; then
    AI_ATTRIBUTION_FOUND=true
fi

# Report results
if [ "$AI_ATTRIBUTION_FOUND" = true ]; then
    echo -e "${RED}❌ Commit message validation failed${NC}"
    echo ""
    echo -e "${RED}• Commit message contains AI attribution${NC}"
    echo -e "  Rule: NEVER use AI attribution in commit messages"
    echo ""
    echo -e "${YELLOW}Detected patterns:${NC}"
    echo "$COMMIT_MESSAGE" | grep -i "🤖\|generated.*with.*claude\|co-authored-by.*claude\|claude[[:space:]]code\|anthropic\.com" || true
    echo ""
    echo -e "${YELLOW}💡 To fix:${NC}"
    echo -e "  • Remove AI attribution from your commit message"
    echo -e "  • Use conventional commit format: type(scope): description"
    echo -e "  • Describe what you changed, not how it was created"
    echo ""
    echo -e "${YELLOW}Example fix:${NC}"
    echo -e "  Instead of: 'fix: auth bug 🤖 Generated with Claude Code'"
    echo -e "  Use:        'fix(auth): resolve validation error in login flow'"
    
    exit 1
else
    echo -e "${GREEN}✅ Commit message validation passed${NC}"
    
    # Show helpful suggestions
    if [ ${#COMMIT_MESSAGE} -lt 10 ]; then
        echo -e "${YELLOW}💡 Consider adding more detail to your commit message${NC}"
    fi
    
    if ! echo "$COMMIT_MESSAGE" | grep -q "^feat\|^fix\|^docs\|^style\|^refactor\|^test\|^chore\|^perf"; then
        echo -e "${YELLOW}💡 Consider using conventional commit format: type(scope): description${NC}"
    fi
    
    exit 0
fi