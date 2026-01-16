import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AnalysisResult, Issue, Suggestion, BestPracticesConfig } from '../types/schema.js';
import { projectDetector, FrameworkType } from '../common/project-detector.js';
import { SecurityAnalyzer } from './securityAnalyzer.js';
import { AccessibilityAnalyzer } from './accessibilityAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CodeAnalyzer {
  private rules!: BestPracticesConfig;
  private bestPractices!: any[];
  private antiPatterns!: any[];
  private framework: FrameworkType = 'unknown';
  private readonly securityAnalyzer: SecurityAnalyzer;
  private readonly accessibilityAnalyzer: AccessibilityAnalyzer;

  constructor() {
    this.loadRules();
    this.securityAnalyzer = new SecurityAnalyzer();
    this.accessibilityAnalyzer = new AccessibilityAnalyzer();
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
    const config = JSON.parse(rulesContent);

    this.rules = config;
    this.bestPractices = config.bestPractices || [];
    this.antiPatterns = config.antiPatterns || [];
  }

  async analyzeCode(code: string, filePath: string): Promise<AnalysisResult> {
    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];

    // Detect framework for this specific file if needed
    const fileFramework = projectDetector.detectFrameworkForFile(filePath);
    if (fileFramework !== this.framework && fileFramework !== 'unknown') {
      this.loadRules(fileFramework);
    }

    // Check file type
    const isReactFile = /\.(tsx|jsx)$/.test(filePath);
    const isServerComponent = isReactFile && !code.includes("'use client'") && !code.includes('"use client"');

    // Run checks based on framework
    if (this.framework === 'nextjs') {
      this.checkNextJsPatterns(code, filePath, isReactFile, isServerComponent, issues, suggestions);
    } else {
      this.checkReactPatterns(code, filePath, isReactFile, issues, suggestions);
    }

    // Common checks for both frameworks
    const a11yResult = await this.accessibilityAnalyzer.analyzeCodeAccessibility(code, filePath);
    issues.push(...a11yResult.issues);
    this.checkPerformance(code, suggestions);
    this.checkAntiPatterns(code, issues, suggestions);

    // Calculate score
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 5));

    return {
      file: filePath,
      issues,
      suggestions,
      score,
      summary: this.generateSummary(issues, suggestions, score)
    };
  }

  private checkNextJsPatterns(code: string, filePath: string, isReactFile: boolean, isServerComponent: boolean, issues: Issue[], suggestions: Suggestion[]): void {
    this.checkClientDirective(code, isReactFile, issues);
    this.checkDataFetching(code, issues, suggestions);
    this.checkImageUsage(code, issues);
    this.checkFontUsage(code, issues);
    this.checkMetadata(code, filePath, issues);
    this.securityAnalyzer.analyzeCodeSecurity(code, filePath).then(securityResult => {
      securityResult.issues.forEach(issue => issues.push(issue));
    });
    this.checkAntiPatterns(code, issues, suggestions);
    
  }

  private checkReactPatterns(code: string, filePath: string, isReactFile: boolean, issues: Issue[], suggestions: Suggestion[]): void {
    if (!isReactFile) return;

    // Check for class components
    if (/class\s+\w+\s+extends\s+React\.Component/.test(code)) {
      issues.push({
        type: 'warning',
        category: 'best-practice',
        message: 'Using class component instead of functional component',
        fix: 'Convert to functional component with hooks'
      });
    }

    // Check for proper hook usage
    this.checkHookRules(code, issues);

    // Check for React-specific data fetching patterns
    this.checkReactDataFetching(code, issues, suggestions);

    // Check state management
    this.checkStateManagement(code, issues, suggestions);

    // Check for proper key usage
    this.checkKeyUsage(code, issues);

    // Check environment variables (React-specific)
    this.checkReactEnvVariables(code, issues);
  }

  private checkHookRules(code: string, issues: Issue[]): void {
    // Check if hooks are called at top level
    const hookCallPattern = /\b(use[A-Z]\w*)\s*\(/g;
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Check for hooks in conditionals or loops
      if (/\b(if|while|for)\s*\(/.test(line) && hookCallPattern.test(line)) {
        issues.push({
          type: 'error',
          category: 'hooks',
          message: 'Hook called conditionally or in a loop',
          fix: 'Call hooks only at the top level of your function',
          line: index + 1
        });
      }
    });

    // Check for missing cleanup in useEffect
    const useEffectPattern = /useEffect\s*\(\s*\(\s*\)\s*=>\s*{([^}]+)}/g;
    const matches = code.matchAll(useEffectPattern);

    for (const match of matches) {
      const effectBody = match[1];
      const hasSubscription = /addEventListener|setInterval|setTimeout|subscribe/.test(effectBody);
      const hasCleanup = /return\s+\(\s*\)\s*=>|return\s+function/.test(match[0]);

      if (hasSubscription && !hasCleanup) {
        issues.push({
          type: 'error',
          category: 'hooks',
          message: 'useEffect with subscription but no cleanup function',
          fix: 'Return a cleanup function to prevent memory leaks'
        });
      }
    }
  }

  private checkReactDataFetching(code: string, issues: Issue[], suggestions: Suggestion[]): void {
    // Check for fetch in useEffect without proper error handling
    if (/useEffect\([^)]*\bfetch\b/.test(code)) {
      const hasTryCatch = /try\s*{[^}]*catch/.test(code);
      const hasErrorState = /useState.*error/i.test(code);

      if (!hasTryCatch && !hasErrorState) {
        issues.push({
          type: 'warning',
          category: 'data-fetching',
          message: 'Data fetching in useEffect without error handling',
          fix: 'Add try-catch and error state, or use React Query/SWR'
        });
      }

      suggestions.push({
        category: 'best-practice',
        message: 'Consider using React Query or SWR for data fetching',
        impact: 'high',
        effort: 'medium',
        example: 'const { data, error } = useQuery("key", fetchFunction)'
      });
    }
  }

  private checkStateManagement(code: string, issues: Issue[], suggestions: Suggestion[]): void {
    // Check for prop drilling
    const propsCount = (code.match(/\bprops\./g) || []).length;
    if (propsCount > 10) {
      suggestions.push({
        category: 'architecture',
        message: 'Possible prop drilling detected',
        impact: 'medium',
        effort: 'medium',
        example: 'Consider using Context API or state management library'
      });
    }

    // Check for direct state mutation
    if (/\bstate\.\w+\s*=/.test(code) || /this\.state\.\w+\s*=/.test(code)) {
      issues.push({
        type: 'error',
        category: 'state',
        message: 'Direct state mutation detected',
        fix: 'Use setState or state setter functions'
      });
    }
  }

  private checkKeyUsage(code: string, issues: Issue[]): void {
    // Check for index as key
    if (/key=\{index\}|key=\{i\}/.test(code)) {
      issues.push({
        type: 'warning',
        category: 'best-practice',
        message: 'Using array index as key',
        fix: 'Use unique, stable identifiers as keys',
        code: 'key={index}'
      });
    }
  }

  private checkReactEnvVariables(code: string, issues: Issue[]): void {
    // Check for exposed secrets in React
    const envPattern = /process\.env\.([A-Z_]+)|import\.meta\.env\.([A-Z_]+)/g;
    const matches = code.matchAll(envPattern);

    for (const match of matches) {
      const varName = match[1] || match[2];
      if (!varName.startsWith('REACT_APP_') && !varName.startsWith('VITE_') &&
        /(API_KEY|SECRET|PASSWORD|TOKEN)/.test(varName)) {
        issues.push({
          type: 'error',
          category: 'security',
          message: `Secret environment variable ${varName} should not be exposed to client`,
          fix: 'Move secrets to backend API or use proper prefixes (REACT_APP_ or VITE_)',
          code: `process.env.${varName}`
        });
      }
    }
  }

  private checkClientDirective(code: string, isReactFile: boolean, issues: Issue[]): void {
    if (!isReactFile) return;

    const hasClientDirective = code.includes("'use client'") || code.includes('"use client"');
    const needsClientDirective = this.needsClientComponent(code);

    if (hasClientDirective && !needsClientDirective) {
      issues.push({
        type: 'warning',
        category: 'client-directive',
        message: "Component marked as 'use client' but doesn't seem to need it",
        fix: "Remove 'use client' directive and convert to Server Component if possible"
      });
    } else if (!hasClientDirective && needsClientDirective) {
      issues.push({
        type: 'error',
        category: 'client-directive',
        message: "Component uses client-side features but missing 'use client' directive",
        fix: "Add 'use client' at the top of the file"
      });
    }
  }

  private needsClientComponent(code: string): boolean {
    const clientIndicators = [
      /useState\(/,
      /useEffect\(/,
      /useReducer\(/,
      /useContext\(/,
      /onClick\s*=/,
      /onChange\s*=/,
      /onSubmit\s*=/,
      /addEventListener/,
      /window\./,
      /document\./,
      /localStorage/,
      /sessionStorage/
    ];

    return clientIndicators.some(pattern => pattern.test(code));
  }

  private checkDataFetching(code: string, issues: Issue[], suggestions: Suggestion[]): void {
    // Check for useEffect data fetching
    if (/useEffect\([^)]*\bfetch\b/.test(code)) {
      issues.push({
        type: 'warning',
        category: 'data-fetching',
        message: 'Data fetching in useEffect is an anti-pattern',
        fix: 'Use Server Components for data fetching or use SWR/React Query',
        code: 'useEffect(() => { fetch(...) }, [])'
      });
    }

    // Check for deprecated Next.js data fetching
    if (/getServerSideProps|getStaticProps|getInitialProps/.test(code)) {
      issues.push({
        type: 'error',
        category: 'data-fetching',
        message: 'Using deprecated Pages Router data fetching methods',
        fix: 'Migrate to App Router with Server Components or Server Actions'
      });
    }

    // Suggest parallel data fetching
    const fetchCount = (code.match(/\bfetch\(/g) || []).length;
    if (fetchCount > 2 && !code.includes('Promise.all')) {
      suggestions.push({
        category: 'performance',
        message: 'Multiple sequential fetch calls detected',
        impact: 'high',
        effort: 'low',
        example: 'Use Promise.all() to fetch data in parallel'
      });
    }
  }

  private checkImageUsage(code: string, issues: Issue[]): void {
    // Check for regular img tags
    if (/<img\s/.test(code) && !/<Image\s/.test(code)) {
      issues.push({
        type: 'error',
        category: 'performance',
        message: 'Using <img> instead of Next.js Image component',
        fix: "Import and use <Image> from 'next/image'",
        code: '<img src="..." />'
      });
    }

    // Check if Image is imported correctly
    if (/<Image\s/.test(code) && !/from ['"]next\/image['"]/.test(code)) {
      issues.push({
        type: 'error',
        category: 'import',
        message: 'Image component used but not imported from next/image',
        fix: "Add: import Image from 'next/image'"
      });
    }
  }

  private checkFontUsage(code: string, issues: Issue[]): void {
    // Check for font optimization
    if (/font-family|@font-face/.test(code) && !/from ['"]next\/font/.test(code)) {
      issues.push({
        type: 'warning',
        category: 'performance',
        message: 'Custom fonts should use next/font for optimization',
        fix: "Import fonts from 'next/font/google' or 'next/font/local'"
      });
    }
  }

  private checkMetadata(code: string, filePath: string, issues: Issue[]): void {
    const isLayoutOrPage = /\/(layout|page)\.(tsx|jsx)$/.test(filePath);

    if (isLayoutOrPage && /<Head>/.test(code)) {
      issues.push({
        type: 'error',
        category: 'seo',
        message: 'Using Head component in App Router',
        fix: 'Use Metadata API: export const metadata = { ... }'
      });
    }
  }

  private checkAntiPatterns(code: string, issues: Issue[], suggestions: Suggestion[]): void {
    // Check for prop drilling
    const propsCount = (code.match(/\bprops\./g) || []).length;
    if (propsCount > 10) {
      suggestions.push({
        category: 'architecture',
        message: 'Possible prop drilling detected',
        impact: 'medium',
        effort: 'medium',
        example: 'Consider using Context API, composition, or state management library'
      });
    }

    // Check for large client bundles
    if (code.includes("'use client'")) {
      const largeLibraries = ['moment', 'lodash', 'date-fns', 'axios'];
      for (const lib of largeLibraries) {
        if (new RegExp(`from ['"]${lib}['"]`).test(code)) {
          suggestions.push({
            category: 'performance',
            message: `Large library '${lib}' in client component`,
            impact: 'high',
            effort: 'medium',
            example: `Consider dynamic import or moving to Server Component`
          });
        }
      }
    }
  }


  private checkPerformance(code: string, suggestions: Suggestion[]): void {
    // Check for missing dynamic imports
    if (/import.*from ['"][^'"]+['"]/.test(code) && !code.includes('dynamic(')) {
      const hasHeavyComponent = /(Chart|Editor|Map|Video)/.test(code);
      if (hasHeavyComponent) {
        suggestions.push({
          category: 'performance',
          message: 'Consider dynamic import for heavy components',
          impact: 'medium',
          effort: 'low',
          example: "const Chart = dynamic(() => import('./Chart'), { ssr: false })"
        });
      }
    }
  }

  private generateSummary(issues: Issue[], suggestions: Suggestion[], score: number): string {
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const infoCount = issues.filter(i => i.type === 'info').length;

    const frameworkName = this.framework === 'nextjs' ? 'Next.js' : 'React';

    let summary = `Code quality score: ${score}/100\n`;
    summary += `Framework: ${frameworkName}\n`;
    summary += `Found ${errorCount} errors, ${warningCount} warnings, ${infoCount} info items\n`;
    summary += `${suggestions.length} optimization suggestions available\n`;

    if (score >= 90) {
      summary += `✅ Excellent! Code follows ${frameworkName} best practices`;
    } else if (score >= 70) {
      summary += '⚠️ Good, but there are some improvements to make';
    } else {
      summary += '❌ Needs attention - multiple best practice violations found';
    }

    return summary;
  }

  // Standalone file-level accessibility check API
  public async checkAccessibility(code: string, filePath: string) {
    const result = await this.accessibilityAnalyzer.analyzeCodeAccessibility(code, filePath);
    return {
      file: result.file,
      issues: result.issues,
      issueCount: result.totalViolations,
      summary: result.summary
    };
  }

  // Project-level accessibility scan API
  public async checkAccessibilityInProject() {
    const result = await this.accessibilityAnalyzer.analyzeProjectAccessibility();
    return {
      projectRoot: process.cwd(),
      totalFilesScanned: result.totalFilesScanned,
      filesWithIssues: result.filesWithIssues,
      results: result.results,
      summary: result.summary
    };
  }

   // Standalone file-level security check API using SecurityAnalyzer
  public async checkSecurity(code: string, filePath: string) {
    const result = await this.securityAnalyzer.analyzeCodeSecurity(code, filePath);
    return result;
  }

  // Project level security check using SecurityAnalyzer
  public async checkSecurityInProject() {
    const result = await this.securityAnalyzer.analyzeProjectSecurity();
    return result;
  }
}
