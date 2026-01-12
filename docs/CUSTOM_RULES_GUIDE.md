# Custom Rules Configuration Guide

This guide explains how to create and configure your own custom rule sets for the MCP Next.js Development Assistant.

## Table of Contents

1. [Overview](#overview)
2. [Rule File Structure](#rule-file-structure)
3. [Core Configuration Options](#core-configuration-options)
4. [Creating Custom Rules](#creating-custom-rules)
5. [Best Practices](#best-practices)
6. [Examples](#examples)
7. [Validation & Testing](#validation--testing)

---

## Overview

The MCP Next.js & React Development Assistant uses JSON-based rule files to configure its behavior. There are two types of rules for each framework:

### Active Configuration Files (Used by Analyzers)
- **[next-llm-rules.json](../src/config/next-llm-rules.json)**: Active configuration for Next.js projects
- **[react-llm-rules.json](../src/config/react-llm-rules.json)**: Active configuration for React projects

### Reference/Documentation Files (For LLMs & AI Tools)
- **[nextjs-llm-best-practices.json](../src/rules/nextjs-llm-best-practices.json)**: Structured Next.js best practices with detection patterns
- **[react-llm-best-practices.json](../src/rules/react-llm-best-practices.json)**: Structured React best practices with detection patterns

You can customize these files to enforce your team's specific coding standards and best practices.

---

## Rule File Structure

The main rule file consists of several sections:

### 1. **Metadata Section**

```json
{
  "version": "2025.1",
  "framework": "nextjs",
  "appRouterOnly": true,
  "noPagesRouter": true,
  "preferServerComponents": true,
  "useClientDirectiveOnlyWhenNeeded": true
}
```

| Property | Type | Description |
|----------|------|-------------|
| `version` | string | Semantic version for your rules (e.g., "2025.1") |
| `framework` | string | Target framework (e.g., "nextjs") |
| `appRouterOnly` | boolean | Enforce App Router usage only |
| `noPagesRouter` | boolean | Disallow Pages Router patterns |
| `preferServerComponents` | boolean | Default to server components |
| `useClientDirectiveOnlyWhenNeeded` | boolean | Restrict client-side directives |

### 2. **Category Sections**

Rules are organized by functional categories:

```json
{
  "routing": { /* routing rules */ },
  "dataFetching": { /* data fetching rules */ },
  "components": { /* component rules */ },
  "performance": { /* performance rules */ },
  "security": { /* security rules */ },
  "seo": { /* SEO rules */ },
  "accessibility": { /* a11y rules */ },
  "testing": { /* testing rules */ },
  "typescript": { /* TypeScript rules */ },
  "styling": { /* styling rules */ },
  "stateManagement": { /* state management rules */ },
  "errorHandling": { /* error handling rules */ },
  "deployment": { /* deployment rules */ }
}
```

### 3. **Best Practices Array**

Explicit rules with descriptions:

```json
{
  "bestPractices": [
    {
      "rule": "unique-rule-id",
      "description": "Clear description of the rule",
      "severity": "error|warning|info"
    }
  ]
}
```

### 4. **Anti-Patterns Array**

Common patterns to avoid:

```json
{
  "antiPatterns": [
    {
      "pattern": "pattern-name",
      "description": "What makes this problematic",
      "fix": "How to fix it"
    }
  ]
}
```

---

## Core Configuration Options

### Routing Configuration

```json
{
  "routing": {
    "preferAppRouter": true,
    "useFileBasedRouting": true,
    "parallelRoutes": true,
    "interceptingRoutes": true,
    "routeGroups": true
  }
}
```

### Data Fetching Configuration

```json
{
  "dataFetching": {
    "prefer": ["fetch", "serverActions", "unstable_cache"],
    "avoid": ["getServerSideProps", "getStaticProps", "getInitialProps"],
    "caching": {
      "useRequestMemoization": true,
      "revalidateStrategies": ["time-based", "on-demand", "tag-based"]
    }
  }
}
```

### Component Configuration

```json
{
  "components": {
    "defaultToServerComponents": true,
    "clientComponents": {
      "onlyWhenNeeded": ["interactivity", "browserAPIs", "stateHooks", "effectHooks"],
      "markExplicitly": true,
      "minimizeBundle": true
    },
    "composition": {
      "preferComposition": true,
      "avoidPropDrilling": true,
      "useContext": "sparingly"
    }
  }
}
```

### Performance Configuration

```json
{
  "performance": {
    "useDynamicImport": true,
    "avoidUseEffectForData": true,
    "imageOptimization": {
      "useNextImage": true,
      "lazyLoading": true,
      "responsiveImages": true,
      "formats": ["webp", "avif"]
    },
    "fontOptimization": {
      "useNextFont": true,
      "subsetFonts": true,
      "displaySwap": true
    },
    "bundleOptimization": {
      "codesplitting": true,
      "treeShaking": true,
      "minifyOutput": true
    }
  }
}
```

### Security Configuration

```json
{
  "security": {
    "noEnvLeakage": true,
    "serverActionsValidation": true,
    "csrfProtection": true,
    "sanitizeInputs": true,
    "useContentSecurityPolicy": true,
    "secrets": {
      "useEnvFiles": true,
      "neverCommit": true,
      "prefixPublicVars": "NEXT_PUBLIC_"
    }
  }
}
```

### Styling Configuration

```json
{
  "styling": {
    "prefer": ["tailwindCSS", "cssModules"],
    "avoid": ["inline-styles", "global-css"],
    "cssInJS": {
      "warning": "Can cause issues with streaming SSR",
      "alternatives": ["tailwind", "css-modules"]
    }
  }
}
```

### State Management Configuration

```json
{
  "stateManagement": {
    "localState": ["useState", "useReducer"],
    "serverState": ["server-components", "server-actions"],
    "globalState": ["context", "zustand", "jotai"],
    "avoid": ["redux-without-reason", "unnecessary-context"]
  }
}
```

---

## Creating Custom Rules

### Step 1: Identify Your Requirements

Before modifying rules, determine:
- Which aspects of Next.js development matter most to your team
- Which patterns you want to enforce vs. discourage
- Severity levels for different violations

### Step 2: Modify Active Configuration Files

Edit the active configuration file based on your project type:

#### For Next.js Projects: [next-llm-rules.json](../src/config/next-llm-rules.json)
#### For React Projects: [react-llm-rules.json](../src/config/react-llm-rules.json)

Example for Next.js:

```json
{
  "version": "2025.1",
  "framework": "nextjs",
  
  // Your custom global settings
  "appRouterOnly": true,
  "preferServerComponents": true,
  
  // Your custom category settings
  "components": {
    "defaultToServerComponents": true,
    "clientComponents": {
      "onlyWhenNeeded": ["interactivity", "browserAPIs"],
      "markExplicitly": true,
      "minimizeBundle": true
    }
  },
  
  // Add or modify best practices
  "bestPractices": [
    {
      "rule": "your-custom-rule",
      "description": "Description of your custom rule",
      "severity": "error"
    }
  ]
}
```

### Step 3: Add Custom Best Practices

Add rules specific to your team:

```json
{
  "bestPractices": [
    {
      "rule": "api-routes-typed",
      "description": "All API route handlers must have TypeScript types",
      "severity": "error"
    },
    {
      "rule": "env-validation-schema",
      "description": "Use zod or io-ts to validate environment variables",
      "severity": "error"
    },
    {
      "rule": "no-hardcoded-api-urls",
      "description": "API URLs should come from environment variables",
      "severity": "warning"
    },
    {
      "rule": "component-documentation",
      "description": "Document component props with JSDoc comments",
      "severity": "info"
    }
  ]
}
```

### Step 4: Add Custom Anti-Patterns

Define patterns your team wants to avoid:

```json
{
  "antiPatterns": [
    {
      "pattern": "dynamic-imports-without-loading",
      "description": "Using dynamic imports without providing a loading state",
      "fix": "Add loading UI and error boundary when using dynamic imports"
    },
    {
      "pattern": "context-api-overuse",
      "description": "Using Context API for frequently changing state",
      "fix": "Use zustand, jotai, or other state management library"
    },
    {
      "pattern": "missing-error-boundaries",
      "description": "Components without error boundaries in critical sections",
      "fix": "Add error.js files and ErrorBoundary components"
    }
  ]
}
```

### Step 5: Rebuild the Project

After modifying rules, rebuild to apply changes:

```bash
npm run build
```

---

## Best Practices

### 1. **Version Your Rules**

Keep semantic versioning for rule changes:
```json
{
  "version": "2025.1"  // YYYY.MAJOR format
}
```

### 2. **Document Severity Levels**

- **error**: Must be fixed; blocks deployment
- **warning**: Should be fixed; review before deployment
- **info**: Good to know; informational

### 3. **Keep Rules Measurable**

❌ Bad: "Use best practices for components"  
✅ Good: "All components must have TypeScript types for props"

### 4. **Reference External Guidelines**

In the LLM-friendly best practices files (`rules/nextjs-llm-best-practices.json` or `rules/react-llm-best-practices.json`), add references:

```json
{
  "references": [
    "https://nextjs.org/docs/app",
    "https://react.dev/learn"
  ]
}
```

### 5. **Organize by Category**

Group related rules together for easier maintenance:
- Keep routing rules in one section
- Group all security-related rules
- Organize performance checks together

### 6. **Balance Strictness**

- Too strict: Slows development
- Too lenient: Allows inconsistencies
- Find your team's sweet spot

---

## Examples

### Example 1: Lightweight Rules (Permissive)

```json
{
  "version": "2025.1",
  "framework": "nextjs",
  "appRouterOnly": true,
  "preferServerComponents": false,
  "useClientDirectiveOnlyWhenNeeded": false,
  
  "components": {
    "defaultToServerComponents": false,
    "clientComponents": {
      "markExplicitly": false
    }
  },
  
  "bestPractices": [
    {
      "rule": "use-app-router",
      "description": "Use App Router for new routes",
      "severity": "warning"
    }
  ]
}
```

### Example 2: Strict Security-Focused Rules

```json
{
  "version": "2025.1",
  "framework": "nextjs",
  
  "security": {
    "noEnvLeakage": true,
    "serverActionsValidation": true,
    "csrfProtection": true,
    "sanitizeInputs": true,
    "useContentSecurityPolicy": true,
    "secrets": {
      "useEnvFiles": true,
      "neverCommit": true,
      "prefixPublicVars": "NEXT_PUBLIC_"
    }
  },
  
  "bestPractices": [
    {
      "rule": "zod-server-action-validation",
      "description": "All server actions must validate inputs with zod",
      "severity": "error"
    },
    {
      "rule": "no-console-logs-in-production",
      "description": "Remove console.log statements before deployment",
      "severity": "warning"
    },
    {
      "rule": "sql-injection-prevention",
      "description": "Use parameterized queries; never concatenate SQL",
      "severity": "error"
    }
  ]
}
```

### Example 3: Performance-Optimized Rules

```json
{
  "version": "2025.1",
  "framework": "nextjs",
  
  "performance": {
    "useDynamicImport": true,
    "avoidUseEffectForData": true,
    "imageOptimization": {
      "useNextImage": true,
      "lazyLoading": true,
      "responsiveImages": true,
      "formats": ["webp", "avif"]
    },
    "fontOptimization": {
      "useNextFont": true,
      "subsetFonts": true,
      "displaySwap": true
    }
  },
  
  "bestPractices": [
    {
      "rule": "next-image-required",
      "description": "All images must use next/image",
      "severity": "error"
    },
    {
      "rule": "dynamic-import-heavy-libs",
      "description": "Import heavy libraries dynamically",
      "severity": "warning"
    },
    {
      "rule": "avoid-blocking-requests",
      "description": "Use parallel data fetching, not sequential",
      "severity": "error"
    }
  ]
}
```

---

## Validation & Testing

### Check JSON Syntax

Ensure your rules file is valid JSON:

```bash
npm run build
```

### Test with Examples

Use the provided test files to validate rules:

```bash
cat examples/test-analyze.json
```

### Create Custom Test Cases

Create test files for your custom rules:

```json
// examples/test-custom.json
{
  "code": "your test code here",
  "filePath": "app/api/route.ts",
  "expectedIssues": ["custom-rule-id"]
}
```

### Monitor Rule Effectiveness

After deployment:
1. Track which rules catch the most issues
2. Monitor false positives
3. Adjust severity levels based on team feedback
4. Update rules quarterly

---

## Common Customizations

### For Startup Teams
- Lenient performance rules
- Focus on security
- Less strict TypeScript requirements

### For Large Organizations
- Strict type checking
- Comprehensive testing rules
- Multiple rule sets by project type

### For Legacy Projects
- Gradual migration rules
- Pages Router support
- Backwards compatibility patterns

### For Performance-Critical Apps
- Strict bundle size limits
- Dynamic import requirements
- Image optimization mandates

---

## Troubleshooting

### Rules Not Applied

1. Check file syntax is valid JSON
2. Verify the active configuration file path is correct:
   - For Next.js: `src/config/next-llm-rules.json`
   - For React: `src/config/react-llm-rules.json`
3. Run `npm run build` after changes
4. Check server logs for errors

### Too Many False Positives

1. Lower severity levels for less critical rules
2. Add `onlyWhenNeeded` exceptions
3. Split rules into multiple categories
4. Review and adjust thresholds

### Rules Conflict

If rules seem contradictory:
1. Review the rule intent
2. Check rule order and precedence
3. Adjust boolean flags to avoid conflicts
4. Document exceptions in comments

---

## Further Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/)

---

**Last Updated:** January 2026  
**Version:** 1.0
