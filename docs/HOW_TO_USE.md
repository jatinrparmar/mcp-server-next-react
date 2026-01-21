# How to Use the Custom MCP Server

## Quick Start Guide

This guide shows you how to set up and use the React & Next.js Dev Assistant MCP server in your development workflow.

---

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Using with GitHub Copilot](#using-with-github-copilot)
4. [Using with Claude Desktop](#using-with-claude-desktop)
5. [Using with Cline (VS Code)](#using-with-cline-vs-code)
6. [Available Tools](#available-tools)
7. [Common Workflows](#common-workflows)
8. [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- VS Code (for GitHub Copilot/Cline integration)

### Steps

1. **Clone or download the repository:**
```bash
cd /path/to/your/projects
git clone <repository-url> mcp-server-next-react
# OR download and extract the ZIP
```

2. **Install dependencies:**
```bash
cd mcp-server-next-react
npm install
```

3. **Build the server:**
```bash
npm run build
```

4. **Get the absolute path:**
```bash
pwd
# Copy the output, you'll need it for configuration
```

**Example output:** `/home/username/projects/mcp-server-next-react`

---

## Configuration

### Option 1: GitHub Copilot (VS Code)

#### A. User Settings (Recommended - Works across all projects)

1. Open VS Code Settings:
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Preferences: Open User Settings (JSON)"
   - Press Enter

2. Add this configuration:

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

**Replace `/absolute/path/to/mcp-server-next-react`** with your actual path from step 4 above.

#### B. Workspace Settings (Project-specific)

1. Create `.vscode/settings.json` in your React/Next.js project
2. Add the same configuration as above

### Option 2: Claude Desktop

1. **Find your Claude config file:**
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. **Edit the file and add:**

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

3. **Restart Claude Desktop**

### Option 3: Cline (VS Code Extension)

1. Open Cline settings in VS Code
2. Navigate to MCP servers configuration
3. Add server:

```json
{
  "nextjs-dev-assistant": {
    "command": "node",
    "args": ["/absolute/path/to/mcp-server-next-react/build/index.js"]
  }
}
```

---

## Using with GitHub Copilot

### Verification

After configuration, verify the server is available:

1. Open any React/Next.js file in VS Code
2. Open Copilot Chat (press `Ctrl+Shift+I` or click chat icon)
3. Type: `@workspace what MCP tools are available?`

You should see 11 tools listed.

### Basic Usage

**Analyze your code:**
```
Analyze this file for best practices
```

**Get specific help:**
```
Check this component for security vulnerabilities
```

**Generate components:**
```
Generate a server component called UserProfile with data fetching
```

**Refactor code:**
```
Refactor this class component to functional with hooks
```

### Example Conversations

#### 1. Code Analysis
**You:** `Analyze this entire project`

**Copilot:** Will use `analyze-code` tool without filePath to scan all files, then present:
- Total files scanned
- Issues by severity (critical, high, medium, low)
- Top recommendations
- Overall code quality score

#### 2. Security Review
**You:** `Check for security issues in src/app/api/users/route.ts`

**Copilot:** Will use `check-security` tool with filePath, checking for:
- Environment variable exposure
- SQL injection risks
- XSS vulnerabilities
- Missing input validation
- Hardcoded secrets

#### 3. Migration Help
**You:** `Is my pages directory ready to migrate to App Router?`

**Copilot:** Will use `check-migration-readiness` tool, reporting:
- Ready vs blocked files
- Specific blockers (getServerSideProps, getStaticProps usage)
- Migration steps for each file

---

## Using with Claude Desktop

### Starting Conversation

Open Claude Desktop and start with:

```
I'm working on a Next.js project. Can you help me analyze my code?
```

Claude will automatically detect and use the MCP tools.

### Project-Wide Analysis

```
Please analyze my entire React project for:
1. Code quality issues
2. Security vulnerabilities
3. Performance optimizations
4. Accessibility problems
```

Claude will use multiple tools (analyze-code, check-security, optimize-code, check-accessibility) and provide a comprehensive report.

### Specific File Analysis

```
Here's my component:

[paste code]

Please review it for:
- Best practices
- Performance issues
- Security concerns
```

---

## Available Tools

### 1. **analyze-code**
- **Purpose:** Analyze code for best practices and patterns
- **Use when:** You want to check code quality
- **Parameters:**
  - `filePath` (optional): Specific file to analyze
  - `includeTests` (optional): Include test files

**Example prompts:**
- "Analyze this component"
- "Check my entire project for issues"
- "What's wrong with this code?"

### 2. **review-code**
- **Purpose:** Comprehensive code review with quality metrics
- **Use when:** You need detailed quality assessment
- **Parameters:**
  - `filePath` (optional): Specific file to review

**Example prompts:**
- "Review this file"
- "Give me quality metrics for my codebase"
- "How maintainable is my code?"

### 3. **optimize-code**
- **Purpose:** Get optimization suggestions
- **Use when:** You want to improve performance/bundle size
- **Parameters:**
  - `filePath` (optional): Specific file to optimize

**Example prompts:**
- "How can I optimize this component?"
- "Suggest performance improvements"
- "Reduce bundle size"

### 4. **generate-component**
- **Purpose:** Generate React/Next.js components
- **Use when:** You need boilerplate code
- **Parameters:**
  - `name`: Component name (PascalCase)
  - `type`: server-component, client-component, page, layout, api-route
  - `features`: form, data-fetching, loading, error-boundary, suspense
  - `styling`: tailwind, css-modules, none

**Example prompts:**
- "Generate a UserProfile server component with data fetching"
- "Create a client component with a form"
- "Generate an API route for user authentication"

### 5. **refactor-code**
- **Purpose:** Automated code refactoring
- **Use when:** You need to modernize code patterns
- **Parameters:**
  - `filePath`: File to refactor
  - `pattern`: pages-to-app-router, class-to-functional, prop-drilling-to-context, client-to-server

**Example prompts:**
- "Convert this class component to functional"
- "Migrate this page to App Router"
- "Refactor this to use Context API"

### 6. **get-best-practices**
- **Purpose:** Get framework best practices
- **Use when:** You need guidance
- **Parameters:**
  - `topic` (optional): performance, security, routing, etc.

**Example prompts:**
- "Show me Next.js best practices"
- "What are the security best practices?"
- "How should I handle data fetching?"

### 7. **check-migration-readiness**
- **Purpose:** Check Pages Router → App Router migration
- **Use when:** Planning Next.js migration
- **Parameters:**
  - `filePath` (optional): Specific page or entire pages/

**Example prompts:**
- "Can I migrate to App Router?"
- "What's blocking my migration?"
- "Check if pages/blog/[slug].tsx is ready"

### 8. **find-repeated-code**
- **Purpose:** Detect code duplication
- **Use when:** Looking for refactoring opportunities
- **Parameters:**
  - `filePath` (optional): Specific file or project-wide
  - `minOccurrences`: Threshold (default: 2)
  - `includeSmallPatterns`: Include <3 line patterns

**Example prompts:**
- "Find duplicate code in my project"
- "Where can I extract reusable components?"
- "Show me repeated patterns"

### 9. **check-accessibility**
- **Purpose:** WCAG compliance check
- **Use when:** Ensuring accessibility
- **Parameters:**
  - `filePath` (optional): Specific file or project-wide

**Example prompts:**
- "Check accessibility issues"
- "Is my component WCAG compliant?"
- "Find accessibility violations"

### 10. **check-security**
- **Purpose:** Security vulnerability scan
- **Use when:** Auditing for security issues
- **Parameters:**
  - `filePath` (optional): Specific file or project-wide

**Example prompts:**
- "Scan for security vulnerabilities"
- "Check this API route for security issues"
- "Find hardcoded secrets"

### 11. **manage-security-rules**
- **Purpose:** Configure security rules
- **Use when:** Customizing security checks
- **Parameters:**
  - `action`: list, get-config, enable, disable
  - `ruleId` (for enable/disable): Rule identifier

**Example prompts:**
- "List available security rules"
- "Disable the no-console-sensitive-data rule"
- "Show me the full security configuration"

---

## Common Workflows

### Workflow 1: New Project Setup

**Step 1:** Analyze initial code
```
Analyze my entire Next.js project
```

**Step 2:** Check security
```
Run a security scan on the whole project
```

**Step 3:** Check accessibility
```
Check accessibility compliance across all components
```

**Step 4:** Review recommendations
```
What are the top 5 issues I should fix first?
```

### Workflow 2: Feature Development

**Step 1:** Generate component
```
Generate a UserDashboard server component with:
- Data fetching
- Loading state
- Error boundary
- Tailwind styling
```

**Step 2:** Review generated code
```
Review the component you just created
```

**Step 3:** Optimize
```
How can I optimize this component for performance?
```

### Workflow 3: Code Refactoring

**Step 1:** Find duplication
```
Find repeated code patterns in src/components/
```

**Step 2:** Refactor
```
Refactor src/components/OldComponent.jsx from class to functional
```

**Step 3:** Verify improvements
```
Analyze the refactored component
```

### Workflow 4: Migration Planning

**Step 1:** Check readiness
```
Check if my pages directory is ready for App Router migration
```

**Step 2:** Migrate file by file
```
Migrate pages/blog/[slug].tsx to App Router
```

**Step 3:** Verify migration
```
Analyze the migrated file for any issues
```

### Workflow 5: Security Audit

**Step 1:** Full security scan
```
Run a complete security audit on my project
```

**Step 2:** Check specific vulnerabilities
```
Check for:
1. Hardcoded secrets
2. XSS vulnerabilities
3. SQL injection risks
4. Environment variable exposure
```

**Step 3:** Review security config
```
Show me the security rules configuration
```

**Step 4:** Customize rules (if needed)
```
Disable the no-console-sensitive-data rule for development
```

---

## Troubleshooting

### Server Not Detected

**Problem:** Copilot/Claude doesn't see the MCP tools

**Solutions:**
1. Verify the build path is correct:
   ```bash
   ls /absolute/path/to/mcp-server-next-react/build/index.js
   ```
2. Check the path in your config uses forward slashes (even on Windows)
3. Restart VS Code / Claude Desktop after configuration changes
4. Check for typos in the config JSON

### Build Errors

**Problem:** `npm run build` fails

**Solutions:**
1. Delete `node_modules` and `build/`:
   ```bash
   rm -rf node_modules build
   npm install
   npm run build
   ```
2. Check Node.js version: `node --version` (should be 18+)
3. Clear npm cache: `npm cache clean --force`

### Tools Return Errors

**Problem:** Tools execute but return errors

**Solutions:**
1. Check file paths are absolute and correct
2. Ensure files are saved before analysis
3. Check if the file extension is supported (.ts, .tsx, .js, .jsx)
4. Verify the project has a package.json

### Performance Issues

**Problem:** Analysis takes too long

**Solutions:**
1. Analyze specific files instead of entire project
2. Exclude test files: `includeTests: false`
3. Add patterns to ignore in your project (node_modules is auto-ignored)

### Permission Errors

**Problem:** "EACCES: permission denied"

**Solutions:**
1. Check file permissions:
   ```bash
   chmod +x build/index.js
   ```
2. Run build again: `npm run build`

---

## Testing the Server

### Manual Test

Test the server directly:

```bash
npm test
```

Expected output: JSON response with tools list

### Interactive Inspector

Use the MCP Inspector for interactive testing:

```bash
npm run inspector
```

This opens a web UI where you can:
- See all 11 tools
- Test each tool with different parameters
- View request/response in real-time
- Debug tool behavior

### Test Individual Tools

Create a test file in your project and try:

```javascript
// test-component.jsx
export default function Test() {
  return <div>Test</div>;
}
```

Then ask Copilot/Claude:
```
Analyze test-component.jsx
```

---

## Tips for Best Results

### 1. Be Specific
❌ "Fix my code"
✅ "Analyze src/app/page.tsx for performance issues"

### 2. Use Context
❌ "What's wrong?"
✅ "This is a Next.js 15 project using App Router. Check if my server component follows best practices."

### 3. Ask for Multiple Tools
✅ "Please analyze my component for code quality, security, and accessibility"

### 4. Provide Full Paths
❌ "Check page.tsx"
✅ "Check src/app/dashboard/page.tsx"

### 5. Iterate on Results
```
1. Analyze the file
2. "What are the critical issues?"
3. "How do I fix the XSS vulnerability?"
4. "Show me the corrected code"
5. "Analyze it again to verify"
```

---

## Getting Help

### Check Documentation
- `README.md` - Overview and features
- `docs/COPILOT_SETUP.md` - Detailed Copilot configuration
- `docs/CUSTOM_AGENT_GUIDE.md` - Build custom VS Code extension
- `docs/SECURITY_RULES_GUIDE.md` - Security rules reference
- `docs/RULES_DOCUMENTATION.md` - All rules catalog
- `AGENT.md` - Agent behavior instructions

### Test Locally
```bash
npm run inspector  # Interactive web UI
npm test          # Command-line test
```

### Report Issues
If you find bugs or have suggestions, check the project repository for issue tracker.

---

## Next Steps

1. ✅ Install and configure the server
2. ✅ Verify it works with a simple test
3. ✅ Try the common workflows above
4. ✅ Explore all 11 tools with your project
5. ✅ Customize security rules for your needs
6. ✅ Build the MCP server into your daily workflow

**Happy coding!** 🚀
