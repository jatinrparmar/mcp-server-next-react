#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";
import { ListRootsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Logger utility
const log = {
  info: (message: string, ...args: any[]) => {
    console.error(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.DEBUG === 'true') {
      console.error(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  log.error("Uncaught exception (non-fatal):", error);
});

process.on("unhandledRejection", (reason) => {
  log.error("Unhandled rejection (non-fatal):", reason);
});

async function main() {
  try {
    log.info('Initializing React & Next.js Dev Assistant MCP Server v1.0.0');

    const server = new McpServer({
      name: "nextjs-dev-assistant",
      version: "1.0.0",
    });

    // Handle roots/list request - MCP protocol for workspace roots
    server.server.setRequestHandler(ListRootsRequestSchema, async () => {
      const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
      log.debug('Roots requested, returning:', workspaceRoot);

      return {
        roots: [
          {
            uri: `file://${workspaceRoot}`,
            name: "Project Root"
          }
        ]
      };
    });

    // Register all tools
    log.info('Registering tools...');
    registerTools(server);
    log.info('Tools registered successfully');

    // Create transport and connect
    log.info('Creating stdio transport...');
    const transport = new StdioServerTransport();

    log.info('Connecting server to transport...');
    await server.connect(transport);

    log.info('✓ React & Next.js Dev Assistant MCP Server is running');
    log.info('Server is ready to accept requests via stdio');

  } catch (error) {
    log.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  log.error("Fatal startup error:", err);
  process.exit(1);
});
