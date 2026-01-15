import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Issue, SecurityConfig, SecurityRule, SecurityCheckResult } from '../types/schema.js';
import { projectDetector, FrameworkType } from '../common/project-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RuleCheckResult {
  rule: SecurityRule;
  violations: Array<{
    line?: number;
    column?: number;
    message: string;
    code: string;
  }>;
}

export class SecurityAnalyzer {
  private securityRules!: SecurityConfig;
  private rules: SecurityRule[] = [];
  private framework: FrameworkType = 'unknown';

  constructor() {
    this.loadSecurityRules();
  }

  private loadSecurityRules(framework?: FrameworkType): void {
    // Detect framework if not provided
    if (!framework) {
      const projectInfo = projectDetector.detectFramework();
      framework = projectInfo.framework;
    }

    this.framework = framework;

    // Load appropriate security rules based on framework
    const rulesFileName = framework === 'react' ? 'react-llm-security-rules.json' : 'nextjs-llm-security-rules.json';
    const rulesPath = path.join(__dirname, '../config', rulesFileName);
    
    if (!fs.existsSync(rulesPath)) {
      console.warn(`Security rules file not found: ${rulesPath}`);
      this.rules = [];
      return;
    }

    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
    const config = JSON.parse(rulesContent);

    this.securityRules = config;
    this.rules = config.securityRules || [];
  }

  /**
   * Analyze code for security issues based on configured rules
   */
  async analyzeCodeSecurity(code: string, filePath: string): Promise<SecurityCheckResult> {
    const fileFramework = projectDetector.detectFrameworkForFile(filePath);
    if (fileFramework !== this.framework && fileFramework !== 'unknown') {
      this.loadSecurityRules(fileFramework);
    }

    const issues: Issue[] = [];
    const ruleResults: RuleCheckResult[] = [];

    // Run all enabled security rules
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const violations = this.checkRule(code, filePath, rule);
      ruleResults.push({ rule, violations });

      // Convert violations to issues
      for (const violation of violations) {
        issues.push({
          type: rule.severity === 'critical' ? 'error' : rule.severity === 'high' ? 'warning' : 'info',
          category: 'security',
          message: `[${rule.id}] ${rule.title}: ${violation.message}`,
          line: violation.line,
          column: violation.column,
          code: rule.id,
          fix: rule.recommendation
        });
      }
    }

    // Calculate security score
    const criticalCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const securityScore = Math.max(0, 100 - (criticalCount * 20) - (warningCount * 10));

    return {
      file: filePath,
      framework: this.framework,
      issues,
      ruleResults,
      securityScore,
      totalViolations: issues.length,
      summary: this.generateSecuritySummary(issues, securityScore)
    };
  }

  /**
   * Check a single rule against the code
   */
  private checkRule(code: string, filePath: string, rule: SecurityRule): Array<{ line?: number; column?: number; message: string; code: string }> {
    const violations: Array<{ line?: number; column?: number; message: string; code: string }> = [];

    // Check file scope rules
    if (rule.scope === 'config') {
      const { fileGlobs = [] } = rule.detection || {};
      const shouldCheck = fileGlobs.some(glob => this.matchesGlob(filePath, glob));
      if (!shouldCheck && fileGlobs.length > 0) return violations;
    }

    // Get detection patterns
    const detection = rule.detection || {};
    const patterns = detection.patterns || [];
    const requirePatterns = detection.requirePatterns || [];
    const requireAbsence = detection.requireAbsence || [];
    const excludePatterns = detection.excludePatterns || [];

    // Check exclusion patterns
    const isExcluded = excludePatterns.some(pattern => {
      const regex = new RegExp(pattern);
      return regex.test(code);
    });

    if (isExcluded) return violations;

    // Check main patterns
    for (const patternStr of patterns) {
      try {
        const regex = new RegExp(patternStr, 'gm');
        let match;

        while ((match = regex.exec(code)) !== null) {
          // If requirePatterns exist, check if any are present in the context
          if (requirePatterns.length > 0) {
            const hasRequired = requirePatterns.some(reqPattern => {
              const reqRegex = new RegExp(reqPattern);
              return reqRegex.test(code);
            });

            if (!hasRequired) continue;
          }

          // Check requireAbsence patterns
          if (requireAbsence.length > 0) {
            const hasAbsence = requireAbsence.some(absPattern => {
              const absRegex = new RegExp(absPattern);
              return absRegex.test(code);
            });

            if (hasAbsence) continue;
          }

          const line = code.substring(0, match.index).split('\n').length;
          violations.push({
            line,
            message: rule.title,
            code: rule.id
          });
        }
      } catch (error) {
        console.warn(`Invalid regex pattern in rule ${rule.id}: ${patternStr}`);
      }
    }

    return violations;
  }

  /**
   * Analyze entire project for security issues
   */
  async analyzeProjectSecurity(): Promise<{
    totalFilesScanned: number;
    filesWithIssues: number;
    totalViolations: number;
    criticalViolations: number;
    highViolations: number;
    results: SecurityCheckResult[];
    summary: string;
  }> {
    const projectRoot = process.cwd();
    const files: string[] = [];

    const scan = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (!['node_modules', '.git', 'build', 'dist', '.next', '.env.local'].includes(entry.name)) {
              scan(fullPath);
            }
          } else if (entry.isFile()) {
            if (/\.(tsx|jsx|ts|js)$/.test(entry.name) && !/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(entry.name)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to scan directory: ${dir}`);
      }
    };

    scan(projectRoot);

    const results: SecurityCheckResult[] = [];
    let totalViolations = 0;
    let criticalViolations = 0;
    let highViolations = 0;

    for (const filePath of files) {
      try {
        const code = fs.readFileSync(filePath, 'utf-8');
        const result = await this.analyzeCodeSecurity(code, filePath);
        
        if (result.issues.length > 0) {
          results.push(result);
          totalViolations += result.issues.length;
          criticalViolations += result.issues.filter(i => i.type === 'error').length;
          highViolations += result.issues.filter(i => i.type === 'warning').length;
        }
      } catch (error) {
        console.warn(`Failed to analyze file: ${filePath}`);
      }
    }

    return {
      totalFilesScanned: files.length,
      filesWithIssues: results.length,
      totalViolations,
      criticalViolations,
      highViolations,
      results: results.slice(0, 50), // Limit results
      summary: `Found ${totalViolations} security violation(s) across ${results.length} file(s). Critical: ${criticalViolations}, High: ${highViolations}`
    };
  }

  /**
   * Get enabled security rules for the current framework
   */
  getEnabledRules(): SecurityRule[] {
    return this.rules.filter(rule => rule.enabled);
  }

  /**
   * Get security rules configuration
   */
  getRulesConfig(): SecurityConfig {
    return this.securityRules;
  }

  /**
   * Update a rule's enabled status
   */
  updateRuleStatus(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Generate security summary
   */
  private generateSecuritySummary(issues: Issue[], score: number): string {
    const critical = issues.filter(i => i.type === 'error').length;
    const warnings = issues.filter(i => i.type === 'warning').length;
    const info = issues.filter(i => i.type === 'info').length;

    if (issues.length === 0) {
      return `✓ No security issues found (Score: ${score}/100)`;
    }

    return `⚠ Security issues found: ${critical} critical, ${warnings} warnings, ${info} info (Score: ${score}/100)`;
  }

  /**
   * Match glob pattern against file path
   */
  private matchesGlob(filePath: string, glob: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const normalizedGlob = glob.replace(/\\/g, '/');

    // Simple glob matching
    if (normalizedGlob.includes('**')) {
      const pattern = normalizedGlob
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*');
      return new RegExp(`^${pattern}$`).test(normalizedPath);
    }

    return normalizedPath.includes(normalizedGlob);
  }
}
