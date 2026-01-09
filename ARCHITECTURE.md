# MCP Server Architecture - React & Next.js Support

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP Server Entry Point                   │
│                     (src/index.ts)                          │
│          React & Next.js Dev Assistant v1.0.0               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Tool Registration                         │
│                  (src/tools/index.ts)                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ • analyze-code      • optimize-code                 │  │
│  │ • review-code       • generate-component            │  │
│  │ • refactor-code     • get-best-practices            │  │
│  │ • check-migration-readiness                         │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Project Detection Layer                         │
│          (src/common/project-detector.ts)                   │
│                                                             │
│  Analyzes:                                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ • package.json (dependencies)                       │  │
│  │ • Project structure (app/, pages/, src/)            │  │
│  │ • TypeScript configuration                          │  │
│  │ • Bundler type (Vite, Webpack, CRA)                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Returns: FrameworkType ('react' | 'nextjs')               │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  React Project   │    │  Next.js Project │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     Core Modules                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Code Analyzer                               │
│              (src/core/analyzer.ts)                         │
│                                                             │
│  React:                      │  Next.js:                    │
│  ────────────────────────────┼──────────────────────────── │
│  • Hook rules validation     │  • 'use client' directive   │
│  • State management          │  • Server Components        │
│  • Data fetching patterns    │  • App Router patterns      │
│  • Key usage in lists        │  • next/image, next/font    │
│  • Class components          │  • Metadata API             │
│  • REACT_APP_ env vars       │  • NEXT_PUBLIC_ env vars    │
│                              │  • Server Actions           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Code Reviewer                               │
│              (src/core/reviewer.ts)                         │
│                                                             │
│  Common Quality Metrics:                                    │
│  • Maintainability (file/function length, comments)        │
│  • Complexity (cyclomatic complexity)                       │
│  • Testability (pure functions, DI)                         │
│  • Readability (naming, nesting, formatting)                │
│                                                             │
│  Framework-specific architecture analysis                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Code Optimizer                              │
│              (src/core/optimizer.ts)                        │
│                                                             │
│  React:                      │  Next.js:                    │
│  ────────────────────────────┼──────────────────────────── │
│  • Image lazy loading        │  • next/image component     │
│  • Responsive images         │  • next/font optimization   │
│  • Route-based splitting     │  • Server Components        │
│  • React.lazy() usage        │  • Dynamic imports          │
│  • useMemo/useCallback       │  • Edge runtime             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Helper Functions                            │
│              (src/common/helper.ts)                         │
│                                                             │
│  • generateComponent()       → Routes to framework-specific │
│  • generateReactComponent()  → React functional components  │
│  • refactorCode()            → Framework-aware refactoring  │
│  • checkMigrationReadiness() → Next.js Pages → App Router   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Architecture Analysis Modules                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ArchitectureAnalyzer                            │
│        (src/common/architectureAnalyzer.ts)                 │
│                                                             │
│  Framework-specific architecture analysis:                  │
│  • analyzeNextArchitecture()  → App/Pages Router detection  │
│  • analyzeReactArchitecture() → Component & state patterns  │
│  • analyzeGenericArchitecture() → Fallback analysis        │
│                                                             │
│  Analyzes:                                                  │
│  • Component structure (functional, class, server/client)   │
│  • Data flow patterns (unidirectional, client/server fetch) │
│  • State management (Context, Redux, Zustand, local state)  │
│  • Architecture styles (App Router, Pages Router, BFF)      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              DesignPatternAnalyzer                           │
│        (src/common/designPatternAnalyzer.ts)                │
│                                                             │
│  Detects common design patterns:                            │
│  • Higher-Order Components (HOC)                            │
│  • Render Props                                             │
│  • Custom Hooks                                             │
│  • Compound Components                                      │
│  • Provider Pattern (Context API)                           │
│  • Container/Presentational Pattern                         │
│  • Facade Pattern                                           │
│  • Singleton Pattern                                        │
│  • Factory Pattern                                          │
│  • Observer Pattern                                         │
│  • Strategy Pattern                                         │
│                                                             │
│  Returns confidence level: high | medium | low              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  SDLCAnalyzer                                │
│           (src/common/SDLCAnalyzer.ts)                      │
│                                                             │
│  Analyzes project maturity:                                 │
│  • Test strategy (none, basic, good, excellent)            │
│  • CI/CD presence (missing, basic, mature)                 │
│  • Code quality gates (linting, formatting, type-checking)  │
│  • Documentation quality (poor, average, good)              │
│  • Overall maturity (low, medium, high)                     │
│                                                             │
│  Provides actionable recommendations for improvement        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Configuration Layer                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│  react-llm-rules     │         │  next-llm-rules      │
│  (src/config/)       │         │  (src/config/)       │
│                      │         │                      │
│  • Hooks rules       │         │  • App Router        │
│  • State management  │         │  • Server Components │
│  • React Router      │         │  • Data fetching     │
│  • Data fetching     │         │  • Metadata API      │
│  • Performance       │         │  • Performance       │
│  • Security          │         │  • Security          │
│  • Accessibility     │         │  • Accessibility     │
│  • Testing           │         │  • Testing           │
│  • Best practices    │         │  • Best practices    │
│  • Anti-patterns     │         │  • Anti-patterns     │
└──────────────────────┘         └──────────────────────┘
```

## Data Flow

### Tool Invocation Flow

```
User Request
    ↓
MCP Server receives tool call
    ↓
Project Detector analyzes project
    ↓
    ├─→ React detected → Load react-llm-rules.json
    │                  → Use React analyzers
    │                  → Generate React components
    │
    └─→ Next.js detected → Load next-llm-rules.json
                         → Use Next.js analyzers
                         → Generate Next.js components
    ↓
Core Module processes code
    ↓
Results returned to user
```

### Example: analyze-code Tool

```
1. User calls: analyze-code { filePath: "src/App.tsx" }
   ↓
2. ProjectDetector checks package.json
   ↓ Found: { "react": "^18.2.0" } → framework = 'react'
   ↓
3. CodeAnalyzer loads react-llm-rules.json
   ↓
4. Runs React-specific checks:
   - checkHookRules()
   - checkReactDataFetching()
   - checkStateManagement()
   - checkKeyUsage()
   - checkReactEnvVariables()
   ↓
5. Returns analysis with:
   {
     issues: [...],
     suggestions: [...],
     score: 85,
     summary: "Framework: React\nFound 2 warnings..."
   }
```

### Example: generate-component Tool

```
1. User calls: generate-component { 
     name: "UserCard", 
     type: "client-component",
     features: ["form", "data-fetching"]
   }
   ↓
2. generateComponent() detects framework
   ↓ framework = 'react'
   ↓
3. Routes to generateReactComponent()
   ↓
4. Generates:
   - Functional component
   - useState for form
   - useEffect for data fetching
   - Proper error handling
   - TypeScript interfaces
   ↓
5. Returns generated code
```

### Example: review-code Tool (Project-level)

```
1. User calls: review-code (no filePath = project-level review)
   ↓
2. reviewProject() scans all source files
   ↓
3. For each file:
   - Runs code quality analysis (maintainability, complexity)
   - Reviews best practices
   - Calculates quality scores
   ↓
4. Project-level analysis:
   - ArchitectureAnalyzer.analyzeNextArchitecture()
     * Detects App Router vs Pages Router
     * Analyzes layering (services, controllers)
     * Identifies state management patterns
     * Checks data flow patterns
   
   - DesignPatternAnalyzer.analyze()
     * Detects HOCs, Custom Hooks, Provider patterns
     * Returns confidence levels for each pattern
   
   - SDLCAnalyzer.analyze()
     * Checks test coverage and strategy
     * Evaluates CI/CD setup
     * Assesses code quality gates
     * Reviews documentation
   ↓
5. Returns comprehensive project analysis:
   {
     architecture: {
       componentStructure: "Next.js App Router, Pages Router (Legacy)",
       dataFlow: "Unidirectional (React)",
       stateManagement: "Global state, Local state",
       recommendations: [...]
     },
     designPatterns: {
       detectedPatterns: [
         { name: "Custom Hooks", confidence: "high", evidence: [...] },
         { name: "Provider Pattern", confidence: "medium", evidence: [...] }
       ]
     },
     sdlcAnalysis: {
       testStrategy: "good",
       ciCd: "basic",
       overallMaturity: "medium",
       recommendations: [...]
     }
   }
```

## Component Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                     User's IDE/Client                        │
│  (VS Code, Claude Desktop, Cline, etc.)                     │
└────────────────────┬────────────────────────────────────────┘
                     │ MCP Protocol (stdio)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  MCP Server                                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tools Layer (7 tools registered)                    │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Detection Layer (project-detector)                   │  │
│  │  - Cached results                                     │  │
│  │  - Framework detection                                │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Core Processing (analyzer, reviewer, optimizer)      │  │
│  │  - Framework-aware logic                              │  │
│  │  - Rule application                                   │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Rules & Configuration                                │  │
│  │  - react-llm-rules.json                               │  │
│  │  - next-llm-rules.json                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ Results
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              User sees analysis/suggestions                  │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. **Automatic Detection**
- No user configuration required
- Project type detected from package.json and structure
- Results cached for performance

### 2. **Framework-Specific Logic**
- Separate rule files for each framework
- Core modules load appropriate rules dynamically
- Tool descriptions indicate dual support

### 3. **Backward Compatibility**
- All Next.js features preserved
- Existing configurations work unchanged
- No breaking changes to APIs

### 4. **Extensibility**
- Easy to add new frameworks (Remix, Astro, Vue, Svelte)
- Rule files are JSON (easy to customize)
- Detection logic is modular

### 5. **Performance**
- Detection results cached
- Rules loaded once per framework
- File-level detection for multi-framework projects

## Benefits of This Architecture

✅ **Unified**: One tool for multiple frameworks
✅ **Smart**: Context-aware suggestions
✅ **Maintainable**: Separation of concerns
✅ **Scalable**: Easy to add frameworks
✅ **Fast**: Caching and efficient detection
✅ **Flexible**: Customizable rules per framework
