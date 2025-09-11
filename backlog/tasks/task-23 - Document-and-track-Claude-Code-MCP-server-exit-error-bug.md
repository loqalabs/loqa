---
id: task-23
title: Document and track Claude Code MCP server exit error bug
status: To Do
assignee: []
created_date: '2025-09-11 21:12'
labels: [external-bug, claude-code, mcp, tracking]
dependencies: []
priority: Medium
type: Documentation
github_issue: "#80"
---

## Description

Track and document the Claude Code CLI bug that shows false positive "MCP server failed" error on exit. This is **NOT** an issue with our MCP server implementation - it's a known regression bug in Claude Code v1.0.63+.

## Background

During MCP server improvements (PR #79), we discovered this error message appears when exiting Claude Code despite our MCP server working correctly and following all best practices.

## Key Information

- **Upstream Issue**: https://github.com/anthropics/claude-code/issues/5506
- **Affected Versions**: Claude Code CLI v1.0.63+
- **Our GitHub Issue**: https://github.com/loqalabs/loqa/issues/80
- **Status**: External bug - no action needed on our side
