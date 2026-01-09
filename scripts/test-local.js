#!/usr/bin/env node
/**
 * Local testing script for MCP server
 * Run with: node scripts/test-local.js
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, '../build/index.js');

console.log('🚀 Starting Next.js Dev Assistant MCP Server...\n');

// Start the MCP server
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Test request
const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

console.log('📤 Sending test request:', JSON.stringify(testRequest, null, 2));
console.log('\n---\n');

server.stdin.write(JSON.stringify(testRequest) + '\n');

server.stdout.on('data', (data) => {
  console.log('📥 Server response:');
  console.log(data.toString());
});

server.on('close', (code) => {
  console.log(`\n✅ Server exited with code ${code}`);
  process.exit(code);
});

// Handle errors
server.on('error', (error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  server.kill();
  process.exit(0);
});
