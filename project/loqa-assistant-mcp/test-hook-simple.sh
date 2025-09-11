#!/bin/bash

# Simple test version of the hook for debugging

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Find MCP server
REPO_ROOT=$(git rev-parse --show-toplevel)
WORKSPACE_ROOT=$(dirname "$REPO_ROOT")
MCP_SERVER_PATH="$WORKSPACE_ROOT/loqa/project/loqa-assistant-mcp/dist/index.js"

echo -e "${YELLOW}Debug Info:${NC}"
echo "Repo root: $REPO_ROOT"
echo "Workspace root: $WORKSPACE_ROOT"  
echo "MCP server path: $MCP_SERVER_PATH"
echo "MCP server exists: $([ -f "$MCP_SERVER_PATH" ] && echo "YES" || echo "NO")"
echo ""

if [ ! -f "$MCP_SERVER_PATH" ]; then
    echo -e "${RED}❌ MCP server not found${NC}"
    exit 1
fi

# Get commit message from stdin or argument
COMMIT_MESSAGE="${1:-test commit message}"
if [ -p /dev/stdin ]; then
    COMMIT_MESSAGE=$(cat)
fi

echo "Testing with message: $COMMIT_MESSAGE"
echo ""

# Create simple JSON without complex escaping
JSON_REQUEST='{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"validate_commit_message","arguments":{"message":"'"$COMMIT_MESSAGE"'"}}}'

echo -e "${YELLOW}🔍 Calling MCP server...${NC}"
echo "JSON Request: $JSON_REQUEST"
echo ""

# Call MCP server
RESULT=$(echo "$JSON_REQUEST" | node "$MCP_SERVER_PATH" 2>/dev/null | grep -E '^\{.*\}$' | head -1)
echo "Raw result: $RESULT"
echo ""

# Try to parse result
if command -v jq >/dev/null 2>&1; then
    echo "Parsed result:"
    echo "$RESULT" | jq . 2>/dev/null || echo "Failed to parse JSON"
else
    echo "jq not available, showing raw result"
fi