import * as fs from 'node:fs';
import * as path from 'node:path';
import { CodeOptimizer } from '../core/optimizer.js';
import { CodeReviewer } from '../core/reviewer.js';
import { CodeAnalyzer } from '../core/analyzer.js';
import { projectDetector } from './project-detector.js';
import ArchitectureAnalyzer from './architectureAnalyzer.js';
import DesignPatternAnalyzer from './designPatternAnalyzer.js';
import SDLCAnalyzer from './SDLCAnalyzer.js';
import { ArchitectureAnalysis } from '../types/schema.js';

// Helper functions for extracted ternary operations
type ImpactLevel = 'High' | 'Medium' | 'Low';

// Interface definition for code patterns
interface CodePattern {
  pattern: string;
  occurrences: number;
  lines: number[];
  type: 'jsx' | 'logic' | 'styling' | 'import';
  suggestion: string;
  extractedComponent?: string;
}

function getEstimatedEffort(blockersCount: number, warningsCount: number): ImpactLevel {
  if (blockersCount > 2) return 'High';
  if (warningsCount > 3) return 'Medium';
  return 'Low';
}

function getRefactoringPotentialFromLines(totalLines: number): ImpactLevel {
  if (totalLines > 50) return 'High';
  if (totalLines > 20) return 'Medium';
  return 'Low';
}

function getRefactoringPotential(count: number): ImpactLevel {
  if (count > 10) return 'High';
  if (count > 5) return 'Medium';
  return 'Low';
}

function getConfidenceLevel(blockersCount: number, warningsCount: number): ImpactLevel {
  if (blockersCount === 0 && warningsCount === 0) return 'High';
  if (blockersCount === 0) return 'Medium';
  return 'Low';
}

function findRepeatedJSXBlocks(code: string, minOccurrences: number, includeSmall: boolean): any[] {
  const patterns: any[] = [];

  // Find JSX element patterns (e.g., <div>, <button>, etc.)
  const jsxElementRegex = /<(\w+)([^>]*)>(.*?)<\/\1>/gs;
  const jsxElements = [...code.matchAll(jsxElementRegex)];

  // Group similar JSX blocks
  const jsxMap = new Map<string, { pattern: string; lines: number[] }>();

  jsxElements.forEach((match) => {
    const fullMatch = match[0];
    const normalized = normalizeJSX(fullMatch);

    // Skip very small patterns if not included
    if (!includeSmall && fullMatch.split('\n').length < 3) return;

    const lineNumber = code.substring(0, match.index).split('\n').length;

    if (jsxMap.has(normalized)) {
      jsxMap.get(normalized)!.lines.push(lineNumber);
    } else {
      jsxMap.set(normalized, { pattern: fullMatch, lines: [lineNumber] });
    }
  });

  // Convert to patterns array
  jsxMap.forEach((value, key) => {
    if (value.lines.length >= minOccurrences) {
      const componentName = inferComponentName(value.pattern);
      patterns.push({
        pattern: value.pattern,
        occurrences: value.lines.length,
        lines: value.lines,
        type: 'jsx',
        suggestion: `Extract to reusable component: ${componentName}`,
        extractedComponent: generateComponentExample(componentName, value.pattern)
      });
    }
  });

  return patterns;
}

function findRepeatedLogic(code: string, minOccurrences: number, includeSmall: boolean): any[] {
  const patterns: any[] = [];

  // Find repeated function calls
  const functionCalls = code.match(/\w+\([^)]*\)/g) || [];
  const callMap = new Map<string, number>();

  functionCalls.forEach(call => {
    const normalized = call.replaceAll(/['"][^'"]*['"]/g, '""'); // Normalize strings
    callMap.set(normalized, (callMap.get(normalized) || 0) + 1);
  });

  callMap.forEach((count, pattern) => {
    if (count >= minOccurrences && pattern.length > 10) {
      patterns.push({
        pattern,
        occurrences: count,
        lines: [],
        type: 'logic',
        suggestion: `Consider extracting this logic into a utility function`
      });
    }
  });

  // Find repeated conditional patterns
  const conditionalPatterns = [
    { regex: /if\s*\([^)]+\)\s*{[^}]+}/g, name: 'conditional logic' },
    { regex: /\?\s*[^:]+\s*:/g, name: 'ternary expressions' },
  ];

  conditionalPatterns.forEach(({ regex, name }) => {
    const matches = [...code.matchAll(regex)];
    const patternMap = new Map<string, number>();

    matches.forEach(match => {
      const normalized = match[0].replaceAll(/\s+/g, ' ').trim();
      if (!includeSmall && normalized.length < 20) return;
      patternMap.set(normalized, (patternMap.get(normalized) || 0) + 1);
    });

    patternMap.forEach((count, pattern) => {
      if (count >= minOccurrences) {
        patterns.push({
          pattern: pattern.substring(0, 100) + (pattern.length > 100 ? '...' : ''),
          occurrences: count,
          lines: [],
          type: 'logic',
          suggestion: `Extract repeated ${name} into a helper function`
        });
      }
    });
  });

  return patterns;
}

function findRepeatedStyling(code: string, minOccurrences: number): any[] {
  const patterns: any[] = [];

  // Find repeated className patterns
  const classNameRegex = /className=["']([^"']+)["']/g;
  const classNameMatches = code.match(classNameRegex) || [];
  const classMap = new Map<string, number>();
  const classExtractRegex = /className=["']([^"']+)["']/;

  classNameMatches.forEach(match => {
    const className = classExtractRegex.exec(match)?.[1];
    if (className) {
      classMap.set(className, (classMap.get(className) || 0) + 1);
    }
  });

  classMap.forEach((count, pattern) => {
    if (count >= minOccurrences && pattern.split(' ').length > 2) {
      patterns.push({
        pattern: `className="${pattern}"`,
        occurrences: count,
        lines: [],
        type: 'styling',
        suggestion: `Extract to CSS variable or Tailwind @apply directive`
      });
    }
  });

  // Find repeated inline styles
  const styleMatches = code.match(/style={{[^}]+}}/g) || [];
  const styleMap = new Map<string, number>();

  styleMatches.forEach(match => {
    styleMap.set(match, (styleMap.get(match) || 0) + 1);
  });

  styleMap.forEach((count, pattern) => {
    if (count >= minOccurrences) {
      patterns.push({
        pattern: pattern.substring(0, 80) + (pattern.length > 80 ? '...' : ''),
        occurrences: count,
        lines: [],
        type: 'styling',
        suggestion: `Extract inline styles to CSS classes or styled components`
      });
    }
  });

  return patterns;
}

function findDuplicateImports(code: string): any[] {
  const patterns: any[] = [];
  const lines = code.split('\n');
  const imports = lines.filter(line => line.trim().startsWith('import'));

  // Find imports from the same source
  const sourceMap = new Map<string, string[]>();
  const fromRegex = /from\s+['"]([^'"]+)['"]/;

  imports.forEach(importLine => {
    const match = fromRegex.exec(importLine);
    if (match) {
      const source = match[1];
      if (!sourceMap.has(source)) {
        sourceMap.set(source, []);
      }
      sourceMap.get(source)!.push(importLine);
    }
  });

  sourceMap.forEach((importLines, source) => {
    if (importLines.length > 1) {
      patterns.push({
        pattern: importLines.join('\n'),
        occurrences: importLines.length,
        lines: [],
        type: 'import',
        suggestion: `Consolidate imports from '${source}' into a single import statement`,
        extractedComponent: `import { /* all exports */ } from '${source}';`
      });
    }
  });

  return patterns;
}

function normalizeJSX(jsx: string): string {
  // Normalize JSX by removing variable content but keeping structure
  return jsx
    .replaceAll(/\{[^}]+\}/g, '{...}') // Replace JSX expressions
    .replaceAll(/\s+/g, ' ')           // Normalize whitespace
    .replaceAll(/['"][^'"]*['"]/g, '""') // Normalize string literals
    .trim();
}

function inferComponentName(jsx: string): string {
  // Try to infer a component name from the JSX structure
  const tagRegex = /<(\w+)/;
  const tagMatch = tagRegex.exec(jsx);
  if (tagMatch) {
    const tag = tagMatch[1];
    // Capitalize and make it descriptive
    const baseName = tag.charAt(0).toUpperCase() + tag.slice(1);

    // Check for specific patterns
    if (jsx.includes('button')) return 'ReusableButton';
    if (jsx.includes('card')) return 'Card';
    if (jsx.includes('form')) return 'FormField';
    if (jsx.includes('input')) return 'InputField';
    if (jsx.includes('modal') || jsx.includes('dialog')) return 'Modal';
    if (jsx.includes('nav')) return 'NavItem';
    if (jsx.includes('list')) return 'ListItem';

    return `Reusable${baseName}`;
  }
  return 'ReusableComponent';
}

function generateReactComponent(name: string, type: string, features: string[], hasTailwind: boolean): string {
  // Map Next.js types to React equivalents
  const reactType = type === 'server-component' ? 'functional' : 
                    type === 'client-component' ? 'functional-with-state' : 
                    type;

  switch (reactType) {
    case 'functional':
    case 'functional-with-state':
      const hasState = type === 'client-component' || reactType === 'functional-with-state';
      return `
import React${hasState ? ', { useState }' : ''} from 'react';

interface ${name}Props {
  // Add your props here
}

export default function ${name}(props: ${name}Props) {
  ${hasState && features.includes('form') ? `
  const [formData, setFormData] = useState({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };
  ` : hasState ? `
  const [count, setCount] = useState(0);
  ` : ''}

  ${features.includes('data-fetching') && hasState ? `
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.example.com/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  ` : ''}

  return (
    <div${hasTailwind ? ' className="container mx-auto p-4"' : ''}>
      <h1${hasTailwind ? ' className="text-2xl font-bold"' : ''}>${name}</h1>
      ${features.includes('form') && hasState ? `
      <form onSubmit={handleSubmit}${hasTailwind ? ' className="space-y-4"' : ''}>
        <input 
          type="text" 
          placeholder="Enter text"
          ${hasTailwind ? 'className="border p-2 rounded w-full"' : ''}
        />
        <button type="submit"${hasTailwind ? ' className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"' : ''}>
          Submit
        </button>
      </form>
      ` : hasState ? `
      <button onClick={() => setCount(count + 1)}${hasTailwind ? ' className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"' : ''}>
        Count: {count}
      </button>
      ` : `
      {/* Component content */}
      `}
      ${features.includes('data-fetching') && hasState ? `
      {loading && <p>Loading...</p>}
      {data && <div>{JSON.stringify(data)}</div>}
      ` : ''}
    </div>
  );
}
      `.trim();

    case 'page':
      // For React projects, generate a page component (assuming React Router)
      return `
import React from 'react';
${features.includes('data-fetching') ? "import { useState, useEffect } from 'react';" : ''}

export default function ${name}Page() {
  ${features.includes('data-fetching') ? `
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);
  ` : ''}

  return (
    <main${hasTailwind ? ' className="container mx-auto p-8"' : ''}>
      <h1${hasTailwind ? ' className="text-4xl font-bold mb-4"' : ''}>${name}</h1>
      ${features.includes('data-fetching') ? `
      {loading ? <p>Loading...</p> : <div>{JSON.stringify(data)}</div>}
      ` : `
      {/* Page content */}
      `}
    </main>
  );
}
      `.trim();

    case 'layout':
      // For React projects, generate a layout component
      return `
import React from 'react';

interface ${name}LayoutProps {
  children: React.ReactNode;
}

export default function ${name}Layout({ children }: ${name}LayoutProps) {
  return (
    <div${hasTailwind ? ' className="min-h-screen flex flex-col"' : ''}>
      {/* Layout header */}
      <header${hasTailwind ? ' className="bg-gray-100 p-4"' : ''}>
        <nav>{/* Navigation */}</nav>
      </header>
      
      {/* Main content */}
      <main${hasTailwind ? ' className="flex-1 container mx-auto p-8"' : ''}>
        {children}
      </main>
      
      {/* Layout footer */}
      <footer${hasTailwind ? ' className="bg-gray-100 p-4 mt-auto"' : ''}>
        <p>Footer content</p>
      </footer>
    </div>
  );
}
      `.trim();

    case 'api-route':
    case 'server-action':
      // Not applicable for React projects
      return `// Server Actions and API Routes are Next.js-specific features.
// For React apps, implement API calls in your backend or use serverless functions.

// Example using fetch in a React component:
async function ${name.toLowerCase()}Handler(data: any) {
  try {
    const response = await fetch('/api/${name.toLowerCase()}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
      `.trim();

    default:
      return `// Component type '${type}' is not supported for React projects.
// Supported types: functional (server-component or client-component), page, layout`;
  }
}

function generateComponentExample(componentName: string, jsx: string): string {
  // Extract potential props from the JSX
  const propMatches = jsx.match(/(\w+)=\{[^}]+\}|(\w+)="[^"]*"/g) || [];
  const props = propMatches.map(match => {
    const propName = match.split('=')[0];
    return propName;
  }).filter((v, i, a) => a.indexOf(v) === i); // unique

  const propsInterface = props.length > 0
    ? `interface ${componentName}Props {\n  ${props.map(p => p + ': any;').join('\n  ')}\n}\n\n`
    : '';

  const propsParam = props.length > 0 ? `{ ${props.join(', ')} }: ${componentName}Props` : '';

  return `${propsInterface}export function ${componentName}(${propsParam}) {
  return (
    ${jsx.replaceAll(/\{[^}]+\}/g, (match) => {
    // Replace JSX expressions with prop references
    const propName = match.slice(1, -1).trim();
    return `{${propName}}`;
  })}
  );
}`;
}

function generateRefactoringRecommendations(patterns: any[]): string[] {
  const recommendations: string[] = [];

  const jsxPatterns = patterns.filter(p => p.type === 'jsx');
  const logicPatterns = patterns.filter(p => p.type === 'logic');
  const stylingPatterns = patterns.filter(p => p.type === 'styling');
  const importPatterns = patterns.filter(p => p.type === 'import');

  if (jsxPatterns.length > 0) {
    recommendations.push(
      `Found ${jsxPatterns.length} repeated JSX pattern(s). Consider extracting these into reusable components.`
    );
  }

  if (logicPatterns.length > 0) {
    recommendations.push(
      `Found ${logicPatterns.length} repeated logic pattern(s). Extract these into utility functions or custom hooks.`
    );
  }

  if (stylingPatterns.length > 0) {
    recommendations.push(
      `Found ${stylingPatterns.length} repeated styling pattern(s). Consider using CSS variables, Tailwind utilities, or styled-components.`
    );
  }

  if (importPatterns.length > 0) {
    recommendations.push(
      `Found ${importPatterns.length} duplicate import(s). Consolidate imports from the same source.`
    );
  }

  if (patterns.length === 0) {
    recommendations.push('No significant repeated patterns found. Code appears well-structured.');
  } else if (patterns.length > 5) {
    recommendations.push('High number of repeated patterns detected. Prioritize refactoring the most frequently repeated patterns first.');
  }

  // Add specific architectural recommendations
  const highImpactPatterns = patterns.filter(p => p.occurrences >= 3);
  if (highImpactPatterns.length > 0) {
    recommendations.push(
      `${highImpactPatterns.length} pattern(s) repeated 3+ times. These are prime candidates for immediate refactoring.`
    );
  }

  return recommendations;
}

// Helper function to get all source files in the project
export function getAllSourceFiles(dir: string, includeTests: boolean = false): string[] {
  const files: string[] = [];
  const excludedDirs = new Set([
    'node_modules',      // Dependencies
    'build',             // Build output
    'dist',              // Distribution
    '.next',             // Next.js cache
    '.git',              // Version control
    'coverage',          // Test coverage
    '.history',          // VS Code Local History
    '.vscode',           // VS Code config
    '.cache',            // Cache directories
    '.turbo',            // Turborepo cache
    '.nuxt',             // Nuxt cache
    '.output',           // Nuxt/other build outputs
    'out'                // Output directories
  ]);

  function scan(currentDir: string) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (!excludedDirs.has(entry.name)) {
            scan(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          const isTest = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(entry.name);

          if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
            if (includeTests || !isTest) {
              files.push(fullPath);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${currentDir}:`, error);
    }
  }

  scan(dir);
  return files;
}

// Helper function to analyze entire project
export async function analyzeProject(analyzer: CodeAnalyzer, includeTests: boolean = false) {
  const projectRoot = process.env.WORKSPACE_ROOT || process.cwd();
  const files = getAllSourceFiles(projectRoot, includeTests);

  const results = [];
  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const result = await analyzer.analyzeCode(code, filePath);
      if (result.issues && result.issues.length > 0) {
        results.push({ ...result, file: filePath });
      }
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error);
    }
  }

  return {
    projectRoot,
    totalFiles: files.length,
    filesWithIssues: results.length,
    results: results.slice(0, 50), // Limit to first 50 files to avoid overwhelming output
    summary: {
      totalIssues: results.reduce((sum, r) => sum + (r.issues?.length || 0), 0)
    }
  };
}

// Helper function to analyze a specific directory
export async function analyzeDirectory(analyzer: CodeAnalyzer, dir: string, includeTests: boolean = false) {
  const files = getAllSourceFiles(dir, includeTests);

  const results = [];
  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const result = await analyzer.analyzeCode(code, filePath);
      if (result.issues && result.issues.length > 0) {
        results.push({ ...result, file: filePath });
      }
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error);
    }
  }

  return {
    projectRoot: dir,
    totalFiles: files.length,
    filesWithIssues: results.length,
    results: results.slice(0, 50),
    summary: {
      totalIssues: results.reduce((sum, r) => sum + (r.issues?.length || 0), 0)
    }
  };
}

const analyzeProjectArchitecture = (codeMap: Map<string, string>, filePaths: string[]): ArchitectureAnalysis => {
  const projectInfo = projectDetector.detectFramework();
  
  switch (projectInfo.framework) {
    case 'nextjs':
      return new ArchitectureAnalyzer().analyzeNextArchitecture(codeMap, filePaths);
    case 'react':
      return new ArchitectureAnalyzer().analyzeReactArchitecture(codeMap, filePaths);
    default:
      return new ArchitectureAnalyzer().analyzeGenericArchitecture(codeMap, filePaths);
  }
}

// Helper function to review entire project
export async function reviewProject(reviewer: CodeReviewer) {
  const projectRoot = process.env.WORKSPACE_ROOT || process.cwd();
  const files = getAllSourceFiles(projectRoot, false);

  const codeByFile = new Map<string, string>();
  const results = [];
  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      codeByFile.set(filePath, code);
      const result = await reviewer.reviewCode(code, filePath);
      results.push({ ...result, file: filePath });
    } catch (error) {
      console.error(`Error reviewing ${filePath}:`, error);
    }
  }
  

  const architecture = analyzeProjectArchitecture(codeByFile, files);
  const patterns = new DesignPatternAnalyzer().analyze(codeByFile);
  const sdlc = new SDLCAnalyzer().analyze(files);

  return {
    projectRoot,
    totalFiles: files.length,
    results: results.slice(0, 50),
    summary: {
      averageQuality: results.length > 0
        ? results.reduce((sum, r) => {
          const qualityScore = (r.codeQuality.maintainability + r.codeQuality.complexity +
            r.codeQuality.testability + r.codeQuality.readability) / 4;
          return sum + qualityScore;
        }, 0) / results.length
        : 0
    },
    architecture: architecture,
    designPatterns: patterns,
    sdlcAnalysis: sdlc
  };
}

// Helper function to review a specific directory
export async function reviewDirectory(reviewer: CodeReviewer, dir: string) {
  const files = getAllSourceFiles(dir, false);

  const codeByFile = new Map<string, string>();
  const results = [];
  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      codeByFile.set(filePath, code);
      const result = await reviewer.reviewCode(code, filePath);
      results.push({ ...result, file: filePath });
    } catch (error) {
      console.error(`Error reviewing ${filePath}:`, error);
    }
  }

  const architecture = analyzeProjectArchitecture(codeByFile, files);
  const patterns = new DesignPatternAnalyzer().analyze(codeByFile);
  const sdlc = new SDLCAnalyzer().analyze(files);

  return {
    projectRoot: dir,
    totalFiles: files.length,
    results: results.slice(0, 50),
    summary: {
      averageQuality: results.length > 0
        ? results.reduce((sum, r) => {
          const qualityScore = (r.codeQuality.maintainability + r.codeQuality.complexity +
            r.codeQuality.testability + r.codeQuality.readability) / 4;
          return sum + qualityScore;
        }, 0) / results.length
        : 0
    },
    architecture: architecture,
    designPatterns: patterns,
    sdlcAnalysis: sdlc
  };
}

// Helper function to optimize entire project
export async function optimizeProject(optimizer: CodeOptimizer) {
  const projectRoot = process.env.WORKSPACE_ROOT || process.cwd();
  const files = getAllSourceFiles(projectRoot, false);

  const results = [];
  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const result = await optimizer.optimizeCode(code, filePath);
      if (result.optimizations && result.optimizations.length > 0) {
        results.push({ ...result, file: filePath });
      }
    } catch (error) {
      console.error(`Error optimizing ${filePath}:`, error);
    }
  }

  return {
    projectRoot,
    totalFiles: files.length,
    filesWithSuggestions: results.length,
    results: results.slice(0, 50),
    summary: {
      totalSuggestions: results.reduce((sum, r) => sum + (r.optimizations?.length || 0), 0)
    }
  };
}

// Helper function to optimize a specific directory
export async function optimizeDirectory(optimizer: CodeOptimizer, dir: string) {
  const files = getAllSourceFiles(dir, false);

  const results = [];
  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const result = await optimizer.optimizeCode(code, filePath);
      if (result.optimizations && result.optimizations.length > 0) {
        results.push({ ...result, file: filePath });
      }
    } catch (error) {
      console.error(`Error optimizing ${filePath}:`, error);
    }
  }

  return {
    projectRoot: dir,
    totalFiles: files.length,
    filesWithSuggestions: results.length,
    results: results.slice(0, 50),
    summary: {
      totalSuggestions: results.reduce((sum, r) => sum + (r.optimizations?.length || 0), 0)
    }
  };
}

// Helper function to check migration readiness for entire project
export async function checkProjectMigrationReadiness() {
  const projectRoot = process.env.WORKSPACE_ROOT || process.cwd();
  const pagesDir = path.join(projectRoot, 'pages');

  if (!fs.existsSync(pagesDir)) {
    return {
      error: 'No pages directory found. This project may already be using App Router or not be a Next.js project.'
    };
  }

  const files = getAllSourceFiles(pagesDir, false);
  const results = [];

  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const analysis = checkMigrationReadiness(code, filePath);
      results.push({ ...analysis, file: filePath });
    } catch (error) {
      console.error(`Error checking migration for ${filePath}:`, error);
    }
  }

  return {
    projectRoot,
    totalPages: files.length,
    results,
    summary: {
      ready: results.filter(r => r.readiness === 'Ready').length,
      hasBlockers: results.filter(r => r.blockers?.length > 0).length,
      overallReadiness: results.filter(r => r.readiness === 'Ready').length === results.length ? 'Ready' : 'Needs work'
    }
  };
}

// Helper function to check migration readiness for a specific directory
export async function checkDirectoryMigrationReadiness(dir: string) {
  const files = getAllSourceFiles(dir, false);
  const results = [];

  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const analysis = checkMigrationReadiness(code, filePath);
      results.push({ ...analysis, file: filePath });
    } catch (error) {
      console.error(`Error checking migration for ${filePath}:`, error);
    }
  }

  return {
    projectRoot: dir,
    totalPages: files.length,
    results,
    summary: {
      ready: results.filter(r => r.readiness === 'Ready').length,
      hasBlockers: results.filter(r => r.blockers?.length > 0).length,
      overallReadiness: results.filter(r => r.readiness === 'Ready').length === results.length ? 'Ready' : 'Needs work'
    }
  };
}

// Helper function to find repeated code across entire project
export async function findRepeatedCodeInProject(minOccurrences: number = 2, includeSmallPatterns: boolean = false) {
  const projectRoot = process.env.WORKSPACE_ROOT || process.cwd();
  const files = getAllSourceFiles(projectRoot, false);

  const allPatterns: any[] = [];

  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const result = findRepeatedCode(code, filePath, minOccurrences, includeSmallPatterns);
      if (result.patterns && result.patterns.length > 0) {
        allPatterns.push(...result.patterns.map((p: any) => ({ ...p, file: filePath })));
      }
    } catch (error) {
      console.error(`Error finding repeated code in ${filePath}:`, error);
    }
  }

  // Find patterns that appear across multiple files
  const crossFilePatterns = new Map<string, any[]>();

  allPatterns.forEach(pattern => {
    const key = pattern.pattern.substring(0, 100); // Use first 100 chars as key
    if (!crossFilePatterns.has(key)) {
      crossFilePatterns.set(key, []);
    }
    crossFilePatterns.get(key)!.push(pattern);
  });

  const significantPatterns = Array.from(crossFilePatterns.values())
    .filter(patterns => patterns.length > 1)
    .map(patterns => ({
      pattern: patterns[0].pattern,
      filesAffected: [...new Set(patterns.map(p => p.file))],
      totalOccurrences: patterns.reduce((sum, p) => sum + p.occurrences, 0),
      type: patterns[0].type,
      suggestion: `Extract to shared ${patterns[0].type === 'jsx' ? 'component' : 'utility'} - appears in ${patterns.length} file(s)`
    }))
    .sort((a, b) => b.totalOccurrences - a.totalOccurrences);

  return {
    projectRoot,
    totalFiles: files.length,
    crossFilePatterns: significantPatterns.slice(0, 30),
    summary: {
      totalCrossFilePatterns: significantPatterns.length,
      highestImpact: significantPatterns[0] || null,
      refactoringPotential: getRefactoringPotential(significantPatterns.length)
    }
  };
}

// Helper function to find repeated code in a specific directory
export async function findRepeatedCodeInDirectory(dir: string, minOccurrences: number = 2, includeSmallPatterns: boolean = false) {
  const files = getAllSourceFiles(dir, false);

  const allPatterns: any[] = [];

  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const result = findRepeatedCode(code, filePath, minOccurrences, includeSmallPatterns);
      if (result.patterns && result.patterns.length > 0) {
        allPatterns.push(...result.patterns.map((p: any) => ({ ...p, file: filePath })));
      }
    } catch (error) {
      console.error(`Error finding repeated code in ${filePath}:`, error);
    }
  }

  const crossFilePatterns = new Map<string, any[]>();

  allPatterns.forEach(pattern => {
    const key = pattern.pattern.substring(0, 100);
    if (!crossFilePatterns.has(key)) {
      crossFilePatterns.set(key, []);
    }
    crossFilePatterns.get(key)!.push(pattern);
  });

  const significantPatterns = Array.from(crossFilePatterns.values())
    .filter(patterns => patterns.length > 1)
    .map(patterns => ({
      pattern: patterns[0].pattern,
      filesAffected: [...new Set(patterns.map(p => p.file))],
      totalOccurrences: patterns.reduce((sum, p) => sum + p.occurrences, 0),
      type: patterns[0].type,
      suggestion: `Extract to shared ${patterns[0].type === 'jsx' ? 'component' : 'utility'} - appears in ${patterns.length} file(s)`
    }))
    .sort((a, b) => b.totalOccurrences - a.totalOccurrences);

  return {
    projectRoot: dir,
    totalFiles: files.length,
    crossFilePatterns: significantPatterns.slice(0, 30),
    summary: {
      totalCrossFilePatterns: significantPatterns.length,
      highestImpact: significantPatterns[0] || null,
      refactoringPotential: getRefactoringPotential(significantPatterns.length)
    }
  };
}

// Helper function to check accessibility in a specific directory
export async function checkAccessibilityInDirectory(analyzer: CodeAnalyzer, dir: string) {
  const files = getAllSourceFiles(dir, false);
  const results: any[] = [];
  let totalViolations = 0;

  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const result = await analyzer.checkAccessibility(code, filePath);
      if (result.issues && result.issues.length > 0) {
        results.push(result);
        totalViolations += result.issues.length;
      }
    } catch (error) {
      console.error(`Error checking accessibility for ${filePath}:`, error);
    }
  }

  return {
    projectRoot: dir,
    totalFilesScanned: files.length,
    filesWithIssues: results.length,
    results: results.slice(0, 50),
    summary: `Found ${totalViolations} accessibility issue(s) across ${results.length} file(s)`
  };
}

// Helper function to check security in a specific directory
export async function checkSecurityInDirectory(analyzer: CodeAnalyzer, dir: string) {
  const files = getAllSourceFiles(dir, false);
  const results: any[] = [];
  let totalViolations = 0;
  let criticalViolations = 0;
  let highViolations = 0;

  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf-8');
      const result = await analyzer.checkSecurity(code, filePath);

      if (result.issues && result.issues.length > 0) {
        results.push(result);
        totalViolations += result.issues.length;
        criticalViolations += result.issues.filter((i: any) => i.type === 'error').length;
        highViolations += result.issues.filter((i: any) => i.type === 'warning').length;
      }
    } catch (error) {
      console.error(`Error checking security for ${filePath}:`, error);
    }
  }

  return {
    projectRoot: dir,
    totalFilesScanned: files.length,
    filesWithIssues: results.length,
    totalViolations,
    criticalViolations,
    highViolations,
    results: results.slice(0, 50),
    summary: `Found ${totalViolations} security violation(s) across ${results.length} file(s). Critical: ${criticalViolations}, High: ${highViolations}`
  };
}

// Helper function to generate components
export function generateComponent(name: string, type: string, features: string[], styling: string): string {
  // Detect if this is a React or Next.js project
  const projectInfo = projectDetector.detectFramework();
  const isReact = projectInfo.framework === 'react';
  const hasTailwind = styling === 'tailwind';

  // For React projects, only support React components
  if (isReact) {
    return generateReactComponent(name, type, features, hasTailwind);
  }

  // For Next.js projects, support all types
  switch (type) {
    case 'server-component':
      return `
// app/components/${name}.tsx
interface ${name}Props {
  // Add your props here
}

export default async function ${name}(props: ${name}Props) {
  // Server Components can fetch data directly
  ${features.includes('data-fetching') ? `
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache', // or 'no-store' or { next: { revalidate: 3600 } }
  }).then(r => r.json());
  ` : ''}

  return (
    <div${hasTailwind ? ' className="container mx-auto p-4"' : ''}>
      <h1${hasTailwind ? ' className="text-2xl font-bold"' : ''}>${name}</h1>
      {/* Add your content here */}
    </div>
  );
}
      `.trim();

    case 'client-component':
      return `
'use client';

import { useState } from 'react';

interface ${name}Props {
  // Add your props here
}

export default function ${name}(props: ${name}Props) {
  ${features.includes('form') ? `
  const [formData, setFormData] = useState({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };
  ` : `
  const [count, setCount] = useState(0);
  `}

  return (
    <div${hasTailwind ? ' className="container mx-auto p-4"' : ''}>
      <h1${hasTailwind ? ' className="text-2xl font-bold"' : ''}>${name}</h1>
      ${features.includes('form') ? `
      <form onSubmit={handleSubmit}${hasTailwind ? ' className="space-y-4"' : ''}>
        <input 
          type="text" 
          placeholder="Enter text"
          ${hasTailwind ? 'className="border p-2 rounded"' : ''}
        />
        <button type="submit"${hasTailwind ? ' className="bg-blue-500 text-white px-4 py-2 rounded"' : ''}>
          Submit
        </button>
      </form>
      ` : `
      <button onClick={() => setCount(count + 1)}${hasTailwind ? ' className="bg-blue-500 text-white px-4 py-2 rounded"' : ''}>
        Count: {count}
      </button>
      `}
    </div>
  );
}
      `.trim();

    case 'page':
      return `
// app/${name.toLowerCase()}/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${name}',
  description: 'Description for ${name} page',
};

export default async function ${name}Page() {
  ${features.includes('data-fetching') ? `
  // Fetch data on the server
  const data = await fetch('https://api.example.com/data').then(r => r.json());
  ` : ''}

  return (
    <main${hasTailwind ? ' className="container mx-auto p-8"' : ''}>
      <h1${hasTailwind ? ' className="text-4xl font-bold mb-4"' : ''}>${name}</h1>
      {/* Page content */}
    </main>
  );
}
      `.trim();

    case 'layout':
      return `
// app/${name.toLowerCase()}/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${name}',
  description: 'Description for ${name} section',
};

export default function ${name}Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div${hasTailwind ? ' className="min-h-screen"' : ''}>
      {/* Layout header */}
      <header${hasTailwind ? ' className="bg-gray-100 p-4"' : ''}>
        <nav>{/* Navigation */}</nav>
      </header>
      
      {/* Main content */}
      <main${hasTailwind ? ' className="container mx-auto p-8"' : ''}>
        {children}
      </main>
      
      {/* Layout footer */}
      <footer${hasTailwind ? ' className="bg-gray-100 p-4 mt-8"' : ''}>
        <p>Footer content</p>
      </footer>
    </div>
  );
}
      `.trim();

    case 'server-action':
      return `
// app/actions/${name.toLowerCase()}.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Define validation schema
const ${name}Schema = z.object({
  // Add your fields here
  name: z.string().min(1),
  email: z.string().email(),
});

export async function ${name.toLowerCase()}Action(formData: FormData) {
  // Validate input
  const data = ${name}Schema.parse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  try {
    // Perform server-side action
    // e.g., database operation, API call, etc.
    const result = await fetch('https://api.example.com/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    // Revalidate cache if needed
    revalidatePath('/path-to-revalidate');

    return { success: true, data: await result.json() };
  } catch (error) {
    return { success: false, error: 'Failed to process request' };
  }
}
      `.trim();

    case 'api-route':
      return `
// app/api/${name.toLowerCase()}/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define request schema
const requestSchema = z.object({
  // Add your fields here
});

export async function GET(request: NextRequest) {
  try {
    // Handle GET request
    const data = { message: 'Success' };
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = requestSchema.parse(body);
    
    // Process request
    const result = { success: true, data: validated };
    
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
      `.trim();

    default:
      return `// Component type '${type}' not supported`;
  }
}

// Helper function to refactor code
export function refactorCode(code: string, pattern: string, filePath?: string): string {
  switch (pattern) {
    case 'pages-to-app-router':
      return `
// Original Pages Router code has been analyzed.
// Here's how to migrate to App Router:

1. Move from pages/ to app/ directory
2. Replace getServerSideProps/getStaticProps with Server Components
3. Update imports and exports
4. Use Metadata API instead of Head component

// Example transformation:
// Before (Pages Router):
// export async function getServerSideProps() {
//   const data = await fetch('...');
//   return { props: { data } };
// }
//
// export default function Page({ data }) { ... }

// After (App Router):
export default async function Page() {
  const data = await fetch('...').then(r => r.json());
  return <div>{/* Use data */}</div>;
}

export const metadata = {
  title: 'Page Title',
  description: 'Page description',
};
      `.trim();

    case 'class-to-functional':
      return `
// Converting class component to functional component with hooks:

${code.includes('componentDidMount') ? `
// Before: componentDidMount
// After: useEffect(() => { ... }, [])
` : ''}

${code.includes('this.state') ? `
// Before: this.state / this.setState
// After: useState hook
` : ''}

// Converted functional component:
import { useState, useEffect } from 'react';

export default function Component(props) {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // componentDidMount logic
  }, []);
  
  return <div>{/* JSX */}</div>;
}
      `.trim();

    case 'client-to-server':
      return `
// Converting Client Component to Server Component:

// Remove 'use client' directive
// Remove client-side hooks (useState, useEffect)
// Convert to async function if fetching data

export default async function Component(props) {
  // Can now fetch data directly
  const data = await fetch('...').then(r => r.json());
  
  return (
    <div>
      {/* Render with data */}
    </div>
  );
}

// If you need interactivity, create a separate Client Component:
// 'use client';
// export function InteractiveChild() {
//   const [state, setState] = useState();
//   return <button onClick={...}>...</button>;
// }
      `.trim();

    case 'prop-drilling-to-context':
      return `
// Refactored to use Context API:

// 1. Create context
'use client';
import { createContext, useContext, useState } from 'react';

const DataContext = createContext(undefined);

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  
  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}

// 2. Use in layout
// <DataProvider>
//   <YourComponents />
// </DataProvider>

// 3. Access in child components
// const { data, setData } = useData();
      `.trim();

    default:
      return `// Refactoring pattern '${pattern}' not supported`;
  }
}

// Helper function to check migration readiness
export function checkMigrationReadiness(code: string, filePath?: string) {
  const blockers = [];
  const warnings = [];
  const steps = [];

  // Check for Pages Router patterns
  if (/getServerSideProps|getStaticProps|getInitialProps/.test(code)) {
    warnings.push('Uses Pages Router data fetching methods');
    steps.push('Convert data fetching to Server Components or Server Actions');
  }

  if (/<Head>/.test(code)) {
    warnings.push('Uses Head component');
    steps.push('Replace with Metadata API');
  }

  if (/_app\.|_document\./.test(filePath || '')) {
    blockers.push('Special Pages Router files (_app, _document)');
    steps.push('Convert _app to layout.tsx and _document to root layout');
  }

  if (/useRouter\(\)\.push|useRouter\(\)\.replace/.test(code)) {
    warnings.push('Uses Pages Router useRouter');
    steps.push('Update to App Router useRouter from next/navigation');
  }

  const readiness = blockers.length === 0 ? 'Ready' : 'Has blockers';
  const confidence = getConfidenceLevel(blockers.length, warnings.length);

  return {
    readiness,
    confidence,
    blockers,
    warnings,
    migrationSteps: steps,
    estimatedEffort: getEstimatedEffort(blockers.length, warnings.length)
  };
}

// Helper function to find repeated code patterns
export function findRepeatedCode(code: string, filePath?: string, minOccurrences = 2, includeSmallPatterns = false) {
  const patterns: CodePattern[] = [];

  // Find repeated JSX blocks
  const jsxBlocks = findRepeatedJSXBlocks(code, minOccurrences, includeSmallPatterns);
  patterns.push(...jsxBlocks);

  // Find repeated logic patterns
  const logicPatterns = findRepeatedLogic(code, minOccurrences, includeSmallPatterns);
  patterns.push(...logicPatterns);

  // Find repeated styling patterns
  const stylingPatterns = findRepeatedStyling(code, minOccurrences);
  patterns.push(...stylingPatterns);

  // Find duplicate imports
  const duplicateImports = findDuplicateImports(code);
  patterns.push(...duplicateImports);

  // Calculate refactoring potential
  const totalRepeatedLines = patterns.reduce((sum, p) => sum + (p.lines.length * p.pattern.split('\n').length), 0);
  const refactoringPotential = getRefactoringPotentialFromLines(totalRepeatedLines);

  // Sort by impact (occurrences * pattern size)
  const sortedPatterns = [...patterns].sort((a: CodePattern, b: CodePattern) => {
    const impactA = a.occurrences * a.pattern.split('\n').length;
    const impactB = b.occurrences * b.pattern.split('\n').length;
    return impactB - impactA;
  });

  return {
    file: filePath || 'unknown',
    summary: {
      totalPatterns: patterns.length,
      totalRepeatedLines,
      refactoringPotential,
      estimatedSavings: `~${Math.round(totalRepeatedLines * 0.7)} lines`
    },
    patterns: sortedPatterns,
    recommendations: generateRefactoringRecommendations(patterns)
  };
}

