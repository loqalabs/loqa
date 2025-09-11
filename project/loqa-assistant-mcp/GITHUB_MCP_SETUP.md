# GitHub MCP Server Setup Guide

This guide explains how to replace the custom `github-cli-specialist` role with GitHub's official MCP server for better GitHub integration.

## Why Switch to Official GitHub MCP Server?

The official GitHub MCP server provides:
- **Native GitHub API Integration** - Direct access to repositories, issues, PRs, Actions
- **Multi-Repository Support** - Built for complex workflows across repositories
- **Granular Tool Control** - Enable/disable specific GitHub features
- **Official Support** - Maintained by GitHub with regular updates
- **Better Claude Code Integration** - Designed specifically for AI assistants

## Prerequisites

1. **Claude Code CLI** installed and configured
2. **GitHub Personal Access Token (PAT)** with appropriate scopes
3. **Docker** (for local setup) or network access for remote setup

## Step 1: Create GitHub Personal Access Token

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/personal-access-tokens/new)
2. Select **Fine-grained personal access token** (recommended) or **Classic token**
3. Add the following scopes:
   - `repo` - Full repository access
   - `read:packages` - Read packages
   - `read:org` - Read organization data
   - `workflow` - GitHub Actions workflow access

## Step 2: Install GitHub MCP Server

Choose one of these installation methods:

### Option A: Remote Server (Recommended)
```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp -H "Authorization: Bearer YOUR_GITHUB_PAT"
```

### Option B: Local Docker Setup
```bash
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_PAT -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```

### Option C: Binary Setup (No Docker)
1. Download the latest release from [github-mcp-server releases](https://github.com/github/github-mcp-server/releases)
2. Add to your PATH
3. Configure with Claude Code:
```bash
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_PAT -- github-mcp-server
```

## Step 3: Verify Installation

```bash
# List configured MCP servers
claude mcp list

# Check GitHub MCP server configuration
claude mcp get github
```

## Step 4: Configure Toolsets (Optional)

The GitHub MCP server supports granular toolset control. Available toolsets:

- `context` - Repository browsing and file operations
- `actions` - GitHub Actions workflow management
- `code_security` - Security scanning and alerts
- `dependabot` - Dependency management
- `discussions` - GitHub Discussions
- `gists` - Gist management
- `issues` - Issue management
- `repositories` - Repository operations

To enable specific toolsets only:
```bash
claude mcp update github --toolsets context,issues,repositories
```

## Step 5: Test Integration

Once configured, test the integration:

1. Start Claude Code in a GitHub repository
2. Try commands like:
   - "List open issues in this repository"
   - "Show recent pull requests"
   - "Create a new issue for the bug we discussed"
   - "Search for files containing 'MCP' in this repository"

## Multi-Repository Workflows

The GitHub MCP server is designed for multi-repository workflows, perfect for Loqa's architecture:

- **Cross-repository issue management** - Link issues across services
- **Coordinated PR creation** - Create related PRs in multiple repositories
- **Branch protection analysis** - Check branch protection across repositories
- **Workflow orchestration** - Manage GitHub Actions across services

## Environment Variables

For advanced configuration:

```bash
# Optional: Configure default organization
export GITHUB_DEFAULT_ORG=loqalabs

# Optional: Set default repository
export GITHUB_DEFAULT_REPO=loqa

# Required: Personal Access Token
export GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify PAT has correct scopes
   - Check token hasn't expired
   - Ensure token has access to target repositories

2. **Connection Issues**
   - Verify Docker is running (for local setup)
   - Check network connectivity
   - Try the remote server option if local fails

3. **Permission Issues**
   - Ensure PAT has repository access
   - Check organization permissions
   - Verify Claude Code has network access

### Verification Commands

```bash
# Test GitHub API access
curl -H "Authorization: Bearer YOUR_PAT" https://api.github.com/user

# Check Claude Code configuration
claude mcp list
claude mcp get github

# Test Docker setup
docker run --rm -e GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_PAT ghcr.io/github/github-mcp-server --help
```

## Migration Benefits

After switching to the official GitHub MCP server, you'll have:

- **Better multi-repository coordination** for Loqa's 8-repository architecture
- **Native GitHub API operations** instead of CLI command parsing
- **Structured data access** with proper error handling
- **Official support and updates** from GitHub
- **Enhanced security** with proper token management

## Security Best Practices

1. **Use minimal token scopes** - Only grant necessary permissions
2. **Rotate tokens regularly** - Set expiration dates and rotate
3. **Store tokens securely** - Use environment variables, not hardcoded values
4. **Monitor token usage** - Check GitHub token usage logs
5. **Revoke unused tokens** - Clean up old or unused tokens

## Next Steps

1. Remove any references to `github-cli-specialist` role from project documentation
2. Update Claude Code configuration to use the GitHub MCP server
3. Test multi-repository workflows with the new integration
4. Train team members on the new GitHub MCP capabilities