# Architecture Analysis Guide

This document explains the comprehensive architecture analysis capabilities of the MCP Server for Next.js & React Development.

## Overview

The architecture analysis system provides deep insights into your project's structure, design patterns, and development practices. It helps you understand your codebase better and make informed decisions about improvements.

## Components

### 1. ArchitectureAnalyzer

The `ArchitectureAnalyzer` performs framework-specific analysis of your project's architecture.

#### For Next.js Projects

```typescript
analyzeNextArchitecture(codeFiles: Map<string, string>, files: string[]): ArchitectureAnalysis
```

**Detects:**
- **Architecture Styles:**
  - Next.js App Router (modern)
  - Pages Router (legacy)
  - Backend-for-Frontend (BFF) patterns
  
- **Layering:**
  - Service layer presence
  - Controller patterns
  - Feature-based vs layered architecture
  
- **State Management:**
  - Global state (Redux, Zustand)
  - Local state (useState)
  - Context API usage
  
- **Data Flow:**
  - Unidirectional data flow
  - Server-side data fetching
  - Client-side data fetching

**Returns:**
```typescript
{
  componentStructure: "Next.js App Router, Pages Router (Legacy)",
  dataFlow: "Unidirectional (React)",
  stateManagement: "Global state, Local state",
  recommendations: [
    "Migrate Pages Router to App Router",
    "Introduce service layer to separate business logic from UI"
  ]
}
```

#### For React Projects

```typescript
analyzeReactArchitecture(codeFiles: Map<string, string>, files: string[]): ArchitectureAnalysis
```

**Detects:**
- **Component Types:**
  - Functional components
  - Class components (legacy)
  
- **Data Fetching Patterns:**
  - useEffect-based fetching
  - External libraries (axios, fetch)
  
- **State Management:**
  - Context API
  - External state management (Redux, Zustand, Recoil, MobX)
  - Local state (useState)
  
- **Architectural Issues:**
  - Logic and UI mixing
  - Missing error boundaries
  - Business logic in components

**Returns:**
```typescript
{
  componentStructure: "React Functional Component",
  dataFlow: "Client-side data fetching",
  stateManagement: "Context API, Local State (useState)",
  recommendations: [
    "Consider extracting business logic into hooks or services",
    "Add Error Boundaries for resilience"
  ]
}
```

### 2. DesignPatternAnalyzer

The `DesignPatternAnalyzer` identifies common design patterns in your codebase.

```typescript
analyze(codeFiles: Map<string, string>): DesignPatternAnalysis
```

**Detected Patterns:**

#### React-Specific Patterns

1. **Higher-Order Components (HOC)**
   - Detects: `with*` function names, component wrapping patterns
   - Example: `withAuth`, `withLogger`
   - Confidence: High when multiple HOCs found

2. **Custom Hooks**
   - Detects: `use*` function names in appropriate files
   - Example: `useAuth`, `useFetch`, `useLocalStorage`
   - Confidence: High when hooks follow naming conventions

3. **Render Props**
   - Detects: Functions passed as children or props
   - Example: `<DataProvider render={(data) => <div>{data}</div>} />`
   - Confidence: Medium (can be used for other purposes)

4. **Provider Pattern**
   - Detects: Context providers, `*Provider` components
   - Example: `AuthProvider`, `ThemeProvider`
   - Confidence: High when Context API is used

5. **Compound Components**
   - Detects: Components with sub-components (dot notation)
   - Example: `Tabs.Panel`, `Card.Header`
   - Confidence: Medium (requires structural analysis)

6. **Container/Presentational**
   - Detects: Separation of logic and UI
   - Example: `UserContainer` + `UserView`
   - Confidence: Medium (pattern overlap possible)

#### General Design Patterns

7. **Facade Pattern**
   - Detects: Wrapper classes/functions that simplify complex APIs
   - Confidence: Medium

8. **Singleton Pattern**
   - Detects: Single instance patterns
   - Confidence: High when explicit singleton implementation found

9. **Factory Pattern**
   - Detects: `create*` functions, factory functions
   - Confidence: Medium

10. **Observer Pattern**
    - Detects: Event emitters, pub/sub implementations
    - Confidence: Medium

11. **Strategy Pattern**
    - Detects: Pluggable algorithms, strategy interfaces
    - Confidence: Low (requires semantic analysis)

**Returns:**
```typescript
{
  detectedPatterns: [
    {
      name: "Custom Hooks",
      confidence: "high",
      evidence: [
        "useAuth in hooks/useAuth.ts",
        "useFetch in hooks/useFetch.ts",
        "useLocalStorage in hooks/useLocalStorage.ts"
      ]
    },
    {
      name: "Provider Pattern",
      confidence: "high",
      evidence: [
        "AuthProvider in context/AuthContext.tsx",
        "ThemeProvider in context/ThemeContext.tsx"
      ]
    },
    {
      name: "Higher-Order Component (HOC)",
      confidence: "medium",
      evidence: [
        "withAuth in hoc/withAuth.tsx"
      ]
    }
  ]
}
```

### 3. SDLCAnalyzer

The `SDLCAnalyzer` evaluates your project's software development lifecycle maturity.

```typescript
analyze(files: string[]): SDLCAnalysis
```

**Analyzes:**

#### Test Strategy (none | basic | good | excellent)
- **None**: No test files found
- **Basic**: Some test files present
- **Good**: Comprehensive test coverage with multiple testing libraries
- **Excellent**: Full coverage with unit, integration, and e2e tests

**Detects:**
- Test files: `*.test.*`, `*.spec.*`, `__tests__/`
- Testing frameworks: Jest, Vitest, React Testing Library, Cypress, Playwright

#### CI/CD Setup (missing | basic | mature)
- **Missing**: No CI/CD configuration found
- **Basic**: Basic CI configuration present
- **Mature**: Comprehensive CI/CD with multiple workflows

**Detects:**
- GitHub Actions: `.github/workflows/`
- GitLab CI: `.gitlab-ci.yml`
- CircleCI: `.circleci/config.yml`
- Travis CI: `.travis.yml`
- Jenkins: `Jenkinsfile`

#### Code Quality Gates
**Detects:**
- **Linting**: ESLint (`.eslintrc`), Biome (`biome.json`)
- **Formatting**: Prettier (`.prettierrc`)
- **Type Checking**: TypeScript (`tsconfig.json`)
- **Pre-commit Hooks**: Husky (`.husky/`), lint-staged

#### Documentation Quality (poor | average | good)
- **Poor**: No README or minimal documentation
- **Average**: README present with basic information
- **Good**: Comprehensive README, code comments, API docs

**Detects:**
- README files
- Documentation in `docs/` directory
- JSDoc comments in code

#### Overall Maturity (low | medium | high)
Calculated based on:
- Test strategy score
- CI/CD presence
- Code quality gates count
- Documentation quality

**Returns:**
```typescript
{
  testStrategy: "good",
  ciCd: "basic",
  codeQualityGates: [
    "ESLint configured",
    "TypeScript configured",
    "Prettier configured"
  ],
  documentation: "average",
  overallMaturity: "medium",
  recommendations: [
    "Add end-to-end tests with Playwright or Cypress",
    "Set up automated deployment pipeline",
    "Improve API documentation with JSDoc",
    "Add pre-commit hooks with Husky",
    "Consider adding integration tests"
  ]
}
```

## Usage

### Project-Level Analysis

To get comprehensive analysis of your entire project, use the `review-code` tool without providing a file path:

```typescript
// In your AI assistant:
"Use review-code tool to analyze my entire project"
```

This will:
1. Scan all source files in the project
2. Perform architecture analysis based on detected framework
3. Identify design patterns across the codebase
4. Evaluate SDLC maturity
5. Provide comprehensive recommendations

### Example Response

```json
{
  "projectRoot": "/home/user/my-nextjs-app",
  "totalFiles": 42,
  "filesWithIssues": 15,
  "results": [...], // Individual file reviews
  "summary": {
    "averageQuality": 78.5
  },
  "architecture": {
    "componentStructure": "Next.js App Router, Pages Router (Legacy)",
    "dataFlow": "Unidirectional (React)",
    "stateManagement": "Global state, Local state",
    "recommendations": [
      "Migrate Pages Router to App Router",
      "Introduce service layer to separate business logic from UI"
    ]
  },
  "designPatterns": {
    "detectedPatterns": [
      {
        "name": "Custom Hooks",
        "confidence": "high",
        "evidence": [
          "useAuth in hooks/useAuth.ts",
          "useFetch in hooks/useFetch.ts"
        ]
      },
      {
        "name": "Provider Pattern",
        "confidence": "high",
        "evidence": [
          "AuthProvider in context/AuthContext.tsx"
        ]
      }
    ]
  },
  "sdlcAnalysis": {
    "testStrategy": "good",
    "ciCd": "basic",
    "codeQualityGates": [
      "ESLint configured",
      "TypeScript configured",
      "Prettier configured"
    ],
    "documentation": "average",
    "overallMaturity": "medium",
    "recommendations": [
      "Add end-to-end tests with Playwright or Cypress",
      "Set up automated deployment pipeline",
      "Improve API documentation"
    ]
  }
}
```

## Benefits

### 1. Architecture Understanding
- Quickly understand the architectural style of a new codebase
- Identify inconsistencies in architecture patterns
- Get framework-specific insights

### 2. Design Pattern Recognition
- Discover patterns you might not have noticed
- Validate your architectural decisions
- Learn from existing patterns in the codebase

### 3. SDLC Improvement
- Identify gaps in testing, CI/CD, and documentation
- Get actionable recommendations for improvement
- Track project maturity over time

### 4. Refactoring Guidance
- Understand what needs to be refactored
- Get specific recommendations for architecture improvements
- Plan migration strategies (e.g., Pages Router to App Router)

## Best Practices

1. **Run Regular Analysis**: Perform project-level reviews periodically to track progress
2. **Act on Recommendations**: Prioritize recommendations based on project needs
3. **Document Patterns**: Keep track of design patterns you adopt
4. **Improve SDLC**: Use SDLC analysis to systematically improve development practices
5. **Share Results**: Use analysis results in code reviews and team discussions

## Extending the Analysis

The architecture analysis system is designed to be extensible:

### Adding New Pattern Detection
Edit `src/common/designPatternAnalyzer.ts` to add new patterns:

```typescript
// Example: Detect Module Pattern
if (/const\s+\w+\s*=\s*\(\s*function\s*\(\)/.test(allCode)) {
  patterns.push({
    name: 'Module Pattern',
    confidence: 'medium',
    evidence: ['IIFE pattern detected in codebase']
  });
}
```

### Adding New SDLC Checks
Edit `src/common/SDLCAnalyzer.ts` to add new checks:

```typescript
// Example: Check for security scanning
const hasSecurityScanning = files.some(f => 
  f.includes('snyk') || f.includes('dependabot')
);
if (hasSecurityScanning) {
  codeQualityGates.push('Security scanning configured');
}
```

### Framework-Specific Analysis
Edit `src/common/architectureAnalyzer.ts` to enhance framework detection:

```typescript
// Example: Detect specific Next.js patterns
const hasServerActions = files.some(f => f.includes('actions/'));
if (hasServerActions) {
  architectureStyle.push('Server Actions Pattern');
}
```

## Troubleshooting

### Issue: Patterns Not Detected
**Solution**: Ensure your code follows common naming conventions (e.g., `use*` for hooks, `with*` for HOCs)

### Issue: Incorrect Framework Detection
**Solution**: Check your package.json dependencies and project structure

### Issue: Low Confidence Scores
**Solution**: Confidence is based on evidence strength. Low scores often indicate less explicit pattern usage.

### Issue: Missing SDLC Features
**Solution**: Ensure configuration files are in standard locations (e.g., `.github/workflows/` for GitHub Actions)

## See Also

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall system architecture
- [README.md](../README.md) - Main documentation
- [FRAMEWORK_DETECTION.md](../FRAMEWORK_DETECTION.md) - Framework detection details
