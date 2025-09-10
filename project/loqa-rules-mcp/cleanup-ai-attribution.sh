#!/bin/bash

# Loqa AI Attribution Cleanup Script
# Removes AI attribution from commit messages across all repositories

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

echo -e "${BLUE}🧹 Loqa AI Attribution Cleanup${NC}"
echo -e "${BLUE}Workspace: $WORKSPACE_ROOT${NC}"
echo ""

# List of Loqa repositories
REPOSITORIES=()
for dir in "$WORKSPACE_ROOT"/*; do
    if [ -d "$dir/.git" ]; then
        REPO_NAME=$(basename "$dir")
        REPOSITORIES+=("$REPO_NAME")
    fi
done

echo -e "${BLUE}📁 Found repositories: ${REPOSITORIES[*]}${NC}"
echo ""

# Warning and confirmation
echo -e "${YELLOW}⚠️  WARNING: This script will rewrite commit history!${NC}"
echo -e "${YELLOW}   - AI attribution will be removed from commit messages and bodies${NC}"
echo -e "${YELLOW}   - This will change commit hashes${NC}"
echo -e "${YELLOW}   - All collaborators will need to reset their local branches${NC}"
echo -e "${YELLOW}   - Make sure all important work is pushed and backed up${NC}"
echo ""

read -p "Are you sure you want to proceed? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}Operation cancelled${NC}"
    exit 0
fi

# AI attribution patterns to remove
PATTERNS=(
    "🤖 Generated with \[Claude Code\]\(https://claude\.ai/code\)"
    "Co-Authored-By: Claude <noreply@anthropic\.com>"
    "🤖.*[Gg]enerated.*with.*Claude.*Code"
    "[Gg]enerated with Claude Code"
    "Co-Authored-By:.*Claude.*<.*anthropic\.com>"
)

# Create filter script
FILTER_SCRIPT=$(mktemp)
cat > "$FILTER_SCRIPT" << 'EOF'
#!/bin/bash
# Read the commit message
msg=$(cat)

# Remove AI attribution patterns
cleaned_msg="$msg"

# Remove robot emoji lines
cleaned_msg=$(echo "$cleaned_msg" | grep -v "🤖.*[Gg]enerated.*with.*Claude.*Code" || echo "$cleaned_msg")

# Remove "Generated with Claude Code" lines
cleaned_msg=$(echo "$cleaned_msg" | grep -v "[Gg]enerated with Claude Code" || echo "$cleaned_msg")

# Remove Co-Authored-By Claude lines
cleaned_msg=$(echo "$cleaned_msg" | grep -v "Co-Authored-By:.*Claude.*<.*anthropic\.com>" || echo "$cleaned_msg")

# Remove specific markdown links
cleaned_msg=$(echo "$cleaned_msg" | sed 's/🤖 Generated with \[Claude Code\](https:\/\/claude\.ai\/code)//g')

# Remove empty lines at the end
cleaned_msg=$(echo "$cleaned_msg" | sed -e :a -e '/^\s*$/N;ba' -e 's/\n\s*$//')

# Output cleaned message
echo "$cleaned_msg"
EOF

chmod +x "$FILTER_SCRIPT"

CLEANED_COUNT=0
ERROR_COUNT=0

for repo in "${REPOSITORIES[@]}"; do
    REPO_PATH="$WORKSPACE_ROOT/$repo"
    
    echo -e "${BLUE}📁 Processing repository: $repo${NC}"
    
    if [ ! -d "$REPO_PATH/.git" ]; then
        echo -e "${YELLOW}   ⚠️  Not a git repository: $REPO_PATH${NC}"
        continue
    fi
    
    cd "$REPO_PATH"
    
    # Check if repository has any commits with AI attribution
    AI_COMMITS=$(git log --all --grep="🤖" --grep="Generated with Claude Code" --grep="Co-Authored-By.*Claude" --oneline || true)
    
    if [ -z "$AI_COMMITS" ]; then
        echo -e "${GREEN}   ✅ No AI attribution found${NC}"
        continue
    fi
    
    echo -e "${YELLOW}   🔍 Found AI attribution in commits:${NC}"
    echo "$AI_COMMITS" | head -5 | sed 's/^/     /'
    if [ $(echo "$AI_COMMITS" | wc -l) -gt 5 ]; then
        echo "     ... and $(( $(echo "$AI_COMMITS" | wc -l) - 5 )) more commits"
    fi
    
    # Create backup branch
    BACKUP_BRANCH="backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
    git branch "$BACKUP_BRANCH" HEAD
    echo -e "${GREEN}   📋 Created backup branch: $BACKUP_BRANCH${NC}"
    
    # Check if we can do this safely
    if ! git status --porcelain | grep -q '^'; then
        echo -e "${YELLOW}   🔧 Cleaning commit messages...${NC}"
        
        # Use git filter-branch to clean commit messages
        if git filter-branch --msg-filter "$FILTER_SCRIPT" --force -- --all; then
            echo -e "${GREEN}   ✅ Successfully cleaned commit messages${NC}"
            ((CLEANED_COUNT++))
            
            # Show summary of changes
            REMAINING_AI=$(git log --all --grep="🤖" --grep="Generated with Claude Code" --grep="Co-Authored-By.*Claude" --oneline || true)
            if [ -z "$REMAINING_AI" ]; then
                echo -e "${GREEN}   ✅ All AI attribution removed${NC}"
            else
                echo -e "${YELLOW}   ⚠️  Some AI attribution may remain:${NC}"
                echo "$REMAINING_AI" | head -3 | sed 's/^/     /'
            fi
        else
            echo -e "${RED}   ❌ Failed to clean repository${NC}"
            # Restore from backup
            git reset --hard "$BACKUP_BRANCH"
            git branch -D "$BACKUP_BRANCH" 2>/dev/null || true
            ((ERROR_COUNT++))
        fi
    else
        echo -e "${RED}   ❌ Repository has uncommitted changes - skipping${NC}"
        git branch -D "$BACKUP_BRANCH"
        ((ERROR_COUNT++))
    fi
    
    echo ""
done

# Cleanup
rm "$FILTER_SCRIPT"

echo -e "${BLUE}📊 Cleanup Summary:${NC}"
echo -e "   • ${GREEN}Cleaned: $CLEANED_COUNT repositories${NC}"
echo -e "   • ${RED}Errors: $ERROR_COUNT repositories${NC}"
echo ""

if [ $CLEANED_COUNT -gt 0 ]; then
    echo -e "${GREEN}🎉 AI attribution cleanup completed!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEPS:${NC}"
    echo -e "${YELLOW}   1. Review the changes in each repository${NC}"
    echo -e "${YELLOW}   2. Force push to update remote branches:${NC}"
    echo -e "${YELLOW}      git push --force-with-lease origin --all${NC}"
    echo -e "${YELLOW}   3. Notify all collaborators to reset their local branches${NC}"
    echo -e "${YELLOW}   4. Delete backup branches when satisfied:${NC}"
    echo -e "${YELLOW}      git branch -D backup-before-cleanup-*${NC}"
    echo ""
    echo -e "${BLUE}💡 Test the cleaned repositories:${NC}"
    echo -e "${BLUE}   git log --oneline -10  # Check recent commits${NC}"
    echo -e "${BLUE}   make quality-check     # Verify functionality${NC}"
fi

if [ $ERROR_COUNT -gt 0 ]; then
    echo -e "${RED}⚠️  Some repositories had errors and were not cleaned${NC}"
    echo -e "${YELLOW}   Check for uncommitted changes and try again${NC}"
fi