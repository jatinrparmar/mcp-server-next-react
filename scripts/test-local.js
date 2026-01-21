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

// First request: list tools
const listRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {}
};

console.log('📤 Sending list request:', JSON.stringify(listRequest, null, 2));
console.log('\n---\n');

server.stdin.write(JSON.stringify(listRequest) + '\n');

// Prepare requests for directory operations (src)
const dirPath = join(__dirname, '../src');
const analyzeRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: {
    name: 'analyze-code',
    arguments: { filePath: dirPath }
  }
};

const reviewRequest = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'review-code',
    arguments: { filePath: dirPath }
  }
};

const optimizeRequest = {
  jsonrpc: '2.0',
  id: 4,
  method: 'tools/call',
  params: {
    name: 'optimize-code',
    arguments: { filePath: dirPath }
  }
};

const securityRequest = {
  jsonrpc: '2.0',
  id: 5,
  method: 'tools/call',
  params: {
    name: 'check-security',
    arguments: { filePath: dirPath }
  }
};

let sentAnalyze = false;
let sentReview = false;
let sentOptimize = false;
let sentSecurity = false;
const received = new Set();
let buffer = '';

server.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  for (const line of lines) {
    if (!line.trim()) continue;
    console.log('📥 Server response:');
    console.log(line);
    try {
      const msg = JSON.parse(line);
      if (msg.id === 1 && !sentAnalyze) {
        console.log('\n📤 Sending analyze-code directory request:', JSON.stringify(analyzeRequest, null, 2));
        server.stdin.write(JSON.stringify(analyzeRequest) + '\n');
        sentAnalyze = true;
      } else if (msg.id === 2 && !sentReview) {
        received.add(2);
        console.log('\n📤 Sending review-code directory request:', JSON.stringify(reviewRequest, null, 2));
        server.stdin.write(JSON.stringify(reviewRequest) + '\n');
        sentReview = true;
      } else if (msg.id === 3 && !sentOptimize) {
        received.add(3);
        console.log('\n📤 Sending optimize-code directory request:', JSON.stringify(optimizeRequest, null, 2));
        server.stdin.write(JSON.stringify(optimizeRequest) + '\n');
        sentOptimize = true;
      } else if (msg.id === 4 && !sentSecurity) {
        received.add(4);
        console.log('\n📤 Sending check-security directory request:', JSON.stringify(securityRequest, null, 2));
        server.stdin.write(JSON.stringify(securityRequest) + '\n');
        sentSecurity = true;
      } else if (msg.id === 5) {
        received.add(5);
        console.log('\n✅ Received check-security response. Exiting...');
        server.kill();
      }
    } catch (err) {
      // Non-JSON line; ignore
    }
  }
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
