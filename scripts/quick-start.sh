#!/bin/bash

# Quick Start Script for Next.js Dev Assistant MCP Server
# This script helps you get started quickly

set -e

echo "🚀 Next.js Dev Assistant MCP Server - Quick Start"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get absolute path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Project Directory:${NC} $PROJECT_DIR"
echo ""

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Error: Node.js 18 or higher required${NC}"
    echo "  Current version: $(node -v)"
    echo "  Please upgrade Node.js"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
echo ""

# Check if dependencies are installed
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    cd "$PROJECT_DIR" && npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Build the project
if [ ! -d "$PROJECT_DIR/build" ] || [ "$1" == "--rebuild" ]; then
    echo -e "${YELLOW}Building project...${NC}"
    cd "$PROJECT_DIR" && npm run build
    echo -e "${GREEN}✓ Build complete${NC}"
    echo ""
else
    echo -e "${GREEN}✓ Build directory exists${NC}"
    echo "  (Use --rebuild flag to force rebuild)"
    echo ""
fi

# Display options
echo ""
echo -e "${GREEN}Setup complete!${NC} What would you like to do?"
echo ""
echo "Available commands:"
echo -e "  ${BLUE}1)${NC} npm start          - Start the MCP server"
echo -e "  ${BLUE}2)${NC} npm test           - Run basic tests"
echo -e "  ${BLUE}3)${NC} npm run inspector  - Open MCP Inspector for interactive testing"
echo -e "  ${BLUE}4)${NC} npm run dev        - Watch mode for development"
echo ""
echo "Configuration paths for Copilot/Claude:"
echo -e "${YELLOW}$PROJECT_DIR/build/index.js${NC}"
echo ""
echo "📖 Read the guides:"
echo "  - docs/COPILOT_SETUP.md     - Setup with GitHub Copilot"
echo "  - docs/LOCAL_DEVELOPMENT.md - Local development guide"
echo "  - README.md                 - Full documentation"
echo ""

# Offer to show configuration example
read -p "Show example Copilot configuration? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Example VS Code settings.json configuration:${NC}"
    echo ""
    cat << EOF
{
  "github.copilot.advanced": {
    "mcp": {
      "servers": {
        "nextjs-dev-assistant": {
          "command": "node",
          "args": ["$PROJECT_DIR/build/index.js"],
          "env": {
            "NODE_ENV": "production"
          }
        }
      }
    }
  }
}
EOF
    echo ""
fi

# Offer to run inspector
read -p "Open MCP Inspector now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Starting MCP Inspector...${NC}"
    cd "$PROJECT_DIR" && npm run inspector
fi

echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
