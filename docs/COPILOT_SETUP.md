# GitHub Copilot Agent Configuration Guide

This guide shows how to integrate the Next.js Dev Assistant MCP server with GitHub Copilot.

## Prerequisites

1. **Built MCP Server**: Ensure you've run `npm run build` in the project directory
2. **GitHub Copilot**: VS Code extension or CLI with MCP support
3. **Node.js**: Version 18 or higher

## Configuration Steps

### Option 1: VS Code GitHub Copilot Extension

1. **Open VS Code Settings** (`.vscode/settings.json` in your project or user settings)

2. **Add MCP Server Configuration**:

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

**Important**: Replace `/absolute/path/to/mcp-server-next-react` with the actual absolute path to this project.

### Option 2: GitHub Copilot CLI

1. **Create or edit** `~/.config/github-copilot/mcp.json`:

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-next-react/build/index.js"],
      "cwd": "/absolute/path/to/mcp-server-next-react"
    }
  }
}
```

### Option 3: Cline Extension (VS Code)

1. **Open Cline Settings**

2. **Add to MCP Servers**:

```json
{
  "mcp": {
    "servers": {
      "nextjs-dev-assistant": {
        "command": "node",
        "args": ["/absolute/path/to/mcp-server-next-react/build/index.js"]
      }
    }
  }
}
```

### Option 4: Claude Desktop App

1. **Find configuration file**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add configuration**:

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-next-react/build/index.js"]
    }
  }
}
```

## Quick Setup Script

Run this command to get your absolute path:

```bash
cd /path/to/mcp-server-next-react
echo "$(pwd)/build/index.js"
```

Copy the output and use it in your configuration.

## Verification

### 1. Test the Server Locally

```bash
npm test
```

This runs a simple test to verify the server responds correctly.

### 2. Test with MCP Inspector

```bash
npm run inspector
```

This opens the MCP Inspector UI where you can:
- See all available tools
- Test tool calls interactively
- Debug server responses

### 3. Verify in Copilot

After configuration, ask Copilot:

```
@workspace What MCP tools are available?
```

Or directly test a tool:

```
Can you analyze this React component for best practices?

export default function MyComponent() {
  useEffect(() => {
    fetch('/api/data').then(r => r.json());
  }, []);
  
  return <img src="/photo.jpg" />;
}
```

## Available Tools

Once configured, you can use these commands with Copilot:

### 1. Code Analysis
```
Analyze this Next.js code for best practices
```

### 2. Code Review
```
Review this component for code quality
```

### 3. Optimization
```
Suggest optimizations for this code
```

### 4. Component Generation
```
Generate a Next.js server component called UserProfile with data fetching
```

### 5. Code Refactoring
```
Refactor this Pages Router code to App Router
```

### 6. Best Practices
```
Show me Next.js best practices for data fetching
```

### 7. Migration Check
```
Check if this Pages Router page is ready to migrate to App Router
```

## Troubleshooting

### Server Not Found

**Issue**: Copilot doesn't recognize the MCP server

**Solutions**:
1. Verify the absolute path is correct
2. Ensure `build/index.js` exists (run `npm run build`)
3. Check file permissions: `chmod +x build/index.js`
4. Restart VS Code or the Copilot application

### Tools Not Working

**Issue**: Server connects but tools fail

**Solutions**:
1. Check server logs: `npm start` (see console output)
2. Verify Node.js version: `node --version` (need 18+)
3. Run MCP Inspector for debugging: `npm run inspector`

### Permission Denied

**Issue**: Cannot execute the server script

**Solution**:
```bash
chmod +x build/index.js
```

### JSON Parse Errors

**Issue**: Invalid JSON in configuration

**Solution**:
- Use a JSON validator (jsonlint.com)
- Ensure no trailing commas
- Use double quotes for strings
- Verify proper escaping in paths

## Advanced Configuration

### Custom Environment Variables

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/path/to/build/index.js"],
      "env": {
        "NODE_ENV": "production",
        "DEBUG": "true",
        "LOG_LEVEL": "verbose"
      }
    }
  }
}
```

### Working Directory

Some configurations support `cwd`:

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/absolute/path/to/mcp-server-next-react"
    }
  }
}
```

## Usage Tips

### 1. Natural Language Queries

You don't need to memorize tool names. Use natural language:

❌ Don't: "Call analyze-code with my component"
✅ Do: "Analyze this component for Next.js best practices"

### 2. Provide Context

Give Copilot enough context:

❌ Don't: "Optimize this"
✅ Do: "Optimize this Next.js page component for performance and SEO"

### 3. Iterative Refinement

Ask follow-up questions:

```
1. "Analyze this component"
2. "Now apply the suggested fixes"
3. "Review the updated code"
```

### 4. Combine Tools

Use multiple tools in one conversation:

```
"Analyze this component, then generate an optimized version 
following Server Component patterns"
```

## Example Workflow

### Complete Component Development

```
1. "Generate a Next.js server component called BlogPost 
    with data fetching and Tailwind styling"

2. "Analyze the generated component for any issues"

3. "Add SEO metadata and optimize for performance"

4. "Review the final code quality"
```

### Migration Scenario

```
1. "Check if this Pages Router page is ready to migrate"

2. "Show me the migration steps"

3. "Refactor this to App Router pattern"

4. "Analyze the migrated code to verify best practices"
```

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Project README](../README.md)

## Support

For issues or questions:
1. Check the [README](../README.md)
2. Run `npm run inspector` for interactive debugging
3. Check server logs when running `npm start`
4. Review the [examples](../examples/) directory
