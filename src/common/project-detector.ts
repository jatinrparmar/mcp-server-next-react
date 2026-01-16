import * as fs from 'node:fs';
import * as path from 'node:path';

export type FrameworkType = 'nextjs' | 'react' | 'unknown';

export interface ProjectInfo {
  framework: FrameworkType;
  hasAppRouter: boolean;
  hasPagesRouter: boolean;
  reactVersion?: string;
  nextVersion?: string;
  bundler?: 'vite' | 'webpack' | 'cra' | 'other';
  usesTypeScript: boolean;
}

export class ProjectDetector {
  private static instance: ProjectDetector;
  private cachedProjectInfo: ProjectInfo | null = null;

  private constructor() {}

  public static getInstance(): ProjectDetector {
    if (!ProjectDetector.instance) {
      ProjectDetector.instance = new ProjectDetector();
    }
    return ProjectDetector.instance;
  }

  /**
   * Detect the framework type (React or Next.js) by analyzing the project
   */
  public detectFramework(projectRoot?: string): ProjectInfo {
    // Return cached result if available
    if (this.cachedProjectInfo) {
      return this.cachedProjectInfo;
    }

    const root = projectRoot || process.cwd();
    
    const packageJsonPath = path.join(root, 'package.json');
    let framework: FrameworkType = 'unknown';
    let hasAppRouter = false;
    let hasPagesRouter = false;
    let reactVersion: string | undefined;
    let nextVersion: string | undefined;
    let bundler: 'vite' | 'webpack' | 'cra' | 'other' = 'other';
    let usesTypeScript = false;

    // Check package.json
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        // Detect framework
        if (dependencies['next']) {
          framework = 'nextjs';
          nextVersion = dependencies['next'];
        } else if (dependencies['react']) {
          framework = 'react';
        }

        reactVersion = dependencies['react'];

        // Detect bundler
        if (dependencies['vite']) {
          bundler = 'vite';
        } else if (dependencies['react-scripts']) {
          bundler = 'cra';
        } else if (dependencies['webpack']) {
          bundler = 'webpack';
        }

        // Check for TypeScript
        usesTypeScript = !!(
          dependencies['typescript'] || 
          fs.existsSync(path.join(root, 'tsconfig.json'))
        );
      } catch (error) {
        console.error('Error reading package.json:', error);
      }
    }

    // For Next.js, check routing structure
    if (framework === 'nextjs') {
      const appDir = path.join(root, 'app');
      const srcAppDir = path.join(root, 'src', 'app');
      const pagesDir = path.join(root, 'pages');
      const srcPagesDir = path.join(root, 'src', 'pages');

      hasAppRouter = fs.existsSync(appDir) || fs.existsSync(srcAppDir);
      hasPagesRouter = fs.existsSync(pagesDir) || fs.existsSync(srcPagesDir);
    }

    this.cachedProjectInfo = {
      framework,
      hasAppRouter,
      hasPagesRouter,
      reactVersion,
      nextVersion,
      bundler,
      usesTypeScript
    };

    return this.cachedProjectInfo;
  }

  /**
   * Determine if a specific file is part of Next.js or React based on its location
   */
  public detectFrameworkForFile(filePath: string, projectRoot?: string): FrameworkType {
    const projectInfo = this.detectFramework(projectRoot);
    
    // If project is Next.js, check if file is in Next.js-specific directories
    if (projectInfo.framework === 'nextjs') {
      const normalizedPath = filePath.replace(/\\/g, '/');
      
      // Check if it's in Next.js specific folders
      if (normalizedPath.includes('/app/') || 
          normalizedPath.includes('/pages/') ||
          normalizedPath.match(/\/(layout|page|loading|error|not-found|template|route)\.(tsx?|jsx?)$/)) {
        return 'nextjs';
      }
      
      // For Next.js projects, components folder files are considered Next.js
      // unless they're clearly generic React components
      return 'nextjs';
    }

    return projectInfo.framework;
  }

  /**
   * Get the appropriate rules file path based on the framework
   */
  public getRulesPath(framework: FrameworkType): string {
    const baseDir = path.join(__dirname, '../config');
    
    if (framework === 'nextjs') {
      return path.join(baseDir, 'nextjs-llm-best-practices.json');
    } else {
      return path.join(baseDir, 'react-llm-best-practices.json');
    }
  }

  /**
   * Clear the cached project info (useful for testing)
   */
  public clearCache(): void {
    this.cachedProjectInfo = null;
  }

  /**
   * Get a human-readable description of the detected project
   */
  public getProjectDescription(projectInfo?: ProjectInfo): string {
    const info = projectInfo || this.detectFramework();
    
    if (info.framework === 'nextjs') {
      const routerInfo = [];
      if (info.hasAppRouter) routerInfo.push('App Router');
      if (info.hasPagesRouter) routerInfo.push('Pages Router');
      const router = routerInfo.length > 0 ? ` with ${routerInfo.join(' and ')}` : '';
      
      return `Next.js${info.nextVersion ? ' ' + info.nextVersion : ''}${router}`;
    } else if (info.framework === 'react') {
      const bundlerInfo = info.bundler !== 'other' ? ` (${info.bundler})` : '';
      return `React${info.reactVersion ? ' ' + info.reactVersion : ''}${bundlerInfo}`;
    }
    
    return 'Unknown framework';
  }
}

// Export singleton instance
export const projectDetector = ProjectDetector.getInstance();
