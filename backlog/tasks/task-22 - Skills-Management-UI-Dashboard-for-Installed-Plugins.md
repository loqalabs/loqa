---
id: task-22
title: Skills Management UI Dashboard for Installed Plugins
status: To Do
assignee:
  - development
created_date: '2025-09-10 21:21'
labels:
  - skills
  - ui
  - admin
  - dashboard
dependencies: []
priority: medium
---

## Description

Create a comprehensive Skills management tab in loqa-commander for managing Loqa's hybrid skills ecosystem. This includes both traditional Go plugins and Model Context Protocol (MCP) servers, providing a unified interface for skill management, configuration, and monitoring.

## Updated Scope: Hybrid Skills Management UI

With the evolution to support MCP servers alongside Go plugins, this UI must handle both skill types:

### Core Skills Dashboard
- **Unified skill listing**: Display both Go plugins and MCP servers in a single interface
- **Visual distinction**: Clear indicators for skill type (Go plugin vs MCP server)
- **Skill metadata**: Name, description, version, type, enabled status for both skill types
- **Status indicators**: Health status, process status (for MCP), connection status
- **Performance metrics**: Response times, success rates, resource usage

### Go Plugin Management (Existing)
- Toggle to enable/disable Go plugins
- Plugin loading/unloading controls
- Manifest JSON viewer for Go plugins
- Integration with existing Skills API

### MCP Server Management (New)
- **Process control**: Start, stop, restart MCP servers
- **Connection management**: Configure MCP server endpoints and authentication
- **Tool discovery**: Display available MCP tools/functions per server
- **Real-time status**: Process health, connection status, response times
- **Configuration UI**: Manage MCP server settings and permissions
- **Logs integration**: View MCP server logs and error messages

### Advanced Features
- **Unified search**: Search across both plugin types
- **Performance monitoring**: Combined metrics dashboard for all skills
- **Security controls**: Permission management for both skill types
- **Bulk operations**: Enable/disable multiple skills at once
- **Import/Export**: Skill configuration backup and restore

## Implementation Notes

GitHub Issue: https://github.com/loqalabs/loqa/issues/17
