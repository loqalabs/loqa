#!/bin/bash

# Install global loqa-mcp command
# This creates a symlink in /usr/local/bin so you can run 'loqa-mcp' from anywhere

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GLOBAL_CMD="/usr/local/bin/loqa-mcp"

echo "🔧 Installing global 'loqa-mcp' command..."

# Create the global command script
sudo tee "$GLOBAL_CMD" > /dev/null << EOF
#!/bin/bash
# Global Loqa MCP Server Command
cd "$SCRIPT_DIR"
exec ./start-mcp.sh "\$@"
EOF

# Make it executable
sudo chmod +x "$GLOBAL_CMD"

echo "✅ Global command installed!"
echo ""
echo "Usage:"
echo "  loqa-mcp           # Start the MCP server"
echo ""
echo "The MCP server will be available for Claude Code to connect to."