# Loqa Git Hooks

This directory contains Git hooks that help maintain code quality and consistency across the Loqa project.

## Available Hooks

### commit-msg
Prevents AI tool attribution from being included in commit messages. Blocks patterns like:
- `Generated with Claude/ChatGPT/AI`
- `Co-Authored-By: Claude`
- `🤖 Generated with...`
- And other AI tool references

## Installation

To activate the hooks in your local repository:

```bash
# From the repository root
cp .githooks/commit-msg .git/hooks/
chmod +x .git/hooks/commit-msg
```

Or use Git's built-in hooks directory feature:

```bash
git config core.hooksPath .githooks
```

## Why These Hooks?

These hooks help ensure that:
- Commit messages focus on the "what" and "why" rather than the tool used
- Git history remains clean and professional
- Attribution stays focused on human contributors

## Bypassing Hooks

If you absolutely need to bypass a hook temporarily:

```bash
git commit --no-verify
```

**Note:** Use this sparingly and only when necessary.