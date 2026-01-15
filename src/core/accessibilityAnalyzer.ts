import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Issue, AccessibilityConfig, AccessibilityRule } from '../types/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AccessibilityCheckResult {
  file: string;
  issues: Issue[];
  totalViolations: number;
  summary: string;
}

export interface RuleCheckResult {
  rule: AccessibilityRule;
  violations: Array<{
    line?: number;
    column?: number;
    message: string;
    code: string;
  }>;
}

export class AccessibilityAnalyzer {
  private accessibilityRules!: AccessibilityConfig;
  private rules: AccessibilityRule[] = [];

  constructor() {
    this.loadAccessibilityRules();
  }

  private loadAccessibilityRules(): void {
    // Load accessibility rules - same for both React and Next.js
    const rulesPath = path.join(__dirname, '../config', 'react-next-llm-accessibility-rules.json');

    if (!fs.existsSync(rulesPath)) {
      console.warn(`Accessibility rules file not found: ${rulesPath}`);
      this.rules = [];
      return;
    }

    try {
      const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
      const config = JSON.parse(rulesContent);

      this.accessibilityRules = config;
      this.rules = config.accessibilityRules || [];
    } catch (error) {
      console.warn(`Failed to load accessibility rules: ${error}`);
      this.rules = [];
    }
  }

  /**
   * Analyze code for accessibility issues based on configured rules
   */
  async analyzeCodeAccessibility(code: string, filePath: string): Promise<AccessibilityCheckResult> {
    const issues: Issue[] = [];
    const ruleResults: RuleCheckResult[] = [];

    // Run all enabled accessibility rules
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const violations = this.checkRule(code, filePath, rule);
      ruleResults.push({ rule, violations });

      // Convert violations to issues
      for (const violation of violations) {
        issues.push({
          type: rule.severity === 'critical' ? 'error' : rule.severity === 'high' ? 'warning' : 'info',
          category: 'accessibility',
          message: `[${rule.id}] ${rule.title}: ${violation.message}`,
          line: violation.line,
          column: violation.column,
          code: rule.id,
          fix: rule.recommendation
        });
      }
    }

    return {
      file: filePath,
      issues,
      totalViolations: issues.length,
      summary: this.generateAccessibilitySummary(issues, ruleResults)
    };
  }

  /**
   * Check a single rule against the code
   */
  private checkRule(code: string, filePath: string, rule: AccessibilityRule): Array<{ line?: number; column?: number; message: string; code: string }> {
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
      try {
        const regex = new RegExp(pattern);
        return regex.test(code);
      } catch {
        return false;
      }
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
              try {
                const reqRegex = new RegExp(reqPattern);
                return reqRegex.test(code);
              } catch {
                return false;
              }
            });

            if (!hasRequired) continue;
          }

          // Check requireAbsence patterns
          if (requireAbsence.length > 0) {
            const hasAbsence = requireAbsence.some(absPattern => {
              try {
                const absRegex = new RegExp(absPattern);
                return absRegex.test(code);
              } catch {
                return false;
              }
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
   * Analyze entire project for accessibility issues
   */
  async analyzeProjectAccessibility(): Promise<{
    totalFilesScanned: number;
    filesWithIssues: number;
    totalViolations: number;
    results: AccessibilityCheckResult[];
    summary: string;
  }> {
    const projectRoot = process.cwd();
    const files: string[] = [];

    const scan = (dir: string) => {

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
    };

    scan(projectRoot);

    const results: AccessibilityCheckResult[] = [];
    let totalViolations = 0;

    for (const filePath of files) {
        const code = fs.readFileSync(filePath, 'utf-8');
        const result = await this.analyzeCodeAccessibility(code, filePath);

        if (result.issues.length > 0) {
          results.push(result);
          totalViolations += result.issues.length;
        }
    }

    return {
      totalFilesScanned: files.length,
      filesWithIssues: results.length,
      totalViolations,
      results: results.slice(0, 50),
      summary: `Found ${totalViolations} accessibility issue(s) across ${results.length} file(s)`
    };
  }

  /**
   * Get enabled accessibility rules
   */
  getEnabledRules(): AccessibilityRule[] {
    return this.rules.filter(rule => rule.enabled);
  }

  /**
   * Get accessibility rules configuration
   */
  getRulesConfig(): AccessibilityConfig {
    return this.accessibilityRules;
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
   * Generate accessibility summary
   */
  private generateAccessibilitySummary(issues: Issue[], ruleResults: RuleCheckResult[]): string {
    const critical = issues.filter(i => i.type === 'error').length;
    const warnings = issues.filter(i => i.type === 'warning').length;
    const info = issues.filter(i => i.type === 'info').length;
    const totalRules = this.rules.filter(r => r.enabled).length;
    const triggeredRules = ruleResults.filter(r => r.violations.length > 0).length;

    if (issues.length === 0) {
      return `✓ No accessibility issues found (${totalRules} rules checked)`;
    }

    return `⚠ Accessibility issues found: ${critical} critical, ${warnings} warnings, ${info} info (${triggeredRules}/${totalRules} rules triggered)`;
  }

  /**
   * Match glob pattern against file path
   */
  private matchesGlob(filePath: string, glob: string): boolean {
    const normalizedPath = filePath.replaceAll(/\\/g, '/');
    const normalizedGlob = glob.replaceAll(/\\/g, '/');

    // Simple glob matching
    if (normalizedGlob.includes('**')) {
      const pattern = normalizedGlob
        .replaceAll(/[.+^${}()|[\]\\]/g, '\\$&')
        .replaceAll(/\*\*/g, '.*')
        .replaceAll(/\*/g, '[^/]*');
      return new RegExp(`^${pattern}$`).test(normalizedPath);
    }

    return normalizedPath.includes(normalizedGlob);
  }
}
