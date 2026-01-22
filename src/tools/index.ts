import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CodeAnalyzer } from '../core/analyzer.js';
import { CodeReviewer } from '../core/reviewer.js';
import { CodeOptimizer } from '../core/optimizer.js';
import { analyzeProject, analyzeDirectory, checkMigrationReadiness, checkProjectMigrationReadiness, checkDirectoryMigrationReadiness, findRepeatedCode, findRepeatedCodeInProject, findRepeatedCodeInDirectory, generateComponent, optimizeProject, optimizeDirectory, refactorCode, reviewProject, reviewDirectory, checkAccessibilityInDirectory, checkSecurityInDirectory } from '../common/helper.js';
import { projectDetector } from '../common/project-detector.js';
import { executeToolSafely } from '../common/mcp-response.js';
import { configManager } from '../common/config-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export function registerTools(server: McpServer): void {
  const analyzer = new CodeAnalyzer();
  const reviewer = new CodeReviewer();
  const optimizer = new CodeOptimizer();

  // Tool 1: Analyze Code
  server.registerTool(
    'analyze-code',
    {
      title: 'Analyze Code using custom MCP tool',
      description: 'Analyze React/Next.js code for best practices, patterns, and issues. Automatically detects project type (React or Next.js) and applies appropriate rules. Works on selected file or entire project. Checks against framework-specific best practices including hooks, components, routing, and security.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('📁 Enter the full path to the file you want to analyze (e.g., /workspace/src/components/Button.tsx). Leave empty to analyze the entire project automatically.'),
        includeTests: z.boolean().optional().describe('🧪 Would you like to include test files (*.test.*, *.spec.*) in the analysis? Enter true to include tests, or leave empty for default (false).')
      }),
      annotations: {
        title: 'Analyze Code using custom MCP tool',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      },
      _meta: { category: 'code-analysis', framework: 'react-nextjs', toolVersion: '1.0.0' }
    },
    async ({ filePath, includeTests = false }: { filePath?: string; includeTests?: boolean }) => {
      return executeToolSafely(
        { filePath, includeTests },
        async () => {
          if (!filePath) {
            return await analyzeProject(analyzer, includeTests);
          }

          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            return await analyzeDirectory(analyzer, filePath, includeTests);
          }

          const code = fs.readFileSync(filePath, 'utf-8');
          return await analyzer.analyzeCode(code, filePath);
        },
        'code-analysis'
      );
    }
  );

  // Tool 2: Review Code
  server.registerTool(
    'review-code',
    {
      title: 'Review Code with Quality Metrics and Best Practices using custom MCP tool',
      description: 'Perform comprehensive code review including quality metrics (maintainability, complexity, testability, readability), architecture analysis, and best practice checks. Works on selected file or entire project.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('📄 Which file would you like to review? Provide the full path (e.g., /workspace/src/app/page.tsx). Leave empty to review your entire project with comprehensive quality metrics.')
      }),
      annotations: {
        title: 'Review Code with Quality Metrics and Best Practices using custom MCP tool',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      },
      _meta: { category: 'code-review', framework: 'react-nextjs', toolVersion: '1.0.0' }
    },
    async ({ filePath }: { filePath?: string }) => {
      return executeToolSafely(
        { filePath },
        async () => {
          if (!filePath) {
            return await reviewProject(reviewer);
          }

          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            return await reviewDirectory(reviewer, filePath);
          }

          const code = fs.readFileSync(filePath, 'utf-8');
          return await reviewer.reviewCode(code, filePath);
        },
        'code-review'
      );
    }
  );

  // Tool 3: Optimize Code
  server.registerTool(
    'optimize-code',
    {
      title: 'Optimize Code for Performance, Bundle Size, SEO, and Accessibility using custom MCP tool',
      description: 'Get optimization suggestions for performance, bundle size, SEO, and accessibility. Works on selected file or entire project. Includes implementation examples and estimated impact.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('⚡ Enter the file path you want to optimize for performance, bundle size, and SEO (e.g., /workspace/src/app/layout.tsx). Leave empty to get optimization suggestions for the entire project.')
      }),
      annotations: {
        title: 'Optimize Code for Performance, Bundle Size, SEO, and Accessibility using custom MCP tool',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      },
      _meta: { category: 'code-optimization', framework: 'react-nextjs', toolVersion: '1.0.0' }
    },
    async ({ filePath }: { filePath?: string }) => {
      return executeToolSafely(
        { filePath },
        async () => {
          if (!filePath) {
            return await optimizeProject(optimizer);
          }

          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            return await optimizeDirectory(optimizer, filePath);
          }

          const code = fs.readFileSync(filePath, 'utf-8');
          return await optimizer.optimizeCode(code, filePath);
        },
        'code-optimization'
      );
    }
  );

  // Tool 4: Generate Component
  server.registerTool(
    'generate-component',
    {
      title: 'Generate Component using custom MCP tool',
      description: 'Generate a React or Next.js component following best practices. Automatically detects project type and generates appropriate code. Supports functional components, pages, layouts, and more.',
      inputSchema: z.object({
        name: z.string().describe('🏷️  What should this component be called? Use PascalCase (e.g., UserProfile, ProductCard, DashboardLayout)'),
        type: z.enum(['server-component', 'client-component', 'layout', 'page', 'api-route', 'server-action']).describe('🔧 What type of component do you need? Choose: server-component (default, for data fetching), client-component (for interactivity), layout (wrapper), page (route), api-route (API endpoint), or server-action (form handler)'),
        features: z.array(z.string()).optional().describe('✨ Which features should be included? Enter as array: ["form", "data-fetching", "loading", "error-boundary", "suspense"]. Leave empty for a basic component.'),
        styling: z.enum(['tailwind', 'css-modules', 'none']).optional().describe('🎨 Choose styling method: tailwind (default, utility-first), css-modules (scoped CSS), or none (no styling)')
      }),
      annotations: {
        title: 'Generate Component using custom MCP tool',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      },
      _meta: { category: 'code-generation', framework: 'react-nextjs', toolVersion: '1.0.0' }
    },
    async ({ name, type, features = [], styling = 'tailwind' }: { name: string; type: string; features?: string[]; styling?: string }) => {
      return executeToolSafely(
        { name, type, features, styling },
        async () => generateComponent(name, type, features, styling),
        'code-generation'
      );
    }
  );

  // Tool 5: Refactor Code
  server.registerTool(
    'refactor-code',
    {
      title: 'Refactor Code to follow Next.js 15+ Patterns using custom MCP tool',
      description: 'Refactor code to follow Next.js 15+ patterns. Works on selected file. Can convert Pages Router to App Router, class components to functional, and more.',
      inputSchema: z.object({
        filePath: z.string().describe('📝 Which file needs refactoring? Provide the full path (e.g., /workspace/pages/index.tsx or /workspace/src/components/OldComponent.tsx)'),
        pattern: z.enum(['pages-to-app-router', 'class-to-functional', 'prop-drilling-to-context', 'client-to-server']).describe('🔄 Select the refactoring pattern: pages-to-app-router (migrate Next.js Pages to App Router), class-to-functional (convert class components to hooks), prop-drilling-to-context (eliminate prop drilling with Context API), client-to-server (move logic to server)')
      }),
      annotations: {
        title: 'Refactor Code to follow Next.js 15+ Patterns using custom MCP tool',
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      },
      _meta: { category: 'code-refactoring', framework: 'react-nextjs', toolVersion: '1.0.0' }
    },
    async ({ filePath, pattern }: { filePath: string; pattern: string }) => {
      return executeToolSafely(
        { filePath, pattern },
        async () => {
          const code = fs.readFileSync(filePath, 'utf-8');
          return refactorCode(code, pattern, filePath);
        },
        'code-refactoring'
      );
    }
  );

  // Tool 6: Get Best Practices
  server.registerTool(
    'get-best-practices',
    {
      title: 'Get Best Practices Guide using custom MCP tool',
      description: 'Get React or Next.js best practices guide. Automatically detects project type and returns appropriate guidelines for routing, data fetching, performance, security, etc.',
      inputSchema: z.object({
        topic: z.enum(['routing', 'data-fetching', 'server-components', 'client-components', 'performance', 'security', 'seo', 'accessibility', 'testing', 'deployment', 'components', 'hooks', 'state-management']).optional().describe('📚 What topic are you interested in? Choose one: routing, data-fetching, server-components, client-components, performance, security, seo, accessibility, testing, deployment, components, hooks, or state-management. Leave empty to get ALL best practices for your framework.')
      }),
      annotations: {
        title: 'Get Best Practices Guide using custom MCP tool',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      },
      _meta: { category: 'best-practices', framework: 'react-nextjs', toolVersion: '1.0.0' }
    },
    async ({ topic }: { topic?: string }) => {
      return executeToolSafely(
        { topic },
        async () => {
          const projectInfo = projectDetector.detectFramework();
          const isReact = projectInfo.framework === 'react';
          const framework = isReact ? 'React' : 'Next.js';

          const configName = isReact ? 'react-llm-best-practices' : 'nextjs-llm-best-practices';
          const rules = configManager.loadConfig(configName);

          let response = `# ${framework} Best Practices\n\n`;

          if (topic) {
            const topicKey = topic.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

            if (rules[topicKey]) {
              response += `## ${topic.charAt(0).toUpperCase() + topic.slice(1).replace(/-/g, ' ')}\n\n`;
              response += JSON.stringify(rules[topicKey], null, 2);
            } else {
              response += `Topic "${topic}" not found in ${framework} rules.\n\n`;
              response += `Available topics: ${Object.keys(rules).join(', ')}\n\n`;
              response += `Full rules:\n${JSON.stringify(rules, null, 2)}`;
            }
          } else {
            response += JSON.stringify(rules, null, 2);
          }

          return response;
        },
        'best-practices'
      );
    }
  );

  // Tool 7: Check Migration Readiness
  server.registerTool(
    'check-migration-readiness',
    {
      title: 'Check Migration Readiness from Pages Router to App Router using custom MCP tool',
      description: 'Check if a Pages Router page is ready to migrate to App Router. Works on selected file or entire pages directory. Identifies blockers and provides migration steps.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('🔍 Which Pages Router file do you want to check? Enter path (e.g., /workspace/pages/index.tsx or /workspace/pages/blog/[slug].tsx). Leave empty to check ALL files in the pages/ directory for migration readiness.')
      }),
      annotations: {
        title: 'Check Migration Readiness from Pages Router to App Router using custom MCP tool',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      },
      _meta: { category: 'code-migration', framework: 'react-nextjs', toolVersion: '1.0.0' }
    },
    async ({ filePath }: { filePath?: string }) => {
      return executeToolSafely(
        { filePath },
        async () => {
          if (!filePath) {
            return await checkProjectMigrationReadiness();
          }

          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            return await checkDirectoryMigrationReadiness(filePath);
          }

          const code = fs.readFileSync(filePath, 'utf-8');
          return checkMigrationReadiness(code, filePath);
        },
        'code-migration'
      );
    }
  );

  // Tool 8: Find Repeated Code
  server.registerTool(
    'find-repeated-code',
    {
      title: 'Find Repeated Code Patterns using custom MCP tool',
      description: 'Identifies repeated code patterns that can be extracted into reusable components or utility functions. Works on selected file or entire project. Detects duplicate JSX blocks, logic patterns, and suggests refactoring opportunities.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('🔎 Which file should I scan for duplicate code? Provide the path (e.g., /workspace/src/components/Dashboard.tsx). Leave empty to find repeated patterns across your entire project.'),
        minOccurrences: z.number().optional().describe('🔢 How many times must code be repeated to report it? Enter a number (e.g., 2 for duplicates, 3 for triplicates). Default is 2 if left empty.'),
        includeSmallPatterns: z.boolean().optional().describe('🔬 Should I include small code patterns (less than 3 lines)? Enter true to catch even tiny duplications, or leave empty for default (false) to focus on larger patterns.')
      }),
      _meta: { category: 'code-analysis', framework: 'react-nextjs', toolVersion: '1.0.0' }
    },
    async ({ filePath, minOccurrences = 2, includeSmallPatterns = false }: { filePath?: string; minOccurrences?: number; includeSmallPatterns?: boolean }) => {
      return executeToolSafely(
        { filePath, minOccurrences, includeSmallPatterns },
        async () => {
          if (!filePath) {
            return await findRepeatedCodeInProject(minOccurrences, includeSmallPatterns);
          }

          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            return await findRepeatedCodeInDirectory(filePath, minOccurrences, includeSmallPatterns);
          }

          const code = fs.readFileSync(filePath, 'utf-8');
          return findRepeatedCode(code, filePath, minOccurrences, includeSmallPatterns);
        },
        'code-analysis'
      );
    }
  );

  // Tool 9: Check Accessibility
  server.registerTool(
    'check-accessibility',
    {
      title: 'Check Accessibility Compliance using custom MCP tool',
      description: 'Analyze React/Next.js code for accessibility compliance with WCAG guidelines. Identifies issues like missing alt text, poor color contrast, and improper ARIA usage. Works on selected file or entire project.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('♿ Which file would you like to check for accessibility issues? Provide the full path (e.g., /workspace/src/app/page.tsx). Leave empty to check your entire project for accessibility compliance.')
      }),
      annotations: {
        title: 'Check Accessibility Compliance using custom MCP tool',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      },
      _meta: { category: 'accessibility-check', framework: 'react-nextjs', toolVersion: '1.0.0' }
    },
    async ({ filePath }: { filePath?: string }) => {
      return executeToolSafely(
        { filePath },
        async () => {
          if (!filePath) {
            return await analyzer.checkAccessibilityInProject();
          }

          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            return await checkAccessibilityInDirectory(analyzer, filePath);
          }

          const code = fs.readFileSync(filePath, 'utf-8');
          return analyzer.checkAccessibility(code, filePath);
        },
        'accessibility-check'
      );
    }
  );

  // Tool 10: Check Security
  server.registerTool(
    'check-security',
    {
      title: 'Check Security Vulnerabilities using custom MCP tool',
      description: 'Analyze React/Next.js code for common security vulnerabilities such as XSS, CSRF, and injection attacks using config-driven security rules. Provides remediation suggestions. Works on selected file or entire project.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('🔒 Which file would you like to check for security vulnerabilities? Provide the full path (e.g., /workspace/src/app/page.tsx). Leave empty to check your entire project for security issues.')
      }),
      annotations: {
        title: 'Check Security Vulnerabilities using custom MCP tool',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      },
      _meta: { category: 'security-check', framework: 'react-nextjs', toolVersion: '2.0.0' }
    },
    async ({ filePath }: { filePath?: string }) => {
      return executeToolSafely(
        { filePath },
        async () => {
          if (!filePath) {
            return await analyzer.checkSecurityInProject();
          }

          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            return await checkSecurityInDirectory(analyzer, filePath);
          }

          const code = fs.readFileSync(filePath, 'utf-8');
          return await analyzer.checkSecurity(code, filePath);
        },
        'security-check'
      );
    }
  );

  // Tool 11: Manage Security Rules
  server.registerTool(
    'manage-security-rules',
    {
      title: 'Manage Security Rules Configuration',
      description: 'View, enable, or disable security rules for your project. Get detailed information about all available security checks and configure which ones are active. This allows you to customize security analysis based on your project needs.',
      inputSchema: z.object({
        action: z.enum(['list', 'get-config', 'enable', 'disable']).describe('🔧 Action to perform: "list" to see all rules, "get-config" for full configuration, "enable" or "disable" to toggle a specific rule.'),
        ruleId: z.string().optional().describe('📋 Rule ID (required when action is "enable" or "disable"). Example: "no-env-variable-exposure"')
      }),
      annotations: {
        title: 'Manage Security Rules Configuration',
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      },
      _meta: { category: 'security-config', framework: 'react-nextjs', toolVersion: '1.0.0' }
    },
    async ({ action, ruleId }: { action: 'list' | 'get-config' | 'enable' | 'disable'; ruleId?: string }) => {
      return executeToolSafely(
        { action, ruleId },
        async () => {
          const securityAnalyzer = new (await import('../core/securityAnalyzer.js')).SecurityAnalyzer();

          if (action === 'list') {
            const rules = securityAnalyzer.getEnabledRules();
            return {
              totalRules: rules.length,
              rules: rules.map(r => ({
                id: r.id,
                title: r.title,
                severity: r.severity,
                enabled: r.enabled,
                intent: r.intent
              }))
            };
          } else if (action === 'get-config') {
            return securityAnalyzer.getRulesConfig();
          } else if (action === 'enable' || action === 'disable') {
            if (!ruleId) {
              throw new Error('ruleId is required for enable/disable actions');
            }

            const enabled = action === 'enable';
            const success = securityAnalyzer.updateRuleStatus(ruleId, enabled);

            if (!success) {
              throw new Error(`Rule "${ruleId}" not found`);
            }

            return {
              success: true,
              message: `Rule "${ruleId}" has been ${enabled ? 'enabled' : 'disabled'}`
            };
          }

          throw new Error('Invalid action');
        },
        'security-config'
      );
    }
  );
}
