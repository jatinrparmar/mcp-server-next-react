# MCP Server for Next.js & React Development

A powerful Model Context Protocol (MCP) server that helps developers build better Next.js and React applications by providing intelligent code analysis, optimization suggestions, code review, and best practices guidance. **Automatically detects your project type** (React or Next.js) and applies appropriate rules and recommendations.

## 🚀 Quick Start

```bash
# Clone or navigate to the project
cd mcp-server-next-react

# Run the quick start script
./scripts/quick-start.sh

# Or manually:
npm install
npm run build
npm run inspector  # Interactive testing
```

## ✨ Key Features

- **🔍 Automatic Framework Detection**: Intelligently detects whether you're working on a React or Next.js project
- **📊 Code Analysis**: Analyzes code against React or Next.js best practices, patterns, and potential issues
- **🔎 Code Review**: Comprehensive code review with quality metrics (maintainability, complexity, testability, readability)
- **⚡ Code Optimization**: Actionable optimization suggestions for performance, bundle size, SEO, and accessibility
- **🎨 Component Generation**: Generate framework-appropriate components following latest best practices
- **♻️ Code Refactoring**: Automated refactoring patterns (Pages Router → App Router, Class → Functional, etc.)
- **🔄 Migration Assistance**: Check readiness to migrate from Pages Router to App Router (Next.js)
- **📚 Best Practices Guide**: Access comprehensive React and Next.js best practices

## 🎯 Supported Frameworks

### React
- Create React App (CRA)
- Vite
- Custom Webpack setups
- Best practices for hooks, state management, routing, and performance

### Next.js
- Next.js 13+ with App Router
- Pages Router (with migration assistance)
- Server Components, Client Components, Server Actions
- Built-in optimizations and SEO features

## 🚀 Tools Available

### 1. `analyze-code`
Analyzes code against framework-specific best practices (automatically detects React or Next.js):

**For Next.js:**
- App Router patterns
- Server/Client Component usage
- Data fetching methods
- Image and font optimization
- Security issues (env variable exposure)

**For React:**
- Hooks rules and patterns
- State management best practices
- Component patterns
- Data fetching with proper error handling
- Performance optimizations

**Parameters:**
- `filePath` (string, optional): File path to analyze (e.g., src/components/page.tsx). If not provided, scans entire project
- `includeTests` (boolean, optional): Include test files in analysis (default: false)

**Returns:** Analysis with issues, suggestions, score, and summary

### 2. `review-code`
Performs comprehensive code review including:
- Quality metrics (maintainability, complexity, testability, readability)
- Architecture analysis
- Best practice checks

**Parameters:**
- `code` (string): The code to review
- `filePath` (string, optional): File path for context

**Returns:** Detailed review with metrics and recommendations

### 3. `optimize-code`
Provides optimization suggestions for:
- Performance improvements
- Bundle size reduction
- SEO enhancements
- Accessibility improvements

**Parameters:**
- `code` (string): The code to optimize
- `filePath` (string, optional): File path for context

**Returns:** Prioritized optimizations with code examples and estimated impact

### 4. `generate-component`
Generates React or Next.js components following best practices. **Automatically adapts to your project type.**

**For Next.js:**
- Server Components (default)
- Client Components with interactivity
- Pages with metadata
- Layouts
- API routes
- Server Actions

**For React:**
- Functional components
- Components with state and hooks
- Page components (for React Router)
- Layout components

**Parameters:**
- `name` (string): Component name (e.g., UserProfile)
- `type` (enum): Type of component
  - `server-component`: Next.js Server Component or React functional component
  - `client-component`: Client Component with interactivity
  - `page`: Page component
  - `layout`: Layout component
  - `api-route`: Next.js API route (Next.js only)
  - `server-action`: Server Action (Next.js only)
- `features` (string[], optional): Features to include
  - `data-fetching`: Add data fetching logic
  - `form`: Add form handling
  - `loading`: Add loading states
- `styling` (enum, optional): Styling approach
  - `tailwind`: Tailwind CSS (default)
  - `css-modules`: CSS Modules
  - `none`: No styling

**Returns:** Generated component code

### 5. `refactor-code`
Refactors framework-specific best practices guide. **Automatically returns React or Next.js guidelines based on your project.**

**Parameters:**
- `topic` (enum, optional): Specific topic
  - `routing`, `data-fetching`, `server-components`, `client-components`
  - `performance`, `security`, `seo`, `accessibility`, `testing`, `deployment`
  - If not provided, returns all practices

**Returns:** Best practices documentation for your frameworkmponent to Server Component
- `filePath` (string, optional): Original file path

**Returns:** Refactored code with explanations

### 6. `get-best-practices`
Retrieves Next.js 15+ best practices guide.

**Parameters:**
- `topic` (enum, optional): Specific topic
  - `routing`, `data-fetching`, `server-components`, `client-components`
  - `performance`, `security`, `seo`, `accessibility`, `testing`, `deployment`
  - If not provided, returns all practices

**Returns:** Best practices documentation

### 7. `check-migration-readiness`
Checks if Pages Router code is ready to migrate to App Router.

**Parameters:**
- `code` (string): The Pages Router code to check
- `filePath` (string, optional): File path for context

**Returns:** Migration readiness analysis with blockers, warnings, and steps

### 8. `find-repeated-code`
Identifies repeated code patterns that can be extracted into reusable components or utility functions.

**Parameters:**
- `filePath` (string, optional): File path to analyze (e.g., src/components/Dashboard.tsx). If not provided, analyzes entire project
- `minOccurrences` (number, optional): Minimum number of repetitions to report (default: 2)
- `includeSmallPatterns` (boolean, optional): Include small patterns (less than 3 lines) (default: false)

**Returns:** Found patterns with occurrences, line hints, and refactoring suggestions

### 9. `check-accessibility`
Analyzes React/Next.js code for accessibility compliance (WCAG heuristics). Detects missing alt text, improper ARIA usage, clickable non-interactive elements, inputs without labels, and more. Works on a single file or the entire project.

**Parameters:**
- `filePath` (string, optional): File path to check (e.g., src/app/page.tsx). If not provided, checks the entire project

**Returns:** Accessibility findings with type (error/warning/info), message, and suggested fixes

### 10. `check-security`
Analyzes React/Next.js code for common security vulnerabilities (XSS, CSRF, injection, secret exposure) using config-driven rules. Works on a single file or the entire project.

**Parameters:**
- `filePath` (string, optional): File path to check (e.g., src/app/page.tsx). If not provided, checks the entire project

**Returns:** Security findings with severity, message, rule id, and suggested remediation

### 11. `manage-security-rules`
View, enable, or disable security rules used by the analyzer.

**Parameters:**
- `action` (enum): `list`, `get-config`, `enable`, `disable`
- `ruleId` (string, optional): Required when action is `enable` or `disable` (e.g., "no-env-variable-exposure")

**Returns:** Current rule set or confirmation of the enable/disable action

## 📦 Installation

### For MCP Clients (e.g., Claude Desktop, Cline)

1. Clone or install the package:
```bash
npm install mcp-server-next-react
# or
git clone <repository-url>
cd mcp-server-next-react
npm install
npm run build
```

2. Add to your MCP client configuration:

**⚠️ IMPORTANT:** Always include the `WORKSPACE_ROOT` environment variable to prevent EISDIR errors. See [Workspace Configuration Guide](docs/WORKSPACE_CONFIGURATION.md) for details.

**For Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/path/to/mcp-server-next-react/build/index.js"],
      "env": {
        "WORKSPACE_ROOT": "/path/to/your/project"
      }
    }
  }
}
```

**For VS Code with GitHub Copilot** (Settings JSON):
```json
{
  "github.copilot.advanced": {
    "mcp": {
      "servers": {
        "nextjs-dev-assistant": {
          "command": "node",
          "args": ["/path/to/mcp-server-next-react/build/index.js"],
          "env": {
            "WORKSPACE_ROOT": "${workspaceFolder}"
          }
        }
      }
    }
  }
}
```

**For Cline** (VS Code settings):
```json
{
  "mcp.servers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/path/to/mcp-server-next-react/build/index.js"],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

3. Restart your MCP client

## 🎯 Usage Examples

### Example 1: Analyze a Component
```typescript
// Ask your AI assistant (like Claude):
"Use analyze-code tool to check this component:

export default function UserProfile() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(setData);
  }, []);
  
  return <div>{data?.name}</div>;
}
"
```

**Result:** Will identify issues like:
- Missing 'use client' directive (uses useState/useEffect)
- Data fetching in useEffect (anti-pattern)
- Suggests using Server Component instead

### Example 2: Generate a Server Component
```typescript
// Ask your AI assistant:
"Use generate-component tool to create a server component named ProductList 
with data-fetching feature and tailwind styling"
```

**Result:** Generates a complete Server Component with async data fetching

### Example 3: Optimize for Performance
```typescript
// Ask your AI assistant:
"Use optimize-code tool to optimize this code:

export default function Page() {
  return (
    <div>
      <img src='/hero.jpg' alt='Hero' />
      <Chart data={data} />
    </div>
  );
}
"
```

**Result:** Suggests:
- Replace `<img>` with Next.js `<Image>` component
- Add dynamic import for heavy `<Chart>` component
- Add metadata for SEO

### Example 4: Check Migration Readiness
```typescript
// Ask your AI assistant:
"Use check-migration-readiness to check if this page is ready to migrate:

export async function getServerSideProps() {
  const data = await fetch('...');
  return { props: { data } };
}

export default function Page({ data }) {
  return <div>{data}</div>;
}
"
```

**Result:** Provides migration steps and identifies any blockers

## 🏗️ Architecture

```
src/
├── index.ts              # Main MCP server entry point
├── server.ts             # Server initialization (legacy)
├── config/
│   ├── nextjs-llm-best-practices.json   # Next.js MCP configuration (active rules)
│   ├── nextjs-llm-security-rules.json   # Next.js security configuration
│   ├── react-llm-best-practices.json    # React MCP configuration (active rules)
│   ├── react-llm-security-rules.json    # React security configuration
│   └── react-next-llm-accessibility-rules.json # Shared accessibility configuration
├── core/
│   ├── analyzer.ts       # Code analysis engine
│   ├── optimizer.ts      # Optimization suggestions engine
│   └── reviewer.ts       # Code review engine
├── rules/
│   ├── loadRules.ts      # Rule loader utility
│   ├── nextjs-llm-best-practices.json  # Next.js best practices (LLM reference)
│   ├── nextjs-llm-security-rules.json  # Next.js security rules (LLM reference)
│   ├── react-llm-best-practices.json   # React best practices (LLM reference)
│   ├── react-llm-security-rules.json   # React security rules (LLM reference)
│   └── react-next-llm-accessibility-rules.json # Shared accessibility rules (LLM reference)
├── tools/
│   └── index.ts          # MCP tool definitions and handlers
└── types/
    └── schema.ts         # TypeScript interfaces and types
```

## 🎓 Best Practices Covered

### Next.js 15+ Specific
- ✅ App Router (no Pages Router)
- ✅ Server Components by default
- ✅ Client Components only when needed
- ✅ Server Actions for mutations
- ✅ Metadata API (not Head component)
- ✅ next/image and next/font
- ✅ Proper data fetching strategies

### Security
- ✅ No secret exposure to client
- ✅ Server Action input validation
- ✅ Proper environment variable usage

### Performance
- ✅ Dynamic imports for heavy components
- ✅ Image and font optimization
- ✅ Bundle size optimization
- ✅ Streaming SSR with Suspense

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Alt text for images
- ✅ Keyboard navigation

### SEO
- ✅ Metadata API usage
- ✅ Structured data (JSON-LD)
- ✅ Open Graph tags

## � Documentation

Comprehensive guides for using and customizing the MCP server:
- **[HOW_TO_USE.md](docs/HOW_TO_USE.md)** - Complete guide to install, configure, and use the MCP server ⭐ **START HERE**
- **[Workspace Configuration](docs/WORKSPACE_CONFIGURATION.md)** - **IMPORTANT:** Configure workspace directory to prevent EISDIR errors ⚠️
- **[Config-Driven Architecture](docs/CONFIG_DRIVEN_ARCHITECTURE.md)** - How all analyzers (Code, Security, Accessibility) are config-driven with 107+ rules
- **[Rules & Configuration Documentation](docs/RULES_DOCUMENTATION.md)** - Complete reference of all 107+ rules organized by category
- **[Custom Rules Guide](docs/CUSTOM_RULES_GUIDE.md)** - How to create and customize your own rule sets
- **[Security Rules Guide](docs/SECURITY_RULES_GUIDE.md)** - Detailed security rule configurations and best practices
- **[Configuration Examples](docs/CONFIGURATION_EXAMPLES.md)** - Real-world configuration examples
- **[Framework Detection](docs/FRAMEWORK_DETECTION.md)** - How the server detects React vs Next.js
- **[Local Development](docs/LOCAL_DEVELOPMENT.md)** - Development and testing guide
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture overview
- **[Copilot Setup](docs/COPILOT_SETUP.md)** - Setup instructions for GitHub Copilot
- **[Custom Agent Guide](docs/CUSTOM_AGENT_GUIDE.md)** - Create custom agents in VS Code
- **[Custom Rules Guide](docs/CUSTOM_RULES_GUIDE.md)** - How to create and customize your own rule sets
- **[Security Rules Guide](docs/SECURITY_RULES_GUIDE.md)** - Detailed security rule configurations and best practices
- **[Configuration Examples](docs/CONFIGURATION_EXAMPLES.md)** - Real-world configuration examples
- **[Framework Detection](docs/FRAMEWORK_DETECTION.md)** - How the server detects React vs Next.js
- **[Local Development](docs/LOCAL_DEVELOPMENT.md)** - Development and testing guide
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture overview
- **[Copilot Setup](docs/COPILOT_SETUP.md)** - Setup instructions for GitHub Copilot

---

## 🔧 Development


### Build
```bash
npm run build
```

### Local Testing
```bash
# Build the project
npm run build

# Test with stdio
node build/index.js
```

## � Rules & Configuration

The server uses comprehensive rule files to analyze and guide development for both React and Next.js projects. Rules are organized into multiple types:

### 1. **Configuration Files** (Active Rules - Used by Analyzers)
Located in `src/config/`:
- **`nextjs-llm-best-practices.json`**: Core Next.js configuration with settings for routing, data fetching, components, performance, security, SEO, accessibility, testing, TypeScript, styling, state management, error handling, and deployment
- **`nextjs-llm-security-rules.json`**: Next.js security configuration (XSS, CSRF, env exposure, server action validation, SQL injection, CSP)
- **`react-llm-best-practices.json`**: Core React configuration with settings for routing, data fetching, state management, components, performance, hooks, security, accessibility, testing, styling, and bundling
- **`react-llm-security-rules.json`**: React security configuration (XSS, secrets, dependency audit, API security, eval/Function prevention)
- **`react-next-llm-accessibility-rules.json`**: Shared React/Next.js accessibility configuration (WCAG 2.2)

### 2. **Best Practices Rules** (Reference Rules - For LLMs & AI Tools)
Located in `src/rules/`:
- **`nextjs-llm-best-practices.json`**: Structured Next.js best practices (App Router, Server Components, data fetching, SEO, TS, error handling, deployment)
- **`react-llm-best-practices.json`**: Structured React best practices (hooks, components, routing, data fetching, state management, styling, accessibility, testing, performance)

### 3. **Security Rules** (Specialized Security Checks)
Located in `src/config/` and `src/rules/`:
- **`nextjs-llm-security-rules.json`**: 12 critical/high-severity security rules including environment variable exposure, server action validation, hardcoded secrets, XSS prevention, SQL injection, CSRF protection, and more
- **`react-llm-security-rules.json`**: 15 security rules covering XSS prevention, secrets management, dependency vulnerabilities, API security, and injection prevention

### 4. **Accessibility Rules** (WCAG 2.2 Compliance)
Located in `src/config/` and `src/rules/`:
- **`react-next-llm-accessibility-rules.json`**: 16 accessibility rules covering images, keyboard navigation, ARIA, forms, headings, focus management, video/audio captions, and motion preferences

---

## 📚 Rule Categories & Examples

### Next.js Best Practices (Key Rules)
1. **`next-app-router-only`** - Use App Router exclusively
2. **`prefer-server-components`** - Default to Server Components
3. **`no-data-fetching-in-useeffect`** - Move data fetching to Server Components
4. **`use-server-actions-for-mutations`** - Use Server Actions for form submissions
5. **`validate-server-action-inputs`** - Validate all server action inputs with Zod/Yup
6. **`no-env-access-in-client`** - Never access non-NEXT_PUBLIC_ env vars in client
7. **`use-suspense-boundaries`** - Wrap async components with Suspense
8. **`use-next-image`** - Use Next.js Image component for optimization
9. **`use-next-font`** - Use next/font for font loading
10. **`next-seo-metadata`** - Use Metadata API for SEO
11. **`next-error-handling`** - Implement error.tsx for error boundaries
12. **`next-revalidation-strategy`** - Choose appropriate revalidation strategy

### React Best Practices (Key Rules)
1. **`react-functional-components-only`** - Use functional components with hooks
2. **`react-hooks-at-top-level`** - Call hooks at top level only
3. **`react-useeffect-cleanup`** - Return cleanup function from useEffect
4. **`react-useeffect-dependencies`** - Specify dependency array for useEffect
5. **`react-avoid-prop-drilling`** - Use Context/state management to avoid prop drilling
6. **`react-use-query-for-server-state`** - Use TanStack Query/SWR for server state
7. **`react-routing-libraries`** - Use React Router v6+ or similar
8. **`react-data-fetching-best-practices`** - Avoid fetching in useEffect
9. **`react-state-management`** - Choose appropriate state management approach
10. **`react-styling-approach`** - Use consistent styling (Tailwind/CSS Modules/etc)
11. **`react-testing-strategy`** - Implement comprehensive testing with RTL

### Security Rules (Critical Severity)
1. **`no-hardcoded-secrets`** - No API keys, tokens, or passwords in code
2. **`server-action-validation`** (Next.js) - Validate all server action inputs
3. **`no-env-variable-exposure`** (Next.js) - Don't expose secrets to client
4. **`xss-prevention`** - Avoid dangerouslySetInnerHTML and unsafe HTML
5. **`sql-injection-prevention`** (Next.js) - Use parameterized queries/ORM
6. **`react2shell`** - Never pass user input to shell execution APIs
7. **`ssrf-prevention`** - Validate URLs in server-side requests
8. **`auth-validation`** (Next.js) - Validate authentication on protected resources

### Accessibility Rules (WCAG 2.2)
1. **`img-alt-text`** - All images must have meaningful alt text
2. **`button-accessibility`** - Interactive elements must be keyboard accessible
3. **`label-input-association`** - Form inputs must have associated labels
4. **`heading-order`** - Use proper heading hierarchy
5. **`focus-visible`** - Maintain visible focus indicators
6. **`color-contrast`** - Maintain sufficient color contrast ratios
7. **`page-title`** - Every page must have a descriptive title

---

## 🔧 Customizing Rules

For detailed instructions on customizing rules, see **[docs/CUSTOM_RULES_GUIDE.md](docs/CUSTOM_RULES_GUIDE.md)**.

### Quick Customization Steps
1. Edit the config files in `src/config/` (e.g., `nextjs-llm-best-practices.json`, `nextjs-llm-security-rules.json`, `react-llm-best-practices.json`, `react-llm-security-rules.json`, `react-next-llm-accessibility-rules.json`)
2. Update corresponding `src/rules/*.json` files for LLM-facing documentation
3. Rebuild the project:
```bash
npm run build
```
4. Changes take effect immediately on next analysis

### Common Customizations
- **Enforce stricter security**: Enable all security rules, increase severity levels
- **Performance-focused**: Add bundling optimization rules, enable dynamic import checks
- **Accessibility-first**: Enable all accessibility rules, increase severity to "error"
- **Lightweight setup**: Disable non-critical rules, focus on best practices only

---

## 📊 Available Rules Summary

| Type | React | Next.js | Total |
|------|-------|---------|-------|
| Best Practices | 36+ rules | 28+ rules | 64+ |
| Security | 15 rules | 12 rules | 27 |
| Accessibility | 16 rules | 16 rules | 16 |
| **Total** | **67+ rules** | **56+ rules** | **107+ rules** |



## 🤝 Contributing

Contributions are welcome! The rule system is designed to be extensible:

1. Add new rules to `config/*.json` (e.g., `nextjs-llm-best-practices.json`, `nextjs-llm-security-rules.json`, `react-llm-best-practices.json`, `react-llm-security-rules.json`, `react-next-llm-accessibility-rules.json`)
2. Implement detection logic in the appropriate core module
3. Add tool handlers in `tools/index.ts` if needed

## 📄 License

MIT

## 🙏 Acknowledgments

Built on the [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic, enabling AI assistants to access external tools and context.

---

**Note:** This tool is designed to work with Next.js 15+ and the App Router. For Pages Router projects, use the migration tools to convert to App Router first.
