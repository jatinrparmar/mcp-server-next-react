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

**For Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "nextjs-dev-assistant": {
      "command": "node",
      "args": ["/path/to/mcp-server-next-react/build/index.js"]
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
      "args": ["/path/to/mcp-server-next-react/build/index.js"]
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
│   ├── next-llm-rules.json      # Next.js configuration and rules
│   └── react-llm-rules.json     # React configuration and rules
├── core/
│   ├── analyzer.ts       # Code analysis engine
│   ├── optimizer.ts      # Optimization suggestions engine
│   └── reviewer.ts       # Code review engine
├── rules/
│   ├── loadRules.ts      # Rule loader utility
│   ├── nextjs-llm-best-practices.json  # Next.js structured best practices
│   └── react-llm-best-practices.json   # React structured best practices
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

## 📝 Rules Configuration

The server uses rule files for both React and Next.js projects:

### Active Configuration Files (Used by Code Analyzers)
1. **`config/next-llm-rules.json`**: Next.js configuration including routing, data fetching, Server Components, performance, security, SEO, accessibility, and more.
2. **`config/react-llm-rules.json`**: React configuration including components, hooks, state management, performance, security, and best practices.

### Reference Files (For LLMs & AI Tools)
3. **`rules/nextjs-llm-best-practices.json`**: Structured Next.js rules with detection patterns, severity levels, and recommendations.
4. **`rules/react-llm-best-practices.json`**: Structured React rules with detection patterns, severity levels, and recommendations.

You can customize these files to add your own organization's specific rules and patterns.

### Custom Rules Configuration (Overview)

For a comprehensive guide, see **[docs/CUSTOM_RULES_GUIDE.md](docs/CUSTOM_RULES_GUIDE.md)**. Below is a concise overview to get started.

#### File Structure
- `config/*-llm-rules.json`: Active rules consumed by the analyzer/optimizer/reviewer
- `rules/*-llm-best-practices.json`: Reference rules in LLM-friendly format (intents, scopes, detection patterns, recommendations)

#### Core Categories
- **Routing**: App Router, file-based routing, parallel/intercepting routes, route groups
- **Data Fetching**: Prefer `fetch`, Server Actions; avoid legacy `getServerSideProps`/`getStaticProps`
- **Components**: Default to Server Components; client components only when needed
- **Performance**: Dynamic imports, next/image, next/font, bundle optimization
- **Security**: No env leakage, input validation, CSP, secret management
- **SEO & Accessibility**: Metadata API, JSON-LD, Open Graph; semantic HTML, ARIA, alt text
- **Testing & Types**: Unit/integration/e2e; strict TypeScript settings

#### Best Practices & Anti-Patterns
- `bestPractices`: Rules with `rule`, `description`, `severity` (error/warning/info)
- `antiPatterns`: Items with `pattern`, `description`, `fix` to guide remediation

#### Create Your Own Rules (Quick Steps)
1. Identify requirements (what to enforce vs discourage; severity levels)
2. Edit `config/next-llm-rules.json` to add/adjust categories and `bestPractices`
3. Add `antiPatterns` to flag common issues and suggested fixes
4. Rebuild to apply: 
  ```bash
  npm run build
  ```

#### Examples
- **Lightweight**: Permissive rules focusing on App Router only
- **Security-Focused**: Strict validation, secret handling, CSP
- **Performance-Optimized**: Enforce next/image, dynamic imports, parallel fetching

#### Troubleshooting
- Rules not applied: check JSON syntax, correct path, rebuild
- False positives: tune severity, add exceptions, refine categories
- Conflicts: review intent, precedence, adjust flags, document exceptions

For full examples and detailed JSON snippets, see **[docs/CUSTOM_RULES_GUIDE.md](docs/CUSTOM_RULES_GUIDE.md)**.

## 🤝 Contributing

Contributions are welcome! The rule system is designed to be extensible:

1. Add new rules to `config/next-llm-rules.json`
2. Implement detection logic in the appropriate core module
3. Add tool handlers in `tools/index.ts` if needed

## 📄 License

MIT

## 🙏 Acknowledgments

Built on the [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic, enabling AI assistants to access external tools and context.

---

**Note:** This tool is designed to work with Next.js 15+ and the App Router. For Pages Router projects, use the migration tools to convert to App Router first.
