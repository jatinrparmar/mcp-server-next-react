import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ReviewResult, QualityMetrics, ArchitectureAnalysis, BestPracticeCheck } from '../types/schema.js';
import { projectDetector, FrameworkType } from '../common/project-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CodeReviewer {
  private rules!: any;
  private framework: FrameworkType = 'unknown';

  constructor() {
    this.loadRules();
  }

  private loadRules(framework?: FrameworkType): void {
    // Detect framework if not provided
    if (!framework) {
      const projectInfo = projectDetector.detectFramework();
      framework = projectInfo.framework;
    }
    
    this.framework = framework;
    
    // Load appropriate rules based on framework
    const rulesFileName = framework === 'react' ? 'react-llm-best-practices.json' : 'nextjs-llm-best-practices.json';
    const rulesPath = path.join(__dirname, '../config', rulesFileName);
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
    this.rules = JSON.parse(rulesContent);
  }

  async reviewCode(code: string, filePath: string): Promise<ReviewResult> {
    // Detect framework for this specific file if needed
    const fileFramework = projectDetector.detectFrameworkForFile(filePath);
    if (fileFramework !== this.framework && fileFramework !== 'unknown') {
      this.loadRules(fileFramework);
    }

    const codeQuality = this.assessQuality(code);
    const architecture = this.analyzeArchitecture(code, filePath);
    const bestPractices = this.checkBestPractices(code, filePath);
    
    const overallScore = this.calculateOverallScore(codeQuality, bestPractices);

    return {
      file: filePath,
      codeQuality,
      architecture,
      bestPractices,
      overallScore
    };
  }

  private assessQuality(code: string): QualityMetrics {
    return {
      maintainability: this.calculateMaintainability(code),
      complexity: this.calculateComplexity(code),
      testability: this.calculateTestability(code),
      readability: this.calculateReadability(code)
    };
  }

  private calculateMaintainability(code: string): number {
    let score = 100;
    
    // Check file length
    const lines = code.split('\n').length;
    if (lines > 300) score -= 20;
    else if (lines > 200) score -= 10;

    // Check function length
    const functionMatches = code.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g);
    if (functionMatches) {
      const avgFunctionLength = code.length / functionMatches.length;
      if (avgFunctionLength > 500) score -= 15;
    }

    // Check for comments
    const commentLines = (code.match(/\/\/|\/\*|\*\//g) || []).length;
    const commentRatio = commentLines / lines;
    if (commentRatio < 0.05) score -= 10;

    // Check for magic numbers
    const magicNumbers = (code.match(/[^a-zA-Z_]\d{2,}[^a-zA-Z_]/g) || []).length;
    if (magicNumbers > 5) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateComplexity(code: string): number {
    let complexity = 0;
    
    // Count cyclomatic complexity indicators
    const indicators = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\&\&/g,
      /\|\|/g,
      /\?/g
    ];

    indicators.forEach(pattern => {
      const matches = code.match(pattern);
      complexity += matches ? matches.length : 0;
    });

    // Normalize to 0-100 scale (lower is better)
    const normalizedComplexity = Math.min(100, complexity * 2);
    return 100 - normalizedComplexity;
  }

  private calculateTestability(code: string): number {
    let score = 100;

    // Check for pure functions
    const hasSideEffects = /useState|useEffect|useReducer|localStorage|fetch|axios/.test(code);
    if (hasSideEffects) score -= 20;

    // Check for dependency injection
    const hasHardcodedDeps = /new\s+\w+\(/.test(code);
    if (hasHardcodedDeps) score -= 15;

    // Check for testable structure
    const hasExports = /export\s+(const|function|class)/.test(code);
    if (!hasExports) score -= 20;

    // Check for separation of concerns
    const hasBusinessLogic = /\bfunction\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/.test(code);
    const hasUI = /<[A-Z]/.test(code);
    if (hasBusinessLogic && hasUI) {
      // Good - separating logic from UI
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateReadability(code: string): number {
    let score = 100;

    // Check variable naming
    const variableNames = code.match(/\b(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
    const shortNames = variableNames.filter(v => {
      const name = v.split(/\s+/).pop() || '';
      return name.length < 3 && !['i', 'j', 'k', 'id'].includes(name);
    });
    if (shortNames.length > 5) score -= 15;

    // Check line length
    const longLines = code.split('\n').filter(line => line.length > 120).length;
    if (longLines > 10) score -= 10;

    // Check nesting depth
    const maxNesting = this.calculateMaxNesting(code);
    if (maxNesting > 4) score -= 20;
    else if (maxNesting > 3) score -= 10;

    // Check for consistent formatting
    const hasInconsistentIndentation = this.hasInconsistentIndentation(code);
    if (hasInconsistentIndentation) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  private calculateMaxNesting(code: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of code) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }

    return maxDepth;
  }

  private hasInconsistentIndentation(code: string): boolean {
    const lines = code.split('\n');
    const indentations = new Set<number>();

    for (const line of lines) {
      const match = line.match(/^(\s+)/);
      if (match) {
        const spaces = match[1].length;
        if (spaces % 2 !== 0 && spaces % 4 !== 0) {
          return true;
        }
        indentations.add(spaces);
      }
    }

    return false;
  }

  private analyzeArchitecture(code: string, filePath: string): ArchitectureAnalysis {
    const isComponent = /\.(tsx|jsx)$/.test(filePath);
    const isServerComponent = isComponent && !code.includes("'use client'");
    const isClientComponent = isComponent && code.includes("'use client'");

    let componentStructure = 'Unknown';
    let dataFlow = 'Unknown';
    let stateManagement = 'None';
    const recommendations: string[] = [];

    if (isServerComponent) {
      componentStructure = 'Server Component (Recommended)';
      dataFlow = 'Server-side data fetching';
    } else if (isClientComponent) {
      componentStructure = 'Client Component';
      dataFlow = 'Client-side rendering';
      
      // Check if it really needs to be a client component
      const hasInteractivity = /onClick|onChange|onSubmit|useState|useEffect/.test(code);
      if (!hasInteractivity) {
        recommendations.push('Consider converting to Server Component - no interactivity detected');
      }
    }

    // Analyze state management
    if (/useState/.test(code)) {
      stateManagement = 'Local state (useState)';
    }
    if (/useReducer/.test(code)) {
      stateManagement = 'Local state (useReducer)';
    }
    if (/useContext/.test(code)) {
      stateManagement = 'Context API';
    }
    if (/zustand|jotai|recoil/.test(code)) {
      stateManagement = 'External state library';
    }

    // Check for data fetching patterns
    if (/useEffect.*fetch/.test(code)) {
      recommendations.push('Avoid data fetching in useEffect - use Server Components or SWR/React Query');
    }

    // Check for proper component composition
    if (isComponent) {
      const componentCount = (code.match(/function\s+[A-Z]\w+|const\s+[A-Z]\w+\s*=/g) || []).length;
      if (componentCount > 1) {
        recommendations.push('Multiple components in one file - consider splitting into separate files');
      }
    }

    // Check for proper error handling
    if (!/<ErrorBoundary|error\.tsx/.test(code) && isComponent) {
      recommendations.push('Add error boundaries for better error handling');
    }

    return {
      componentStructure,
      dataFlow,
      stateManagement,
      recommendations
    };
  }

  private checkBestPractices(code: string, filePath: string): BestPracticeCheck[] {
    const checks: BestPracticeCheck[] = [];

    // Check each best practice from rules
    if (this.rules.bestPractices) {
      for (const practice of this.rules.bestPractices) {
        const check = this.checkSpecificPractice(practice, code, filePath);
        checks.push(check);
      }
    }

    return checks;
  }

  private checkSpecificPractice(practice: any, code: string, filePath: string): BestPracticeCheck {
    const rule = practice.rule;
    
    switch (rule) {
      case 'use-server-components-by-default':
        const isReactFile = /\.(tsx|jsx)$/.test(filePath);
        const hasClientDirective = code.includes("'use client'");
        return {
          rule: practice.rule,
          status: isReactFile && !hasClientDirective ? 'pass' : 'warning',
          message: practice.description
        };

      case 'client-directive-explicit':
        const needsClient = /useState|useEffect|onClick|onChange/.test(code);
        const hasClient = code.includes("'use client'");
        return {
          rule: practice.rule,
          status: needsClient === hasClient ? 'pass' : 'fail',
          message: practice.description,
          fix: needsClient && !hasClient ? "Add 'use client' directive" : undefined
        };

      case 'next-image-required':
        const hasImgTag = /<img\s/.test(code);
        return {
          rule: practice.rule,
          status: hasImgTag ? 'fail' : 'pass',
          message: practice.description,
          fix: hasImgTag ? "Replace <img> with <Image> from 'next/image'" : undefined
        };

      case 'metadata-api':
        const hasHead = /<Head>/.test(code);
        const isLayoutPage = /\/(layout|page)\.(tsx|jsx)$/.test(filePath);
        return {
          rule: practice.rule,
          status: hasHead && isLayoutPage ? 'fail' : 'pass',
          message: practice.description,
          fix: hasHead ? 'Use Metadata API instead of Head component' : undefined
        };

      case 'server-actions-validation':
        const hasServerAction = code.includes("'use server'");
        const hasValidation = /zod|yup|joi/.test(code);
        return {
          rule: practice.rule,
          status: hasServerAction && !hasValidation ? 'fail' : 'pass',
          message: practice.description,
          fix: 'Add Zod validation to server actions'
        };

      default:
        return {
          rule: practice.rule,
          status: 'warning',
          message: practice.description
        };
    }
  }

  private calculateOverallScore(quality: QualityMetrics, practices: BestPracticeCheck[]): number {
    const qualityAvg = (quality.maintainability + quality.complexity + quality.testability + quality.readability) / 4;
    
    const passedPractices = practices.filter(p => p.status === 'pass').length;
    const practicesScore = (passedPractices / practices.length) * 100;

    return Math.round((qualityAvg * 0.6) + (practicesScore * 0.4));
  }
}
