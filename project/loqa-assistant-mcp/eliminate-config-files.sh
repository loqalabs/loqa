#!/bin/bash

# Script to eliminate remaining configuration files and add to .gitignore
# Run this after confirming MCP server works with fully embedded configuration

echo "🗑️  Eliminating configuration files and adding to .gitignore..."

# List of repositories to update
REPOS=(
    "/Users/anna/Projects/loqalabs/loqa-hub"
    "/Users/anna/Projects/loqalabs/loqa-commander"
    "/Users/anna/Projects/loqalabs/loqa-relay"
    "/Users/anna/Projects/loqalabs/loqa-proto"
    "/Users/anna/Projects/loqalabs/loqa-skills"
    "/Users/anna/Projects/loqalabs/www-loqalabs-com"
    "/Users/anna/Projects/loqalabs/loqalabs-github-config"
    "/Users/anna/Projects/loqalabs/loqa"
)

for repo in "${REPOS[@]}"; do
    if [[ -d "$repo" ]]; then
        echo "📁 Processing $repo..."

        # Add .claude-code.json to .gitignore if it exists and isn't already ignored
        if [[ -f "$repo/.gitignore" ]]; then
            if ! grep -q "^\.claude-code\.json$" "$repo/.gitignore"; then
                echo ".claude-code.json" >> "$repo/.gitignore"
                echo "   ✅ Added .claude-code.json to .gitignore"
            else
                echo "   ✓ .claude-code.json already in .gitignore"
            fi
        else
            echo ".claude-code.json" > "$repo/.gitignore"
            echo "   ✅ Created .gitignore with .claude-code.json"
        fi

        # Add CLAUDE.md to .gitignore (except keep service-specific minimal ones for now)
        if [[ "$repo" != "/Users/anna/Projects/loqalabs/loqa" ]]; then
            if [[ -f "$repo/.gitignore" ]]; then
                if ! grep -q "^CLAUDE\.md$" "$repo/.gitignore"; then
                    echo "CLAUDE.md" >> "$repo/.gitignore"
                    echo "   ✅ Added CLAUDE.md to .gitignore"
                else
                    echo "   ✓ CLAUDE.md already in .gitignore"
                fi
            fi
        fi

        echo "   📋 Repository updated"
        echo ""
    else
        echo "⚠️  Directory not found: $repo"
    fi
done

echo "✅ Configuration file elimination complete!"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Test MCP server with: npm run build && npm start"
echo "2. Verify that MCP tools provide all configuration context"
echo "3. If working correctly, remove the actual .claude-code.json files:"
echo "   find /Users/anna/Projects/loqalabs -name '.claude-code.json' -not -path '*/node_modules/*' -delete"
echo "4. Commit the .gitignore changes to prevent future config file additions"

echo ""
echo "🎯 RESULT: Fully configuration-free system!"
echo "   - All service context embedded in MCP server"
echo "   - No external config files to drift or maintain"
echo "   - Developers can't accidentally revert to old bloated configs"