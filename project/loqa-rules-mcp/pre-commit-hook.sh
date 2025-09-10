#!/bin/bash

# Loqa Pre-commit Hook - Branch Protection
# Focuses on branch validation which works reliably during git commits

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Validating against Loqa workflow rules...${NC}"

# Check branch name (this works reliably in pre-commit hooks)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
BRANCH_VIOLATION=false

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    BRANCH_VIOLATION=true
fi

# Report results
if [ "$BRANCH_VIOLATION" = true ]; then
    echo -e "${RED}❌ Pre-commit validation failed${NC}"
    echo ""
    echo -e "${RED}• Committing directly to $CURRENT_BRANCH branch${NC}"  
    echo -e "  Rule: ALWAYS create feature branches (feature/, bugfix/, hotfix/)"
    echo ""
    echo -e "${YELLOW}💡 To fix:${NC}"
    echo -e "  • Create a feature branch: git checkout -b feature/your-feature-name"
    echo -e "  • Follow conventional commits: type(scope): description"
    echo -e "  • Always create PRs for review"
    
    exit 1
else
    echo -e "${GREEN}✅ Branch validation passed${NC}"
    
    # Show helpful suggestions (not failures)
    if ! echo "$CURRENT_BRANCH" | grep -q "^feature/\|^bugfix/\|^hotfix/\|^chore/\|^docs/"; then
        echo -e "${YELLOW}💡 Consider using conventional branch names: feature/, bugfix/, hotfix/, etc.${NC}"
    fi
    
    echo -e "${YELLOW}ℹ️  Note: Commit message validation available via MCP server for Claude Code sessions${NC}"
    exit 0
fi