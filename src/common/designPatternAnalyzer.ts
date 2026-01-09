import path from 'node:path';

export default class DesignPatternAnalyzer {
  analyze(codeByFile: Map<string, string>) {
    const patterns: any[] = [];
    const allCode = [...codeByFile.values()].join('\n');

    // Singleton
    if (/private\s+constructor|static\s+instance/.test(allCode)) {
      patterns.push({
        name: 'Singleton',
        confidence: 'high',
        evidence: ['Private constructor or static instance detected']
      });
    }

    // Factory
    if (/create[A-Z]\w+\(/.test(allCode)) {
      patterns.push({
        name: 'Factory',
        confidence: 'medium',
        evidence: ['createX() methods found']
      });
    }

    // Strategy (Custom Hooks)
    const hooks = [...codeByFile.keys()].filter(
      f => path.basename(f).startsWith('use') && f.endsWith('.ts')
    );

    if (hooks.length >= 3) {
      patterns.push({
        name: 'Strategy (via custom hooks)',
        confidence: 'high',
        evidence: hooks
      });
    }

    // Container / Presentational
    if (/useEffect.*fetch|axios|fetch/.test(allCode)) {
      patterns.push({
        name: 'Container / Presentational',
        confidence: 'medium',
        evidence: ['Data fetching separated from rendering components']
      });
    }

    // Higher-Order Component
    if (/\(\s*\w+\s*\)\s*=>\s*\(\s*props\s*\)\s*=>/.test(allCode)) {
      patterns.push({
        name: 'Higher-Order Component (HOC)',
        confidence: 'high',
        evidence: ['Function returning a component']
      });
    }

    // Render Props
    if (/{\s*\w+\s*=>\s*</.test(allCode)) {
      patterns.push({
        name: 'Render Props',
        confidence: 'medium',
        evidence: ['children as function detected']
      });
    }

    // Compound Component
    if (/\w+\.\w+\s*=\s*function|\w+\.\w+\s*=\s*\(/.test(allCode)) {
      patterns.push({
        name: 'Compound Component',
        confidence: 'high',
        evidence: ['Component.SubComponent assignment detected']
      });
    }

    // Controlled Component
    if (/value=\{.*\}\s+onChange=\{/.test(allCode)) {
      patterns.push({
        name: 'Controlled Component',
        confidence: 'high',
        evidence: ['value + onChange pair detected']
      });
    }

    // Observer (State Management)
    if (/useSelector|subscribe|useStore/.test(allCode)) {
      patterns.push({
        name: 'Observer',
        confidence: 'high',
        evidence: ['State subscription detected']
      });
    }


    // Next.js Patterns
    if (/^export\s+default\s+async\s+function/m.test(allCode)) {
      patterns.push({
        name: 'Server Component',
        confidence: 'high',
        evidence: ['Async server component detected']
      });
    }

    if (/'use client'/.test(allCode)) {
      patterns.push({
        name: 'Client Boundary',
        confidence: 'medium',
        evidence: ['use client directive detected']
      });
    }

    if (/\/app\/api|\/pages\/api/.test([...codeByFile.keys()].join('\n'))) {
      patterns.push({
        name: 'Backend-For-Frontend (BFF)',
        confidence: 'high',
        evidence: ['API routes detected']
      });
    }

    return {
      detectedPatterns: patterns
    };
  }
}
