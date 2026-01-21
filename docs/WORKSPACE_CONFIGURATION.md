# Workspace Configuration Guide

## Problem Statement

When using this MCP server with VS Code Copilot or other clients, the server needs to know which directory to analyze. The server now implements the **MCP Roots protocol** for proper workspace discovery, with fallback to environment variables and `process.cwd()`.

**Previous issues that are now resolved:**
- ✓ `EISDIR: illegal operation on a directory, read` - Fixed
- ✓ Server analyzing wrong directory (e.g., `/home/username` instead of your project) - Fixed
- ✓ Picking up unrelated files from VS Code history - Fixed

## How It Works

The MCP server uses the following priority order to determine the workspace:

1. **MCP Roots Protocol** (recommended) - Client provides workspace via `roots/list` request
2. **WORKSPACE_ROOT environment variable** - Explicit configuration
3. **process.cwd()** - Fallback to current working directory

## Solution

### Method 1: Using MCP Roots (Recommended - Auto-configured)

**VS Code with GitHub Copilot** automatically provides workspace roots when you have a folder open. No additional configuration needed!

**Example configuration:**

```json
{
  "github.copilot.advanced": {
    "mcp": {
      "servers": {
        "nextjs-dev-assistant": {
          "command": "node",
          "args": ["/absolute/path/to/mcp-server-next-react/build/index.js"],
          "env": {
            "NODE_ENV": "production"
          }
        }
      }
    }
  }
}
```

The server will automatically receive the workspace path from VS Code via the MCP roots protocol.

### Method 2: Environment Variable (Fallback)

If you're configuring this server in VS Code's Copilot settings:

1. Open VS Code Settings (Cmd/Ctrl + ,)
2. Search for "MCP" or navigate to your Copilot MCP configuration
3. Edit your MCP server configuration JSON

**Example configuration:**

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-next-react/build/index.js"],
      "env": {
        "NODE_ENV": "production",
        "WORKSPACE_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

**Key Points:**
- Use `${workspaceFolder}` as the value - VS Code will automatically replace this with your current workspace path
- If you have multiple workspace folders, you can use `${workspaceFolder:folderName}`
- Ensure the `args` path points to the built `build/index.js` file

### Method 2: Direct MCP Configuration File

If you're using a standalone MCP configuration file (e.g., `~/.config/mcp/config.json`):

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/path/to/mcp-server-next-react/build/index.js"],
      "env": {
        "NODE_ENV": "production",
        "WORKSPACE_ROOT": "/absolute/path/to/your/project"
      }
    }
  }
}
```

**Important:** Use absolute paths for `WORKSPACE_ROOT` in this method.

### Method 3: Per-Project Configuration

For custom agents that use this MCP server, you can configure it per project:

1. Create a `.mcp-config.json` in your project root
2. Add the configuration:

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/path/to/mcp-server-next-react/build/index.js"],
      "env": {
        "WORKSPACE_ROOT": "."
      }
    }
  }
}
```

## Verification

After configuration, test it by running:

```bash
# In VS Code, ask your custom agent:
@workspace What MCP tools are available?

# Then try:
Analyze the project for best practices
```

The output should now show:
- ✓ Correct `projectRoot` (your actual project path, not home directory)
- ✓ Relevant files from your project
- ✓ No EISDIR errors

## Troubleshooting

### Issue: Still getting EISDIR error

**Solution:** Make sure you've:
1. Rebuilt the MCP server: `npm run build` in the mcp-server-next-react directory
2. Restarted VS Code or your MCP client
3. Verified the `WORKSPACE_ROOT` environment variable is set correctly

### Issue: Server analyzing wrong directory

**Check:**
```bash
# Add this temporarily to your code to debug:
console.error('WORKSPACE_ROOT:', process.env.WORKSPACE_ROOT);
console.error('Process CWD:', process.cwd());
```

The `WORKSPACE_ROOT` should match your project directory.

### Issue: ${workspaceFolder} not being replaced

**Solution:** This is a VS Code feature. If you're not using VS Code, use absolute paths instead:

```json
{
  "env": {
    "WORKSPACE_ROOT": "/home/username/projects/my-react-app"
  }
}
```

## Custom Agent Configuration

If you're using a custom agent that references this MCP server, ensure your agent description includes:

```markdown
When analyzing projects, the tool will automatically use the configured workspace directory.
If no WORKSPACE_ROOT is set, it falls back to the current working directory.
```

## Environment Variable Priority

The server resolves the project root in this order:
1. Explicit `projectRoot` parameter (if passed to functions)
2. `WORKSPACE_ROOT` environment variable
3. `process.cwd()` (fallback)

## Examples

### Example 1: Single Workspace

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/home/jatin/projects/mcp-server-next-react/build/index.js"],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

### Example 2: Multi-root Workspace

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/home/jatin/projects/mcp-server-next-react/build/index.js"],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder:my-frontend-project}"
      }
    }
  }
}
```

### Example 3: Hardcoded Path (for CI/CD or scripts)

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/usr/local/lib/mcp-servers/nextjs-dev-assistant/build/index.js"],
      "env": {
        "WORKSPACE_ROOT": "/workspace/project"
      }
    }
  }
}
```

## Best Practices

1. **Use `${workspaceFolder}` in VS Code** - It's dynamic and works across different projects
2. **Use absolute paths** - Avoid relative paths which can be ambiguous
3. **Test after configuration** - Always verify with a simple analysis command
4. **Document for team members** - Share your configuration if working in a team
5. **Keep paths consistent** - If moving the MCP server, update all configs

## Related Documentation

- [COPILOT_SETUP.md](./COPILOT_SETUP.md) - Setting up with GitHub Copilot
- [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) - Development setup
- [HOW_TO_USE.md](./HOW_TO_USE.md) - Using the tools
