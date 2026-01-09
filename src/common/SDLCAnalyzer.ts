// SDLC - Software Development Life Cycle Analyzer

import { SDLCAnalysis } from "../types/schema.js";

export default class SDLCAnalyzer {
  analyze(files: string[]): SDLCAnalysis {
    const recommendations: string[] = [];

    const hasTests = files.some(f =>
      f.includes('.test.') || f.includes('__tests__')
    );
    const hasCI = files.some(f =>
      f.includes('.github/workflows')
    );
    const hasLint = files.includes('.eslintrc.json');
    const hasPrettier = files.includes('.prettierrc');

    if (!hasTests) recommendations.push('Add unit/integration tests');
    if (!hasCI) recommendations.push('Add CI pipeline (GitHub Actions)');
    if (!hasLint) recommendations.push('Enable ESLint for quality gates');

    const hasCoverage =
      files.some(f => f.includes('coverage')) ||
      files.some(f => f.includes('jest.config')) ||
      files.some(f => f.includes('vitest.config'));

    if (!hasCoverage) {
      recommendations.push('Add code coverage reporting (Jest/Vitest)');
    }

    return {
      testStrategy: hasTests ? 'good' : 'none',
      ciCd: hasCI ? 'basic' : 'missing',
      codeQualityGates: [
        hasLint ? 'ESLint' : '',
        hasPrettier ? 'Prettier' : ''
      ].filter(Boolean),
      documentation: files.some(f => f.toLowerCase().includes('readme'))
        ? 'average'
        : 'poor',
      overallMaturity:
        hasTests && hasCI ? 'high' : 'medium',
      recommendations
    };
  }
}
