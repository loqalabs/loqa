#!/bin/bash

# Clean up branches that have been merged across all Loqa repositories
# This script safely identifies and deletes local and remote branches that have been merged

set -e

echo "🧹 Cleaning up merged branches across all Loqa repositories..."
echo

# List of repository paths
REPO_PATHS=(
    "/Users/anna/Projects/loqalabs/loqa"
    "/Users/anna/Projects/loqalabs/loqa-hub" 
    "/Users/anna/Projects/loqalabs/loqa-commander"
    # "/Users/anna/Projects/loqalabs/loqa-device-service" # Archived Sept 2025
    "/Users/anna/Projects/loqalabs/loqa-relay"
    "/Users/anna/Projects/loqalabs/loqa-proto"
    "/Users/anna/Projects/loqalabs/loqa-skills"
)

# Function to clean up merged branches in a repository
cleanup_repo() {
    local repo_path=$1
    local repo_name=$(basename "$repo_path")
    
    if [ ! -d "$repo_path" ]; then
        echo "⚠️  $repo_name - Repository not found, skipping..."
        return 0
    fi
    
    echo "🔍 Checking $repo_name..."
    cd "$repo_path"
    
    # Fetch latest changes from remote
    git fetch --prune origin 2>/dev/null || echo "   Warning: Could not fetch from origin"
    
    # Switch to main branch to be safe
    git checkout main 2>/dev/null || git checkout master 2>/dev/null || {
        echo "   ⚠️  Could not switch to main/master branch, skipping..."
        return 0
    }
    
    # Pull latest main
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "   Warning: Could not pull latest changes"
    
    # Find merged local branches (excluding main/master)
    local merged_branches=($(git branch --merged | grep -v '\*' | grep -v 'main' | grep -v 'master' | sed 's/^[ \t]*//' || true))
    
    if [ ${#merged_branches[@]} -gt 0 ]; then
        echo "   📋 Found merged local branches:"
        for branch in "${merged_branches[@]}"; do
            echo "      - $branch"
        done
        
        # Delete merged local branches
        for branch in "${merged_branches[@]}"; do
            if git branch -d "$branch" 2>/dev/null; then
                echo "   ✅ Deleted local branch: $branch"
            else
                echo "   ⚠️  Could not delete local branch: $branch (may have unmerged changes)"
            fi
        done
    else
        echo "   ✨ No merged local branches to clean up"
    fi
    
    # Find and clean up remote tracking branches that no longer exist on remote
    echo "   🌐 Cleaning up stale remote tracking branches..."
    local stale_remotes=$(git remote prune origin --dry-run 2>/dev/null | grep "prune" | wc -l | tr -d ' ' || echo "0")
    
    if [ "$stale_remotes" -gt 0 ]; then
        git remote prune origin
        echo "   ✅ Pruned $stale_remotes stale remote tracking branches"
    else
        echo "   ✨ No stale remote tracking branches to clean up"
    fi
    
    echo
}

# Clean up each repository
for repo_path in "${REPO_PATHS[@]}"; do
    cleanup_repo "$repo_path"
done

echo "🎉 Branch cleanup complete across all repositories!"
echo
echo "Note: Only branches that were fully merged into main/master were deleted."
echo "Current feature branches and unmerged work were preserved."