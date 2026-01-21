# Custom MCP Agent for VS Code - Configuration Guide

## Overview

This guide walks you through **configuring a custom AI agent in VS Code** to use the React & Next.js Dev Assistant MCP server via **stdio** and follow agent behavior instructions from **AGENT.md**.

**What you'll do:**
1. ✅ Setup the MCP server path in VS Code settings
2. ✅ Create and configure a custom agent in VS Code
3. ✅ Attach agent behavior instructions (AGENT.md)
4. ✅ Verify the connection and test tools

**You do NOT need to:**
- ❌ Build a VS Code extension
- ❌ Write any code
- ❌ Manage build tools

---

## ⚠️ Important: Workspace Configuration

**CRITICAL:** The MCP server needs to know which directory to analyze. Without proper configuration, it will default to your home directory and fail with `EISDIR` errors.

👉 **See [WORKSPACE_CONFIGURATION.md](./WORKSPACE_CONFIGURATION.md)** for complete setup instructions.

**Quick Fix:** When configuring the MCP server below, ensure you add the `WORKSPACE_ROOT` environment variable:

```json
{
  "env": {
    "NODE_ENV": "production",
    "WORKSPACE_ROOT": "${workspaceFolder}"
  }
}
```

---

## Prerequisites

Before starting, ensure:
- **Node.js 18+** installed (`node --version`)
- **MCP Server built** in this repository:
  ```bash
  npm run build
  ```
- **Absolute path to MCP server ready:**
  ```bash
  pwd
  # Output: /home/username/projects/mcp-server-next-react
  # Full path: /home/username/projects/mcp-server-next-react/build/index.js
  ```
- **AGENT.md file** exists at repository root (contains behavior rules)

---

## Step 1: Configure MCP Server in VS Code Settings

### 1.1 Open VS Code Settings (JSON)

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `Preferences: Open User Settings (JSON)`
3. Press Enter

### 1.2 Add MCP Server Configuration

In the JSON settings file, add this configuration:

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
            "WORKSPACE_ROOT": "${workspaceFolder}"
          }
        }
      }
    }
  }
}
```

**Important:** The `WORKSPACE_ROOT: "${workspaceFolder}"` line is REQUIRED to prevent `EISDIR` errors. VS Code will automatically replace `${workspaceFolder}` with your current workspace path.

### 1.3 Update the Path

Replace `/absolute/path/to/mcp-server-next-react` with your actual path.

**Example:**
```json
"args": ["/home/jatin/projects/mcp-server-next-react/build/index.js"]
```

### 1.4 Save Settings

The file auto-saves. MCP server path is now configured.

---

## Step 2: Create Custom Agent in VS Code

### 2.1 Access Agent Configuration

1. Open VS Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type: `Copilot: Open Agent Menu` (or look for agent dropdown in Copilot Chat)
4. Select dropdown showing agent options

### 2.2 Configure Custom Agent

In the **agent dropdown menu**, look for one of these options:
- **"Configure Custom Agent"**
- **"Create New Agent"**
- **"Manage Agents"**

Click on the option to proceed.

### 2.3 Create New Custom Agent

You'll see a dialog asking:

```
Would you like to create a new custom agent?
[Yes] [No]
```

Select **"Yes"** to proceed.

---

## Step 3: Choose Agent Storage Location

### 3.1 Storage Location Dialog

VS Code will ask:

```
Where should this custom agent be stored?

📍 Choose one:
  A) GitHub/Agents (cloud-synced)
  B) User Data (local machine) ✅ RECOMMENDED
```

**Select "User Data"** for local configuration.

**Why User Data?**
- Keeps agent configuration on your machine
- Agent instructions stay local with your MCP server
- No cloud sync needed
- Better for development and testing

### 3.2 Confirm Selection

Click on "User Data" directory option.

---

## Step 4: Enter Agent Details

### 4.1 Agent Configuration Form

VS Code will show a form asking for:

```
Agent Name:
├─ Enter: React Next.js Dev Assistant
└─ (This is the display name in chat)

Agent ID: (auto-filled, usually)
├─ react-nextjs-dev-assistant
└─ (Keep as-is or modify if needed)

Description:
├─ AI agent for React/Next.js code analysis, optimization, 
│  security, and refactoring using local MCP tools
└─ (This appears in agent selector)
```

### 4.2 Fill in the Details

1. **Agent Name:** `React Next.js Dev Assistant`
2. **Agent ID:** `react-nextjs-dev-assistant` (auto-generated, keep it)
3. **Description:** `AI agent for React/Next.js development with MCP tools`

### 4.3 Create Agent

Click **"Create Agent"** or **"OK"**

You'll see a confirmation:
```
✅ Agent created successfully!
Agent ID: react-nextjs-dev-assistant
Location: User Data
```

---

## ⭐ CRITICAL: Step 5 - Attach Agent Instructions (AGENT.md)

This is the **most important step**. The agent must load **AGENT.md** to know how to use the MCP tools correctly.

### 5.1 Locate Agent Configuration File

After creating the agent, VS Code stores it locally at:

**Find it:**

**Windows:**
```
%APPDATA%\Code\User\globalStorage\github.copilot\agents\react-nextjs-dev-assistant\
```

**macOS:**
```
~/Library/Application Support/Code/User/globalStorage/github.copilot/agents/react-nextjs-dev-assistant/
```

**Linux:**
```
~/.config/Code/User/globalStorage/github.copilot/agents/react-nextjs-dev-assistant/
```

Or use VS Code directly:

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `Developer: Open Extension Folder`
3. Navigate to agent config directory

### 5.2 Find and Open Agent Config File

In the agent directory, look for:
- `config.json` (main config)
- `instructions.txt` or similar
- Or `manifest.json`

Open the **config.json** or equivalent.

### 5.3 Attach AGENT.md Content

**Option A: Embed AGENT.md (Recommended)**

1. Open `AGENT.md` from the repository root in an editor
2. Select **ALL content** (`Ctrl+A` or `Cmd+A`)
3. Copy it (`Ctrl+C` or `Cmd+C`)
4. In agent config file, find the field:
   - `"instructions"` or
   - `"systemPrompt"` or
   - `"agentPrompt"` or
   - `"behavior"`

5. Paste the AGENT.md content there:

```json
{
  "id": "react-nextjs-dev-assistant",
  "name": "React Next.js Dev Assistant",
  "instructions": "[PASTE ENTIRE AGENT.MD CONTENT HERE]",
  "location": "user-data"
}
```

6. Save the file

### 5.4 Verify Instructions Saved

1. Close the config file
2. Reopen it
3. Confirm all AGENT.md content is present
4. **Restart VS Code completely**

---

## Step 6: Verify MCP Connection

### 6.1 Test MCP Server Discovery

1. Open VS Code (fresh start)
2. Open **Copilot Chat** (Ctrl+Shift+I or click chat icon)
3. Type and send:

```
@workspace What MCP tools are available?
```

### 6.2 Expected Response

You should see **11 tools listed**:

```
✅ Available MCP Tools:

1. analyze-code - Analyze React/Next.js code for best practices
2. review-code - Comprehensive code review with quality metrics
3. optimize-code - Performance and bundle size optimization
4. generate-component - Generate React/Next.js components
5. refactor-code - Automated code refactoring patterns
6. get-best-practices - Best practices guide for your framework
7. check-migration-readiness - Pages Router to App Router readiness
8. find-repeated-code - Duplicate code and pattern detection
9. check-accessibility - WCAG accessibility compliance check
10. check-security - Security vulnerability scanning
11. manage-security-rules - Security rules configuration
```

### 6.3 If Tools Not Listed

**Troubleshoot:**
1. Check MCP server path in settings (Step 1)
2. Verify `build/index.js` exists: `ls /path/to/build/index.js`
3. Make executable: `chmod +x /path/to/build/index.js`
4. Rebuild server: `npm run build`
5. Restart VS Code

---

## Step 7: Test a Tool Call

### 7.1 Test with Simple Request

Ask the agent:

```
Analyze the current file for best practices
```

### 7.2 Expected Behavior

1. Agent recognizes "analyze" intent
2. Agent calls `analyze-code` MCP tool with current file path
3. MCP server returns analysis results
4. Agent displays results following AGENT.md formatting:
   ```
   📊 Analysis Summary
   - Framework: [React/Next.js]
   - Issues: [count]
   
   🔴 Critical: [list]
   🟡 Warnings: [list]
   ✅ Score: [X/100]
   ```

### 7.3 If Tool Call Fails

Check:
1. AGENT.md content properly copied to agent config
2. MCP server path is correct
3. VS Code restarted
4. File is saved (not in unsaved state)

---

## Step 8: Common Configuration Issues

### Issue 1: "Tools not found" or "MCP server not responding"

**Fix:**
```bash
# Verify build
cd /path/to/mcp-server-next-react
npm run build

# Check file exists
ls -la build/index.js

# Make executable
chmod +x build/index.js

# Verify path in settings
# (Check Step 1 configuration)
```

### Issue 2: "Agent ignores AGENT.md instructions"

**Fix:**
1. Confirm AGENT.md content is **fully copied** to agent config
2. Check agent config JSON is valid (no syntax errors)
3. Restart VS Code completely
4. Delete and recreate agent if necessary

### Issue 3: "Permission denied" when connecting

**Fix:**
```bash
chmod +x /absolute/path/to/mcp-server-next-react/build/index.js
```

### Issue 4: "Incorrect path" or "File not found"

**Fix:**
1. Get absolute path:
   ```bash
   cd /path/to/mcp-server-next-react
   pwd
   ```
2. Update settings with full absolute path
3. Use `/` not `\` even on Windows
4. Restart VS Code

---

## Step 9: Usage Examples

Once configured and verified, use like this:

### Example 1: Analyze a File
```
Analyze src/app/page.tsx for React/Next.js best practices
```
→ Invokes `analyze-code` tool

### Example 2: Security Scan
```
Security scan this API route for vulnerabilities
```
→ Invokes `check-security` tool

### Example 3: Generate Component
```
Generate a UserProfile server component with:
- Data fetching
- Loading state
- Error boundary
- Tailwind styling
```
→ Invokes `generate-component` tool

### Example 4: Refactor Code
```
Convert this class component to functional with hooks
```
→ Invokes `refactor-code` tool with `class-to-functional` pattern

### Example 5: Check Accessibility
```
Check this page for WCAG accessibility issues
```
→ Invokes `check-accessibility` tool

### Example 6: Manage Security Rules
```
List available security rules
```
→ Invokes `manage-security-rules` with `list` action

---

## Quick Reference Checklist

Before using the agent, verify:

- ✅ **Step 1:** MCP server path in VS Code settings
- ✅ **Step 2:** Custom agent created in VS Code (User Data location)
- ✅ **Step 3:** Agent storage confirmed as "User Data"
- ✅ **Step 4:** Agent name and ID filled in
- ✅ **Step 5:** AGENT.md content copied to agent config
- ✅ **Step 6:** MCP tools listed when asking "@workspace" query
- ✅ **Step 7:** At least one tool call tested successfully
- ✅ **Step 8:** All troubleshooting checks passed
- ✅ **VS Code restarted** after configuration changes

---

## File Locations Reference

```
Repository Root:
├── build/index.js                    # ← MCP server entry (stdio)
├── AGENT.md                          # ← Agent instructions (COPY TO AGENT CONFIG)
├── docs/
│   ├── CUSTOM_AGENT_GUIDE.md        # ← This file
│   └── HOW_TO_USE.md                # ← Usage guide
└── src/
    └── config/
        ├── react-llm-best-practices.json
        ├── nextjs-llm-best-practices.json
        ├── react-llm-security-rules.json
        ├── nextjs-llm-security-rules.json
        └── react-next-llm-accessibility-rules.json

VS Code Agent Config (Local):
├── Windows: 
│   %APPDATA%\Code\User\globalStorage\github.copilot\agents\
│   react-nextjs-dev-assistant\config.json
│
├── macOS: 
│   ~/Library/Application Support/Code/User/globalStorage/
│   github.copilot/agents/react-nextjs-dev-assistant/config.json
│
└── Linux: 
    ~/.config/Code/User/globalStorage/github.copilot/agents/
    react-nextjs-dev-assistant/config.json
```

---

## Next Steps

1. **Follow the 9 steps above** exactly as written
2. **Test with examples** in Step 9
3. **Check docs/HOW_TO_USE.md** for comprehensive tool documentation
4. **Explore all 11 tools** with your actual React/Next.js projects
5. **Keep AGENT.md updated** if you modify rules

---

## Support

If issues persist:
- Review Step 5 (AGENT.md attachment) - this is the most critical
- Verify VS Code restarted after config changes
- Check all paths use absolute format and forward slashes
- Ensure `build/index.js` is executable
- Run `npm run inspector` locally to test MCP server directly

**You're now ready to use the React & Next.js Dev Assistant with your custom agent!** 🚀
