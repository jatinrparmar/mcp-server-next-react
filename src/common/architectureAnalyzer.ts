import { ArchitectureAnalysis } from "../types/schema.js";

export default class ArchitectureAnalyzer {
  analyzeNextArchitecture(codeFiles: Map<string, string>, files: string[]): ArchitectureAnalysis {
    const architectureStyle: string[] = [];
    const recommendations: string[] = [];

    const hasAppRouter = files.some(f => f.includes('/app/'));
    const hasPagesRouter = files.some(f => f.includes('/pages/'));
    const hasApiRoutes = files.some(f => f.includes('/api/'));

    if (hasAppRouter) architectureStyle.push('Next.js App Router');
    if (hasPagesRouter) architectureStyle.push('Pages Router (Legacy)');
    if (hasApiRoutes) architectureStyle.push('Backend-for-Frontend (BFF)');

    if (hasAppRouter && hasPagesRouter) {
      recommendations.push(
        'Mixed App Router and Pages Router detected. Consider completing migration to App Router.'
      );
    }

    const hasServices = files.some(f => f.includes('/services/'));

    if (!hasServices) {
      recommendations.push(
        'Introduce service layer to separate business logic from UI'
      );
    }

    return {
      componentStructure: architectureStyle.join(', '),
      dataFlow: 'Unidirectional (React)',
      stateManagement: this.detectState(codeFiles).join(', ') || 'None',
      recommendations
    };
  }

  analyzeReactArchitecture(
    codeFiles: Map<string, string>,
    files: string[]
  ): ArchitectureAnalysis {
    let componentStructure = 'Flat Component Structure';
    let dataFlow = 'Unidirectional (Props)';
    const stateTypes: string[] = [];
    const recommendations: string[] = [];

    // Analyze all files
    const allCode = Array.from(codeFiles.values()).join('\n');

    // Check for component types
    files.forEach(filePath => {
      if (/\.(tsx|jsx)$/.test(filePath)) {
        if (files.some(f => f.includes('/features/'))) {
          componentStructure = 'Feature-based Architecture';
        } else if (files.some(f => f.includes('/components/') && f.includes('/pages/'))) {
          componentStructure = 'Layered (pages / components)';
        }
      }
    });

    // Check data fetching patterns
    if (/useEffect.*fetch|axios|fetch/.test(allCode)) {
      dataFlow = 'Client-side data fetching';
    }

    // Check state management
    if (/useContext/.test(allCode)) {
      stateTypes.push('Context API');
    }

    if (/redux|zustand|recoil|mobx/.test(allCode)) {
      stateTypes.push('External State Management');
    }

    if (/useState/.test(allCode)) {
      stateTypes.push('Local State (useState)');
    }

    // Check for logic and UI mixing
    const hasLogicAndUI =
      /useEffect|function\s+\w+/.test(allCode) && /return\s*\(/.test(allCode);

    if (hasLogicAndUI) {
      recommendations.push(
        'Consider extracting business logic into hooks or services'
      );
    }

    // Error boundaries
    if (!/componentDidCatch|ErrorBoundary/.test(allCode)) {
      recommendations.push('Add Error Boundaries for resilience');
    }

    return {
      componentStructure: componentStructure ?? 'Unknown',
      dataFlow,
      stateManagement: stateTypes.length > 0 ? stateTypes.join(', ') : 'None',
      recommendations
    };
  }

  analyzeGenericArchitecture(
    codeFiles: Map<string, string>,
    files: string[]
  ): ArchitectureAnalysis {
    return {
      componentStructure: 'Unknown',
      dataFlow: 'Unknown',
      stateManagement: 'Unknown',
      recommendations: ['Consider adopting a modern framework like Next.js or React for better architecture']
    };
  }


  private detectState(codeFiles: Map<string, string>): string[] {
    const code = Array.from(codeFiles.values()).join('\n');
    const state: string[] = [];

    if (/redux|zustand|recoil|mobx/.test(code)) {
      state.push('Global State');
    }
    if (/useContext/.test(code)) {
      state.push('Context API');
    }
    if (/useState|useReducer/.test(code)) {
      state.push('Local State');
    }

    return state;
  }
}
