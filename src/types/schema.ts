export interface AnalysisResult {
  file: string;
  issues: Issue[];
  suggestions: Suggestion[];
  score: number;
  summary: string;
}

export interface Issue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  line?: number;
  column?: number;
  code?: string;
  fix?: string;
}

export interface Suggestion {
  category: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  example?: string;
}

export interface ReviewResult {
  file: string;
  codeQuality: QualityMetrics;
  architecture: ArchitectureAnalysis;
  bestPractices: BestPracticeCheck[];
  overallScore: number;
  
}

export interface QualityMetrics {
  maintainability: number;
  complexity: number;
  testability: number;
  readability: number;
}

export interface ArchitectureAnalysis {
  componentStructure: string;
  dataFlow: string;
  stateManagement: string;
  recommendations: string[];
}

export interface BestPracticeCheck {
  rule: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  fix?: string;
}

export interface OptimizationResult {
  file: string;
  optimizations: Optimization[];
  estimatedImpact: ImpactEstimate;
}

export interface Optimization {
  type: 'performance' | 'bundle-size' | 'seo' | 'accessibility';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  implementation: string;
  codeExample?: string;
}

export interface ImpactEstimate {
  performanceGain: string;
  bundleSizeReduction: string;
  userExperienceImprovement: string;
}

export interface BestPracticesConfig {
  appRouterOnly: boolean;
  noPagesRouter: boolean;
  preferServerComponents: boolean;
  useClientDirectiveOnlyWhenNeeded: boolean;
  dataFetching: {
    prefer: string[];
    avoid: string[];
  };
  performance: {
    useDynamicImport: boolean;
    avoidUseEffectForData: boolean;
    imageOptimization: boolean;
    fontOptimization: boolean;
  };
  security: {
    noEnvLeakage: boolean;
    serverActionsValidation: boolean;
    csrfProtection: boolean;
  };
  seo: {
    metadataAPI: boolean;
    structuredData: boolean;
    sitemap: boolean;
  };
  accessibility: {
    semanticHTML: boolean;
    ariaLabels: boolean;
    keyboardNavigation: boolean;
  };
}

export interface ProjectArchitectureAnalysis {
  architectureStyle: string[];
  layering: string;
  stateManagement: string[];
  dataFlow: string;
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

export interface DesignPatternAnalysis {
  detectedPatterns: {
    name: string;
    confidence: 'high' | 'medium' | 'low';
    evidence: string[];
  }[];
}

export interface SDLCAnalysis {
  testStrategy: 'none' | 'basic' | 'good' | 'excellent';
  ciCd: 'missing' | 'basic' | 'mature';
  codeQualityGates: string[];
  documentation: 'poor' | 'average' | 'good';
  overallMaturity: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Security-related types
export interface SecurityRule {
  id: string;
  title: string;
  intent: string;
  scope: 'code' | 'component' | 'function' | 'config' | 'project';
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  detection?: {
    patterns?: string[];
    fileGlobs?: string[];
    fileExtensions?: string[];
    requirePatterns?: string[];
    requireAbsence?: string[];
    excludePatterns?: string[];
    checkPatterns?: string[];
    astHints?: string[];
  };
  recommendation: string;
  references?: string[];
  codeExample?: {
    bad: string;
    good: string;
  };
}

export interface SecurityConfig {
  meta: {
    framework: 'React' | 'Next.js';
    version: string;
    type: 'security';
    intendedFor: string[];
  };
  securityRules: SecurityRule[];
}

export interface SecurityCheckResult {
  file: string;
  framework: string;
  issues: Issue[];
  ruleResults: Array<{
    rule: SecurityRule;
    violations: Array<{
      line?: number;
      column?: number;
      message: string;
      code: string;
    }>;
  }>;
  securityScore: number;
  totalViolations: number;
  summary: string;
}

// Accessibility-related types
export interface AccessibilityRule {
  id: string;
  title: string;
  intent: string;
  scope: 'code' | 'component' | 'function' | 'config' | 'project';
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  wcag?: string;
  standard?: string;
  detection?: {
    patterns?: string[];
    fileGlobs?: string[];
    fileExtensions?: string[];
    requirePatterns?: string[];
    requireAbsence?: string[];
    excludePatterns?: string[];
    checkPatterns?: string[];
    astHints?: string[];
  };
  recommendation: string;
  references?: string[];
  examples?: {
    bad: string[];
    good: string[];
  };
  exampleCodeSnippets?: {
    bad: string;
    good: string;
  };
  confidence?: 'high' | 'medium' | 'low';
  falsePositives?: 'low' | 'medium' | 'high';
  performanceImpact?: 'low' | 'medium' | 'high';
  detectionComplexity?: 'low' | 'medium' | 'high';
  easeOfRemediation?: 'high' | 'medium' | 'low';
  remediationExplanation?: string;
  relatedRules?: string[];
  examplesOfExploits?: string[];
  owasp?: string;
}

export interface AccessibilityConfig {
  meta: {
    framework: 'React' | 'React-Next' | 'Next.js';
    version: string;
    type: 'accessibility';
    intendedFor: string[];
    standard: string;
  };
  accessibilityRules: AccessibilityRule[];
}

export type McpUsage = {
  input_tokens: number
  output_tokens: number
  total_tokens: number
  premium_hits_used: number
  cost_tier: 'free' | 'standard' | 'high'
}