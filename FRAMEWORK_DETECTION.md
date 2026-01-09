# Framework Detection and React Support

## Overview

Your MCP server has been successfully upgraded to support **both React and Next.js** applications with automatic framework detection. The server now intelligently analyzes your project structure and applies appropriate rules and recommendations based on the detected framework.

## What Changed

### 1. **Automatic Framework Detection** (New!)

Added `project-detector.ts` that automatically detects:
- **Framework type**: React vs Next.js by analyzing `package.json`
- **Next.js routing**: App Router vs Pages Router
- **Bundler**: Vite, Webpack, CRA, or other
- **TypeScript usage**
- **Framework versions**

The detection runs automatically when tools are invoked and caches results for performance.

### 2. **React-Specific Rules Configuration**

Created `react-llm-rules.json` with comprehensive React best practices:
- **Hooks**: Rules of hooks, custom hooks, useEffect patterns
- **State Management**: Local state, global state (Context, Zustand, Redux), server state
- **Routing**: React Router patterns, lazy loading
- **Data Fetching**: React Query, SWR, proper useEffect patterns
- **Performance**: useMemo, useCallback, React.memo, code splitting
- **Security**: XSS prevention, environment variables, dependency management
- **Accessibility**: WCAG compliance, keyboard navigation, ARIA
- **Testing**: React Testing Library, Vitest/Jest

### 3. **Updated Core Modules**

#### `analyzer.ts`
- Loads appropriate rules based on detected framework
- Added React-specific checks:
  - Hook rules validation (no conditional hooks, cleanup in useEffect)
  - React data fetching patterns
  - State management patterns (detecting prop drilling, direct mutation)
  - Key usage in lists
  - React environment variables (REACT_APP_, VITE_)
- Maintains all Next.js checks for Next.js projects

#### `reviewer.ts`
- Framework-aware code review
- Applies appropriate quality metrics for each framework

#### `optimizer.ts`
- Framework-specific optimizations:
  - **React**: Image lazy loading, responsive images with srcset, route-based code splitting
  - **Next.js**: Next/Image, next/font, dynamic imports, Server Components
- Common optimizations for both frameworks

### 4. **Enhanced Component Generation**

Added `generateReactComponent()` function that generates:
- Functional components with or without state
- Components with data fetching using useEffect (with proper error handling)
- Form components with validation
- Page components (for React Router)
- Layout components
- Proper guidance for API routes (backend-focused for React)

The `generateComponent()` function now:
- Detects project framework automatically
- Routes to appropriate generator
- Generates framework-appropriate code

### 5. **Updated Tool Descriptions**

All MCP tools now clearly indicate they support both frameworks:
- `analyze-code`: "Automatically detects project type (React or Next.js)"
- `generate-component`: "Automatically adapts to your project type"
- `get-best-practices`: "Automatically returns React or Next.js guidelines"

### 6. **Server Branding**

- Server name: `react-nextjs-dev-assistant`
- Startup message: "React & Next.js Dev Assistant MCP Server"

## How It Works

### Detection Process

1. **Project Scan**: Checks `package.json` for dependencies
   ```typescript
   if (dependencies['next']) → Next.js
   else if (dependencies['react']) → React
   ```

2. **Structure Analysis**: For Next.js projects, checks for:
   - `app/` or `src/app/` → App Router
   - `pages/` or `src/pages/` → Pages Router

3. **File-Level Detection**: Can detect framework for specific files based on path
   - Files in `app/` or `pages/` → Next.js
   - Other React files → treated based on project type

4. **Caching**: Results are cached for performance

### Rule Application

```
User invokes tool → Detect framework → Load appropriate rules → Apply checks
                                    ↓
                          react-llm-rules.json or next-llm-rules.json
```

### Example Differences

#### React Analysis
```typescript
- Check for proper hook usage
- Validate useState/useEffect patterns
- Check for React Query/SWR
- Validate REACT_APP_ or VITE_ env vars
- Check for class components (suggest conversion)
```

#### Next.js Analysis
```typescript
- Check for 'use client' directive
- Validate Server/Client Component usage
- Check for next/image and next/font
- Validate NEXT_PUBLIC_ env vars
- Check metadata API usage
```

## Framework-Specific Features

### React Projects

**Supported:**
- ✅ Code analysis with React best practices
- ✅ Component generation (functional, with hooks)
- ✅ Performance optimization suggestions
- ✅ Accessibility checks
- ✅ Code review with quality metrics
- ✅ Best practices for hooks, routing, state management

**Not Applicable:**
- ❌ Server Components / Client Components (React concept)
- ❌ App Router / Pages Router migration
- ❌ Server Actions (suggest backend alternatives)
- ❌ next/image, next/font (suggest alternatives)

### Next.js Projects

**Supported:**
- ✅ All React features +
- ✅ Server/Client Component analysis
- ✅ App Router vs Pages Router detection
- ✅ Migration readiness checks
- ✅ Next.js-specific optimizations
- ✅ Server Actions validation
- ✅ Metadata API checks

## Usage Examples

### Analyzing a React Project

```bash
# The tool automatically detects it's a React project
# and applies React-specific rules
analyze-code --filePath src/components/UserList.tsx
```

**Output includes:**
- Hook usage validation
- State management patterns
- Data fetching best practices
- Performance suggestions (React.memo, useMemo)

### Analyzing a Next.js Project

```bash
# Automatically detects Next.js and App Router
analyze-code --filePath app/dashboard/page.tsx
```

**Output includes:**
- Server vs Client Component recommendations
- Next.js optimization suggestions
- Metadata API usage
- Image/font optimization

### Generating Components

```bash
# For React project → generates functional component
generate-component --name UserCard --type client-component --features form,data-fetching

# For Next.js project → generates Client Component with 'use client'
generate-component --name UserCard --type client-component --features form
```

## Testing the Changes

1. **Test with React project:**
   ```bash
   cd /path/to/react-project
   # Run MCP inspector or use in your IDE
   ```

2. **Test with Next.js project:**
   ```bash
   cd /path/to/nextjs-project
   # Run MCP inspector or use in your IDE
   ```

3. **Verify detection:**
   - Check logs for framework detection
   - Verify appropriate rules are loaded
   - Ensure generated code matches framework

## Configuration

The framework detection is automatic, but you can:

1. **Add custom rules** to `react-llm-rules.json` or `next-llm-rules.json`
2. **Modify detection logic** in `project-detector.ts`
3. **Clear cache** if needed: `projectDetector.clearCache()`

## Benefits

✅ **Single Tool**: One MCP server for both React and Next.js
✅ **Automatic**: No configuration needed
✅ **Smart**: Context-aware suggestions
✅ **Comprehensive**: Covers both frameworks deeply
✅ **Extensible**: Easy to add more frameworks or rules

## Backward Compatibility

All existing Next.js functionality is preserved:
- Existing configurations work
- All Next.js checks remain active
- No breaking changes to APIs

## Future Enhancements

Potential additions:
- Remix framework support
- Astro framework detection
- Vue.js support
- Svelte support
- Framework migration tools (React → Next.js)

---

**Your MCP server is now a comprehensive React & Next.js development assistant!** 🎉
