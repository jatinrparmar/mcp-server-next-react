# Rules & Configuration Documentation

This document provides a comprehensive overview of all available rules across React, Next.js, security, and accessibility guidelines.

## Table of Contents

1. [Overview](#overview)
2. [React Best Practices](#react-best-practices)
3. [Next.js Best Practices](#nextjs-best-practices)
4. [Security Rules](#security-rules)
5. [Accessibility Rules](#accessibility-rules)
6. [Rule Files Location](#rule-files-location)

---

## Overview

The MCP Server includes **107+ rules** organized into four categories:

- **React Best Practices**: 36+ rules for React applications
- **Next.js Best Practices**: 28+ rules for Next.js applications
- **Security Rules**: 27 rules covering security best practices
- **Accessibility Rules**: 16 WCAG 2.2 compliance rules

All rules are defined in JSON configuration files for easy customization and extension.

---

## React Best Practices

**File:** `src/rules/react-llm-best-practices.json`
**Count:** 36+ rules

### Core Hooks Rules
1. **react-functional-components-only** - Use functional components instead of class components
2. **react-hooks-at-top-level** - Call hooks at top level, not in conditionals or loops
3. **react-useeffect-cleanup** - Always return cleanup function from useEffect
4. **react-useeffect-dependencies** - Specify dependency array for useEffect
5. **react-custom-hook-naming** - Name custom hooks with 'use' prefix

### Performance Rules
6. **react-use-memo-for-expensive-calculations** - Use useMemo for expensive computations
7. **react-use-callback-for-optimized-children** - Use useCallback with memoized children
8. **react-use-react-memo** - Memoize expensive components with React.memo
9. **react-no-inline-objects-in-props** - Avoid inline objects in props (causes re-renders)
10. **react-no-inline-functions-in-props** - Avoid inline functions in props
11. **react-lazy-load-with-suspense** - Use React.lazy and Suspense for code splitting
12. **react-bundling-optimization** - Optimize bundle size with tree shaking and code splitting
13. **react-vite-webpack-optimization** - Configure build tool properly

### State Management Rules
14. **react-avoid-prop-drilling** - Avoid prop drilling; use Context or state management
15. **react-use-context-for-global-state** - Use Context API or state library for global state
16. **react-extract-custom-hooks** - Extract reusable logic into custom hooks
17. **react-state-management** - Choose appropriate state management approach
18. **react-data-fetching-best-practices** - Use query libraries instead of useEffect
19. **react-use-query-for-server-state** - Use TanStack Query/SWR for server state

### Component Rules
20. **react-prefer-composition** - Use composition over inheritance/HOCs
21. **react-use-keys-in-lists** - Use stable keys in lists, not array indices
22. **react-extract-custom-hooks** - Extract reusable logic into custom hooks

### Routing Rules
23. **react-routing-libraries** - Use React Router v6+, Wouter, or similar
24. **react-lazy-load-routes** - Lazy load route components with React.lazy

### Styling Rules
25. **react-styling-approach** - Choose consistent styling approach
26. **react-css-variables-for-theming** - Use CSS variables for theming
27. **react-responsive-design** - Use mobile-first responsive design

### Testing Rules
28. **react-testing-strategy** - Implement comprehensive testing
29. **react-testing-library-usage** - Use React Testing Library over Enzyme

### Security Rules
30. **react-avoid-dangerously-set-inner-html** - Avoid dangerouslySetInnerHTML
31. **react-sanitize-user-input** - Validate and sanitize user input
32. **react-env-prefix-validation** - Use REACT_APP_ prefix for env variables
33. **react-no-secrets-in-client** - Never store secrets in client code

### Accessibility Rules
34. **react-accessibility-best-practices** - Follow WCAG guidelines
35. **react-semantic-html** - Use semantic HTML elements
36. **react-image-alt-text** - Always provide alt text for images
37. **react-aria-labels** - Provide ARIA labels when needed
38. **react-keyboard-navigation** - Ensure keyboard navigation
39. **react-color-contrast** - Maintain adequate color contrast
40. **react-form-labels** - Associate labels with form inputs
41. **react-error-boundaries** - Use error boundaries
42. **react-performance-monitoring** - Monitor performance metrics

---

## Next.js Best Practices

**File:** `src/rules/nextjs-llm-best-practices.json`
**Count:** 28+ rules

### Architecture Rules
1. **next-app-router-only** - Use App Router exclusively (no Pages Router)
2. **next-preferred-server-components** - Default to Server Components
3. **no-client-importing-server-only** - Don't import server-only code in client components

### Data Fetching Rules
4. **no-data-fetching-in-useeffect** - Avoid data fetching in useEffect
5. **use-server-actions-for-mutations** - Use Server Actions for form submissions
6. **validate-server-action-inputs** - Always validate server action inputs
7. **next-revalidation-strategy** - Choose appropriate revalidation strategy

### Component Rules
8. **use-suspense-boundaries** - Wrap async components with Suspense
9. **next-dynamic-imports** - Use dynamic() for code splitting

### Image & Font Optimization
10. **use-next-image** - Use Next.js Image component for images
11. **use-next-font** - Use next/font for font loading

### SEO Rules
12. **next-seo-metadata** - Use Metadata API for SEO
13. **next-generate-metadata** - Generate dynamic metadata
14. **next-structured-data** - Include JSON-LD structured data
15. **next-sitemap-robots** - Configure sitemap and robots.txt

### Error Handling Rules
16. **next-error-handling** - Implement error.tsx
17. **next-not-found-handling** - Implement not-found.tsx
18. **next-loading-ui** - Implement loading.tsx for streaming UI

### Advanced Features
19. **next-middleware-usage** - Use middleware for auth and routing
20. **next-parallel-routes** - Use parallel routes (@folder)
21. **next-intercepting-routes** - Use intercepting routes
22. **next-route-groups** - Use route groups for organization

### Styling Rules
23. **next-css-modules** - Prefer CSS Modules or Tailwind CSS

### Security Rules
24. **no-env-access-in-client** - Never access non-NEXT_PUBLIC_ env vars in client

### TypeScript Rules
25. **next-typescript-strict** - Enable TypeScript strict mode

### Deployment Rules
26. **next-api-routes-safety** - Secure API routes with validation
27. **next-deployment-readiness** - Configure for optimal deployment
28. **next-edge-functions** - Consider Edge Functions for performance

---

## Security Rules

### React Security Rules

**File:** `src/config/react-llm-security-rules.json`
**Count:** 15 rules

#### Critical Severity Rules
1. **xss-prevention** - Prevent XSS attacks via dangerouslySetInnerHTML and eval()
2. **no-hardcoded-secrets** - No API keys, tokens, or passwords in code
3. **no-eval** - Avoid eval() and dynamic code execution
4. **react2shell** - Prevent command injection from user input
5. **ssrf-prevention** - Prevent server-side request forgery
6. **ssr-xss-prevention** - Prevent XSS in SSR contexts
7. **graphql-injection-prevention** - Prevent GraphQL injection

#### High Severity Rules
8. **dependency-vulnerabilities** - Check for vulnerable npm packages
9. **secure-api-calls** - Use HTTPS for API communication
10. **secure-localStorage** - Don't store secrets in localStorage
11. **input-validation** - Validate and sanitize user input
12. **csp-compliance** - Comply with Content Security Policy
13. **third-party-risk** - Assess third-party dependencies

#### Medium Severity Rules
14. **no-console-sensitive-data** - Don't log passwords/tokens to console

### Next.js Security Rules

**File:** `src/config/nextjs-llm-security-rules.json`
**Count:** 12 rules

#### Critical Severity Rules
1. **no-env-variable-exposure** - Don't expose secrets to client
2. **server-action-validation** - Validate all server action inputs
3. **no-hardcoded-secrets** - No hardcoded API keys or tokens
4. **sql-injection-prevention** - Use parameterized queries/ORM
5. **auth-validation** - Validate auth on protected resources
6. **react2shell-command-injection** - Never pass user input to shell commands

#### High Severity Rules
7. **xss-prevention** - Prevent XSS vulnerabilities
8. **csp-headers** - Configure CSP headers
9. **csrf-protection** - Implement CSRF token validation
10. **secure-headers** - Configure security headers
11. **dependency-vulnerabilities** - Check for vulnerable dependencies

#### Medium Severity Rules
12. **no-console-sensitive-data** - Don't log sensitive data

---

## Accessibility Rules

**File:** `src/config/react-next-llm-accessibility-rules.json`
**Count:** 16 rules
**Standard:** WCAG 2.2

### Critical Rules
1. **img-alt-text** (WCAG 1.1.1) - All images must have alt text
2. **button-accessibility** (WCAG 2.1.1) - Interactive elements must be keyboard accessible
3. **label-input-association** (WCAG 1.3.1) - Form inputs must have labels

### High Severity Rules
4. **aria-required-attributes** (WCAG 4.1.2) - ARIA roles need required attributes
5. **focus-visible** (WCAG 2.4.7) - Maintain visible focus indicators
6. **aria-hidden-focus** (WCAG 4.1.2) - No focusable elements in aria-hidden
7. **color-contrast** (WCAG 1.4.3) - Sufficient color contrast ratios
8. **link-text** (WCAG 2.4.4) - Descriptive link text
9. **focus-order** (WCAG 2.4.3) - Logical focus order
10. **video-audio-captions** (WCAG 1.2.1) - Captions for media
11. **motion-animation** (WCAG 2.3.3) - Respect prefers-reduced-motion
12. **text-resizing** (WCAG 1.4.4) - Support text resizing

### Medium Severity Rules
13. **heading-order** (WCAG 1.3.1) - Correct heading hierarchy
14. **page-title** (WCAG 2.4.2) - Descriptive page titles
15. **skip-links** (WCAG 2.4.1) - Skip navigation links
16. **error-messages** (WCAG 3.3.3) - Clear error messages

---

## Rule Files Location

### Configuration Files (Active Rules)
```
src/config/
├── next-llm-rules.json                  # Next.js configuration
├── react-llm-rules.json                 # React configuration
├── nextjs-llm-security-rules.json       # Next.js security rules
├── react-llm-security-rules.json        # React security rules
└── react-next-llm-accessibility-rules.json  # Accessibility rules
```

### Documentation Files (Reference for LLMs)
```
src/rules/
├── nextjs-llm-best-practices.json       # Next.js best practices reference
├── react-llm-best-practices.json        # React best practices reference
├── nextjs-llm-security-rules.json       # Next.js security reference
├── react-llm-security-rules.json        # React security reference
└── react-next-llm-accessibility-rules.json  # Accessibility reference
```

### Documentation Files
```
docs/
├── CUSTOM_RULES_GUIDE.md                # Guide for customizing rules
├── SECURITY_RULES_GUIDE.md              # Security rules guide
├── CONFIGURATION_EXAMPLES.md            # Configuration examples
└── ...
```

---

## Customization

To customize rules, see [CUSTOM_RULES_GUIDE.md](CUSTOM_RULES_GUIDE.md) for detailed instructions.

### Quick Start
1. Edit the appropriate JSON file in `src/config/`
2. Rebuild: `npm run build`
3. Changes apply immediately

### Common Adjustments
- **Enable/disable rules**: Change `"enabled"` property
- **Change severity**: Modify `"severity"` level
- **Add patterns**: Extend `"patterns"` array
- **Update descriptions**: Modify `"recommendation"` text

