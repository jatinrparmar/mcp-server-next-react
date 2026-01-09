# Configuration Examples

This file contains configuration examples for various MCP clients and tools.

## GitHub Copilot (VS Code Extension)

### User Settings (Recommended)

File: `~/.config/Code/User/settings.json` or via VS Code Settings UI

```json
{
  "github.copilot.advanced": {
    "mcp": {
      "servers": {
        "nextjs-dev-assistant": {
          "command": "node",
          "args": ["/absolute/path/to/mcp-server-next-react/build/index.js"],
          "env": {
            "NODE_ENV": "production",
            "DEBUG": "false"
          }
        }
      }
    }
  }
}
```

### Workspace Settings

File: `.vscode/settings.json` in your Next.js project

```json
{
  "github.copilot.advanced": {
    "mcp": {
      "servers": {
        "nextjs-dev-assistant": {
          "command": "node",
          "args": ["/absolute/path/to/mcp-server-next-react/build/index.js"]
        }
      }
    }
  }
}
```

## Claude Desktop

### macOS

File: `~/Library/Application Support/Claude/claude_desktop_config.json`

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

### Linux

File: `~/.config/Claude/claude_desktop_config.json`

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

### Windows

File: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp-server-next-react\\build\\index.js"]
    }
  }
}
```

## Cline (VS Code Extension)

File: VS Code Settings or `.vscode/settings.json`

```json
{
  "mcp": {
    "servers": {
      "nextjs-dev-assistant": {
        "command": "node",
        "args": ["/absolute/path/to/mcp-server-next-react/build/index.js"],
        "cwd": "/absolute/path/to/mcp-server-next-react"
      }
    }
  }
}
```

## GitHub Copilot CLI

File: `~/.config/github-copilot/mcp.json`

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

## Docker Configuration

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "build/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  nextjs-dev-assistant:
    build: .
    volumes:
      - ./src:/app/src:ro
      - ./build:/app/build
    environment:
      - NODE_ENV=production
      - DEBUG=false
    stdin_open: true
    tty: true
```

## NPX Configuration (Future)

When published to npm, users can run:

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "npx",
      "args": ["mcp-server-next-react"]
    }
  }
}
```

## Environment Variables

All configurations support these environment variables:

- `NODE_ENV`: Set to `production` or `development`
- `DEBUG`: Set to `true` for verbose logging
- `LOG_LEVEL`: `verbose`, `info`, `warn`, `error`

Example with environment variables:

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

## Testing Configuration

### MCP Inspector

```bash
# Install inspector globally (optional)
npm install -g @modelcontextprotocol/inspector

# Run with local server
mcp-inspector node build/index.js

# Or use project script
npm run inspector
```

### Manual Testing with stdio

```javascript
// test-config.js
import { spawn } from 'child_process';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('mcp-config.json', 'utf-8'));
const serverConfig = config.mcpServers['nextjs-dev-assistant'];

const server = spawn(serverConfig.command, serverConfig.args, {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env, ...serverConfig.env }
});

// Send test request
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

server.stdin.write(JSON.stringify(request) + '\n');

server.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
  server.kill();
});
```

## Troubleshooting

### Get Absolute Path

```bash
# macOS/Linux
cd /path/to/mcp-server-next-react
pwd
echo "$(pwd)/build/index.js"

# Windows (PowerShell)
cd C:\path\to\mcp-server-next-react
$pwd = Get-Location
Write-Output "$pwd\build\index.js"
```

### Test Configuration

```bash
# Verify the path exists
ls -l /path/to/mcp-server-next-react/build/index.js

# Test execution
node /path/to/mcp-server-next-react/build/index.js

# Should see: "Next.js Dev Assistant MCP Server is running"
```

### Common Path Issues

❌ **Wrong**: Relative paths
```json
"args": ["./build/index.js"]  // Don't use this
```

✅ **Correct**: Absolute paths
```json
"args": ["/home/user/projects/mcp-server-next-react/build/index.js"]
```

❌ **Wrong**: Home directory shortcut
```json
"args": ["~/projects/mcp-server-next-react/build/index.js"]  // Don't use this
```

✅ **Correct**: Full expanded path
```json
"args": ["/home/user/projects/mcp-server-next-react/build/index.js"]
```

## Multiple Projects Setup

You can run multiple MCP servers simultaneously:

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/path/to/mcp-server-next-react/build/index.js"]
    },
    "other-mcp-server": {
      "command": "node",
      "args": ["/path/to/other-server/index.js"]
    }
  }
}
```

## Advanced Configuration

### Custom Working Directory

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

### With Custom Node Path

```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "/usr/local/bin/node",
      "args": ["/path/to/build/index.js"]
    }
  }
}
```

### With PM2 Process Manager

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nextjs-dev-assistant',
    script: './build/index.js',
    interpreter: 'node',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

## See Also

- [Copilot Setup Guide](COPILOT_SETUP.md)
- [Local Development Guide](LOCAL_DEVELOPMENT.md)
- [Main README](../README.md)
