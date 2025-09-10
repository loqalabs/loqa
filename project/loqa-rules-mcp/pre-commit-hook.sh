#!/bin/bash

# Loqa Pre-commit Hook v2 - Simplified and more robust

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find the MCP server relative to the Loqa workspace
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")
WORKSPACE_ROOT=$(dirname "$REPO_ROOT")
MCP_SERVER_PATH="$WORKSPACE_ROOT/loqa/project/loqa-rules-mcp/dist/index.js"

# Check if MCP server exists
if [ ! -f "$MCP_SERVER_PATH" ]; then
    echo -e "${YELLOW}⚠️  Loqa Rules MCP server not found - skipping validation${NC}"
    echo -e "${YELLOW}Expected at: $MCP_SERVER_PATH${NC}"
    exit 0  # Don't fail the commit, just skip validation
fi

# Get the commit message
COMMIT_MESSAGE=""
if [ -t 0 ]; then
    # Not from stdin, use placeholder for testing
    COMMIT_MESSAGE="${1:-Pre-commit validation test}"
else
    # From stdin
    COMMIT_MESSAGE=$(cat)
fi

if [ -z "$COMMIT_MESSAGE" ]; then
    echo -e "${YELLOW}⚠️  No commit message provided - skipping validation${NC}"
    exit 0
fi

echo -e "${YELLOW}🔍 Validating commit message against Loqa rules...${NC}"

# Simple validation without complex JSON escaping
# Check for AI attribution patterns directly
AI_ATTRIBUTION_FOUND=false

if echo "$COMMIT_MESSAGE" | grep -qi "generated.*with.*claude\|co-authored-by.*claude\|🤖.*generated\|claude.*code\|anthropic\.com"; then
    AI_ATTRIBUTION_FOUND=true
fi

# Check branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
BRANCH_VIOLATION=false

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    BRANCH_VIOLATION=true
fi

# Report results
if [ "$AI_ATTRIBUTION_FOUND" = true ] || [ "$BRANCH_VIOLATION" = true ]; then
    echo -e "${RED}❌ Pre-commit validation failed${NC}"
    echo ""
    
    if [ "$AI_ATTRIBUTION_FOUND" = true ]; then
        echo -e "${RED}• Commit message contains AI attribution${NC}"
        echo -e "  Rule: NEVER use AI attribution in commit messages"
    fi
    
    if [ "$BRANCH_VIOLATION" = true ]; then
        echo -e "${RED}• Committing directly to $CURRENT_BRANCH branch${NC}"  
        echo -e "  Rule: ALWAYS create feature branches (feature/, bugfix/, hotfix/)"
    fi
    
    echo ""
    echo -e "${YELLOW}💡 To fix:${NC}"
    echo -e "  • Remove AI attribution from commit messages"
    echo -e "  • Use feature branches: git checkout -b feature/your-feature-name"
    echo -e "  • Follow conventional commits: type(scope): description"
    
    exit 1
else
    echo -e "${GREEN}✅ Pre-commit validation passed${NC}"
    
    # Show helpful warnings
    if ! echo "$COMMIT_MESSAGE" | grep -q "^(feat|fix|docs|style|refactor|test|chore|perf)"; then
        echo -e "${YELLOW}💡 Consider using conventional commit format: type(scope): description${NC}"
    fi
    
    if [ ${#COMMIT_MESSAGE} -lt 10 ]; then
        echo -e "${YELLOW}💡 Consider adding more detail to your commit message${NC}"
    fi
    
    exit 0
fi