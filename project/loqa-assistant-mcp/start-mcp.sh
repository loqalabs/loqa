#!/bin/bash

# Loqa MCP Server Startup Script
# This script ensures the MCP server is built and ready to run

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting Loqa Assistant MCP Server..." >&2

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..." >&2
    npm install
fi

# Check if dist directory exists and is newer than src
if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
    echo "🔨 Building TypeScript..." >&2
    npm run build
fi

# Start the MCP server
echo "✅ MCP server ready - starting..." >&2
exec npm start