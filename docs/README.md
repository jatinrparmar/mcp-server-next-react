# MCP Server Documentation Index

Welcome to the React & Next.js Dev Assistant MCP Server documentation!

## 📚 Documentation Structure

### 🎯 For Developers (Simplified Config System)
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - One-page cheat sheet for modifying rules ⭐ **START HERE**
- **[DEVELOPER_CONFIG_GUIDE.md](DEVELOPER_CONFIG_GUIDE.md)** - Complete guide to modifying rules and configs
  
### Getting Started
- **[HOW_TO_USE.md](HOW_TO_USE.md)** - Complete guide to install, configure, and use the MCP server
- **[COPILOT_SETUP.md](COPILOT_SETUP.md)** - GitHub Copilot and AI assistant configuration
- **[LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)** - Local development and testing guide

### Understanding the System
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design overview
- **[FRAMEWORK_DETECTION.md](FRAMEWORK_DETECTION.md)** - How React vs Next.js detection works
- **[RULES_DOCUMENTATION.md](RULES_DOCUMENTATION.md)** - Complete catalog of all 107+ rules

### Reference Guides
- **[SECURITY_RULES_GUIDE.md](SECURITY_RULES_GUIDE.md)** - Security rules and OWASP mappings

### Configuration & Agents
- **[CUSTOM_AGENT_GUIDE.md](CUSTOM_AGENT_GUIDE.md)** - Configure a custom VS Code agent with MCP server
- **[../AGENT.md](../AGENT.md)** - Agent behavior instructions (attach to custom agent)

---

## Quick Links by Use Case

### 🎯 Developer: "How do I modify or add rules?"
→ **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** (One-pager)  
→ **[DEVELOPER_CONFIG_GUIDE.md](DEVELOPER_CONFIG_GUIDE.md)** (Complete guide)  
**The Flow:** Edit `src/config/` → Run `npm run generate:rules` → Done!

### "I want to use this with GitHub Copilot"
→ [HOW_TO_USE.md#using-with-github-copilot](HOW_TO_USE.md#using-with-github-copilot)

### "I want to use this with Claude Desktop"
→ [HOW_TO_USE.md#using-with-claude-desktop](HOW_TO_USE.md#using-with-claude-desktop)

### "What tools are available?"
→ [HOW_TO_USE.md#available-tools](HOW_TO_USE.md#available-tools)

### "How do I test it locally?"
→ [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md)

### "I want to understand the architecture"
→ [ARCHITECTURE.md](ARCHITECTURE.md)

### "How do I customize security rules?"
→ [SECURITY_RULES_GUIDE.md](SECURITY_RULES_GUIDE.md)

### "I want to configure a custom agent in VS Code"
→ [CUSTOM_AGENT_GUIDE.md](CUSTOM_AGENT_GUIDE.md) **← DETAILED STEP-BY-STEP GUIDE**

### "What instructions does my agent need?"
→ [../AGENT.md](../AGENT.md) (copy to agent config in Step 5 of CUSTOM_AGENT_GUIDE.md)

---

## Documentation Overview

### 🆕 Simplified Configuration System

This system makes it **dead simple** for developers to modify rules:

```
┌─────────────────────────────────────┐
│  DEVELOPER WORKFLOW                 │
├─────────────────────────────────────┤
│ 1. Edit src/config/*.json           │
│ 2. Run: npm run generate:rules      │
│ 3. Rules auto-update ✅             │
│                                     │
│ Never edit src/rules/ directly!     │
└─────────────────────────────────────┘
```

**Key Files:**
- `src/config/simplified-security-rules.json` - Edit this
- `src/config/simplified-best-practices-rules.json` - Edit this
- `src/config/simplified-accessibility-rules.json` - Edit this
- `src/rules/` - Auto-generated (don't edit)

**Available Commands:**
```bash
npm run generate:rules   # Generate rules from config
npm run lint:config      # Validate config syntax
npm run test:rules       # Test generated rules
```

📖 **Learn More:** [DEVELOPER_CONFIG_GUIDE.md](DEVELOPER_CONFIG_GUIDE.md)

---

### Core Concepts

**MCP (Model Context Protocol)**
- Standard protocol for AI assistants to access tools and resources
- This server implements 11 specialized tools for React/Next.js development
- Works with GitHub Copilot, Claude Desktop, Cline, and other MCP-compatible clients

**Config-Driven Architecture**
- All rules defined in JSON configuration files
- Automatically detects React vs Next.js projects
- Easy to customize and extend

**Available Tools**
1. `analyze-code` - Code quality analysis
2. `review-code` - Comprehensive review with metrics
3. `optimize-code` - Performance optimization suggestions
4. `generate-component` - Component scaffolding
5. `refactor-code` - Automated refactoring patterns
6. `get-best-practices` - Best practices guide
7. `check-migration-readiness` - App Router migration checker
8. `find-repeated-code` - Duplicate code detection
9. `check-accessibility` - WCAG compliance checker
10. `check-security` - Security vulnerability scanner
11. `manage-security-rules` - Security rules configuration

---

## File Organization

```
docs/
├── HOW_TO_USE.md              # 👈 Start here - Complete usage guide
├── COPILOT_SETUP.md           # AI assistant configuration
├── LOCAL_DEVELOPMENT.md       # Development and testing
├── ARCHITECTURE.md            # System design overview
├── FRAMEWORK_DETECTION.md     # React/Next.js detection
├── RULES_DOCUMENTATION.md     # All rules catalog
├── SECURITY_RULES_GUIDE.md    # Security reference
├── CUSTOM_RULES_GUIDE.md      # Rule customization
├── CUSTOM_AGENT_GUIDE.md      # VS Code extension guide
└── README.md                  # This file

../AGENT.md                    # Agent behavior instructions
```

---

## Contributing to Documentation

### Documentation Standards

- Use clear, action-oriented headings
- Provide code examples for all concepts
- Include both successful and error scenarios
- Keep examples up-to-date with current framework versions
- Cross-reference related documents

### Adding New Documentation

1. Create file in `docs/` directory
2. Add to this README.md index
3. Link from related documents
4. Update quick links if applicable

### Updating Existing Docs

- Keep version numbers current
- Update code examples for breaking changes
- Verify all links still work
- Test all commands and configurations

---

## Version Information

- **Current Version:** 1.0.0
- **Node.js Required:** 18+
- **Supported Frameworks:**
  - React 18+
  - Next.js 13+ (App Router and Pages Router)

---

## Support

### Getting Help

1. Check [HOW_TO_USE.md#troubleshooting](HOW_TO_USE.md#troubleshooting)
2. Review [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for testing
3. Check repository issues for similar problems

### Testing Issues

```bash
# Test the server
npm test

# Interactive inspector
npm run inspector

# Check build
npm run build
```

---

## License & Credits

See main repository for license information and credits.
