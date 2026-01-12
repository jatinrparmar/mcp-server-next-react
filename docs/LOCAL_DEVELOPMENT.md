# Local Development & Testing Guide

This guide covers local development, testing, and debugging of the Next.js Dev Assistant MCP server.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Run Locally
```bash
npm start
```

The server will start and wait for JSON-RPC messages via stdin/stdout.

## Development Scripts

### `npm run build`
Compiles TypeScript to JavaScript and makes the output executable.

```bash
npm run build
```

Output: `build/` directory with compiled JavaScript

### `npm run dev`
Watches for file changes and recompiles automatically.

```bash
npm run dev
```

Keep this running in one terminal while developing.

### `npm test`
Runs a basic local test to verify the server responds correctly.

```bash
npm test
```

This sends a sample request and displays the server response.

### `npm run inspector`
Opens the MCP Inspector for interactive testing and debugging.

```bash
npm run inspector
```

This provides a web UI where you can:
- View all available tools
- Test tool calls with custom parameters
- See real-time request/response data
- Debug issues visually

## Testing Tools Locally

### Method 1: MCP Inspector (Recommended)

The easiest way to test:

```bash
npm run inspector
```

Then:
1. Open the URL displayed in your browser
2. Select a tool from the list
3. Fill in parameters
4. Click "Call Tool"
5. View the response

### Method 2: Manual JSON-RPC Testing

Create a test script:

```javascript
// test-tool.js
import { spawn } from 'child_process';

const server = spawn('node', ['build/index.js']);

// List all tools
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

// Call a tool
const analyzeRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: {
    name: 'analyze-code',
    arguments: {
      code: 'export default function Test() { return <img src="test.jpg" />; }',
      filePath: 'components/Test.tsx'
    }
  }
};

setTimeout(() => {
  server.stdin.write(JSON.stringify(analyzeRequest) + '\n');
}, 100);

server.stdout.on('data', (data) => {
  console.log('Response:', data.toString());
});
```

Run it:
```bash
node test-tool.js
```

### Method 3: Using Examples

The project includes example test cases:

```bash
# Test analyze-code
cat examples/test-analyze.json

# Test generate-component  
cat examples/test-generate.json
```

Create a test runner:

```bash
#!/bin/bash
# run-example.sh

EXAMPLE_FILE=$1
REQUEST=$(cat "$EXAMPLE_FILE")

echo "$REQUEST" | node build/index.js
```

Usage:
```bash
chmod +x run-example.sh
./run-example.sh examples/test-analyze.json
```

## Debugging

### Enable Debug Logging

Set the `DEBUG` environment variable:

```bash
DEBUG=true npm start
```

This shows detailed logging including:
- Server initialization steps
- Tool registrations
- Request/response data
- Error stack traces

### Common Issues

#### 1. Server Won't Start

**Symptoms**: Exit code 1 immediately

**Solutions**:
```bash
# Check for syntax errors
npm run build

# Verify file exists
ls -la build/index.js

# Check permissions
chmod +x build/index.js

# Test Node.js version (need 18+)
node --version
```

#### 2. Tools Not Registering

**Symptoms**: `tools/list` returns empty

**Solutions**:
```bash
# Check for TypeScript errors
npm run build

# Verify imports are correct
grep -r "import.*from" src/

# Check rules files exist
ls -la src/config/*.json
ls -la src/rules/*.json
```

#### 3. JSON Parse Errors

**Symptoms**: "Unexpected token" errors

**Solutions**:
- Validate JSON files: `npx jsonlint src/config/next-llm-rules.json`
- Check for trailing commas
- Verify file encoding (should be UTF-8)

#### 4. Module Not Found

**Symptoms**: "Cannot find module" errors

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Project Structure

```
mcp-server-next-react/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── config/
│   │   ├── next-llm-rules.json    # Next.js configuration & rules
│   │   └── react-llm-rules.json   # React configuration & rules
│   ├── core/
│   │   ├── analyzer.ts            # Code analysis logic
│   │   ├── optimizer.ts           # Optimization logic
│   │   └── reviewer.ts            # Code review logic
│   ├── rules/
│   │   ├── loadRules.ts           # Rule loader
│   │   ├── nextjs-llm-best-practices.json  # Next.js best practices
│   │   └── react-llm-best-practices.json   # React best practices
│   ├── tools/
│   │   └── index.ts               # MCP tool definitions
│   └── types/
│       └── schema.ts              # TypeScript types
├── build/                          # Compiled JavaScript (gitignored)
├── examples/                       # Test examples
├── scripts/                        # Development scripts
└── docs/                          # Documentation
```

## Modifying Rules

### 1. Edit Configuration

Edit `src/config/next-llm-rules.json`:

```json
{
  "bestPractices": [
    {
      "rule": "my-custom-rule",
      "description": "My custom best practice",
      "severity": "warning"
    }
  ]
}
```

### 2. Implement Detection Logic

Edit the appropriate core file (`analyzer.ts`, `optimizer.ts`, or `reviewer.ts`):

```typescript
private checkMyCustomRule(code: string, issues: Issue[]): void {
  if (/* your detection logic */) {
    issues.push({
      type: 'warning',
      category: 'custom',
      message: 'Custom rule violation detected',
      fix: 'How to fix it'
    });
  }
}
```

### 3. Call Your Check

Add to the main analysis method:

```typescript
async analyzeCode(code: string, filePath: string): Promise<AnalysisResult> {
  // ... existing checks
  this.checkMyCustomRule(code, issues);
  // ...
}
```

### 4. Rebuild and Test

```bash
npm run build
npm run inspector
```

## Adding New Tools

### 1. Define Tool Schema

In `src/tools/index.ts`:

```typescript
server.tool(
  'my-new-tool',
  'Description of what the tool does',
  {
    param1: z.string().describe('Description of param1'),
    param2: z.number().optional().describe('Optional param2'),
  },
  async ({ param1, param2 }) => {
    try {
      // Your tool logic here
      const result = doSomething(param1, param2);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }
);
```

### 2. Rebuild and Test

```bash
npm run build
npm run inspector
```

Your new tool will appear in the tool list.

## Performance Testing

### Benchmark Tool Execution

```javascript
// benchmark.js
import { spawn } from 'child_process';

const server = spawn('node', ['build/index.js']);

const start = Date.now();

const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'analyze-code',
    arguments: {
      code: `/* large code sample */`,
      filePath: 'test.tsx'
    }
  }
};

server.stdin.write(JSON.stringify(request) + '\n');

server.stdout.once('data', () => {
  const duration = Date.now() - start;
  console.log(`Execution time: ${duration}ms`);
  server.kill();
});
```

### Memory Profiling

```bash
node --inspect build/index.js
```

Then open Chrome DevTools (chrome://inspect) to profile memory usage.

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test MCP Server

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
```

## Tips & Best Practices

### 1. Use TypeScript Strictly

The project uses `strict: true`. Keep it that way for better reliability.

### 2. Test Rule Changes

Always test rule changes with the MCP Inspector before committing.

### 3. Handle Errors Gracefully

Always wrap tool logic in try-catch blocks and return proper error messages.

### 4. Keep Rules Maintainable

Document complex detection logic in comments.

### 5. Version Control Rules

Commit rule changes with clear descriptions of what was added/changed.

## Resources

- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project README](../README.md)
- [Copilot Setup Guide](./COPILOT_SETUP.md)
