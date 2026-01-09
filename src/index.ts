#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";

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
process.on('uncaughtException', (error: Error) => {
  log.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  log.error('Unhandled rejection:', reason);
  process.exit(1);
});

async function main() {
  try {
    log.info('Initializing React & Next.js Dev Assistant MCP Server v1.0.0');
    
    const server = new McpServer({
      name: "react-nextjs-dev-assistant",
      version: "1.0.0",
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

main();
