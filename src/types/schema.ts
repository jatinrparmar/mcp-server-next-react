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
