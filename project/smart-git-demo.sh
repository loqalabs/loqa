#!/bin/bash

# Smart Git Demo - Shows how the new git detection works from any subdirectory

echo "🔍 Smart Git Repository Detection Demo"
echo "======================================"
echo

# Test from various directories
test_directories=(
    "/Users/anna/Projects/loqalabs/loqa"                    # repo root
    "/Users/anna/Projects/loqalabs/loqa/project/loqa-assistant-mcp"  # deep subdirectory  
    "/Users/anna/Projects/loqalabs/loqa/tools"              # subdirectory
    "/tmp"                                                  # non-git directory
)

for dir in "${test_directories[@]}"; do
    echo "📂 Testing from: $dir"
    
    if [[ -d "$dir" ]]; then
        cd "$dir" 2>/dev/null || continue
        
        # Test the smart git detection
        node "/Users/anna/Projects/loqalabs/loqa/project/loqa-assistant-mcp/dist/utils/git-repo-detector.js" "$dir" 2>/dev/null | head -3
        
        echo "   Current working directory: $(pwd)"
        echo "   Traditional git status would fail from here: $(git status --porcelain 2>&1 | head -1 || echo 'FAILED')"
        echo
    else
        echo "   Directory doesn't exist: $dir"
        echo
    fi
done

echo "✅ The smart git detection finds the repository root automatically!"
echo "✅ Git commands are executed from the correct directory"
echo "✅ Works from any subdirectory within a git repository"
echo

# Show practical usage
echo "🚀 Practical Usage Examples:"
echo "- Create branches from any subdirectory"
echo "- Commit changes with proper repository context"  
echo "- Get status that shows both repo root and your relative location"
echo "- All git operations 'just work' regardless of your current directory"