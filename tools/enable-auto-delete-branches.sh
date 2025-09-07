#!/bin/bash

# Enable automatic deletion of head branches on PR merge for all Loqa repositories
# This script uses GitHub CLI to update repository settings

set -e

echo "🔧 Enabling automatic branch deletion on PR merge for all Loqa repositories..."
echo

# List of repositories to update
REPOS=(
    "loqa"
    "loqa-hub" 
    "loqa-commander"
    "loqa-device-service"
    "loqa-relay"
    "loqa-proto"
    "loqa-skills"
)

# Function to enable auto-delete for a repository
enable_auto_delete() {
    local repo=$1
    echo "⏳ Updating $repo..."
    
    if gh api \
        --method PATCH \
        "/repos/loqalabs/$repo" \
        --field delete_branch_on_merge=true \
        --silent; then
        echo "✅ $repo - Auto-delete enabled"
    else
        echo "❌ $repo - Failed to update settings"
        return 1
    fi
}

# Update each repository
for repo in "${REPOS[@]}"; do
    enable_auto_delete "$repo"
done

echo
echo "🎉 All repositories have been configured to automatically delete head branches on PR merge!"
echo
echo "Note: This only deletes branches when PRs are MERGED, not when closed without merging."
echo "You can verify the settings by visiting: https://github.com/loqalabs/[repo-name]/settings"