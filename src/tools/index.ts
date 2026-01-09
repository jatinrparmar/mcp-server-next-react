import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CodeAnalyzer } from '../core/analyzer.js';
import { CodeReviewer } from '../core/reviewer.js';
import { CodeOptimizer } from '../core/optimizer.js';
import { analyzeProject, checkMigrationReadiness, checkProjectMigrationReadiness, findRepeatedCode, findRepeatedCodeInProject, generateComponent, optimizeProject, refactorCode, reviewProject } from '../common/helper.js';
import { projectDetector } from '../common/project-detector.js';


export function registerTools(server: McpServer): void {
  const analyzer = new CodeAnalyzer();
  const reviewer = new CodeReviewer();
  const optimizer = new CodeOptimizer();

  // Tool 1: Analyze Code
  server.registerTool(
    'mycustom-mcp-analyze-code',
    {
      description: 'Analyze React/Next.js code for best practices, patterns, and issues. Automatically detects project type (React or Next.js) and applies appropriate rules. Works on selected file or entire project. Checks against framework-specific best practices including hooks, components, routing, and security.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('File path to analyze (e.g., src/components/page.tsx). If not provided, scans entire project'),
        includeTests: z.boolean().optional().describe('Include test files in analysis (default: false)')
      })
    },
    async ({ filePath, includeTests = false }: { filePath?: string; includeTests?: boolean }) => {
      try {
        if (!filePath) {
          // Scan entire project
          const projectResult = await analyzeProject(analyzer, includeTests);
          return {
            content: [{ type: 'text', text: JSON.stringify(projectResult, null, 2) }]
          };
        }
        const code = fs.readFileSync(filePath, 'utf-8');
        const result = await analyzer.analyzeCode(code, filePath);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool 2: Review Code
  server.registerTool(
    'mycustom-mcp-review-code',
    {
      description: 'Perform comprehensive code review including quality metrics (maintainability, complexity, testability, readability), architecture analysis, and best practice checks. Works on selected file or entire project.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('File path to review (e.g., src/components/page.tsx). If not provided, reviews entire project')
      })
    },
    async ({ filePath }: { filePath?: string }) => {
      try {
        if (!filePath) {
          // Review entire project
          const projectResult = await reviewProject(reviewer);
          return {
            content: [{ type: 'text', text: JSON.stringify(projectResult, null, 2) }]
          };
        }
        const code = fs.readFileSync(filePath, 'utf-8');
        const result = await reviewer.reviewCode(code, filePath);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error reviewing code: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool 3: Optimize Code
  server.registerTool(
    'mycustom-mcp-optimize-code',
    {
      description: 'Get optimization suggestions for performance, bundle size, SEO, and accessibility. Works on selected file or entire project. Includes implementation examples and estimated impact.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('File path to optimize (e.g., src/app/page.tsx). If not provided, optimizes entire project')
      })
    },
    async ({ filePath }: { filePath?: string }) => {
      try {
        if (!filePath) {
          // Optimize entire project
          const projectResult = await optimizeProject(optimizer);
          return {
            content: [{ type: 'text', text: JSON.stringify(projectResult, null, 2) }]
          };
        }
        const code = fs.readFileSync(filePath, 'utf-8');
        const result = await optimizer.optimizeCode(code, filePath);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error optimizing code: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool 4: Generate Component
  server.registerTool(
    'mycustom-mcp-generate-component',
    {
      description: 'Generate a React or Next.js component following best practices. Automatically detects project type and generates appropriate code. Supports functional components, pages, layouts, and more.',
      inputSchema: z.object({
        name: z.string().describe('Component name (e.g., UserProfile)'),
        type: z.enum(['server-component', 'client-component', 'layout', 'page', 'api-route', 'server-action']).describe('Type of component to generate'),
        features: z.array(z.string()).optional().describe('Features to include (e.g., ["form", "data-fetching", "loading"])'),
        styling: z.enum(['tailwind', 'css-modules', 'none']).optional().describe('Styling approach')
      })
    },
    async ({ name, type, features = [], styling = 'tailwind' }: { name: string; type: string; features?: string[]; styling?: string }) => {
      try {
        const component = generateComponent(name, type, features, styling);
        
        return {
          content: [
            {
              type: 'text',
              text: component
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error generating component: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool 5: Refactor Code
  server.registerTool(
    'mycustom-mcp-refactor-code',
    {
      description: 'Refactor code to follow Next.js 15+ patterns. Works on selected file. Can convert Pages Router to App Router, class components to functional, and more.',
      inputSchema: z.object({
        filePath: z.string().describe('File path to refactor (e.g., pages/index.tsx)'),
        pattern: z.enum(['pages-to-app-router', 'class-to-functional', 'prop-drilling-to-context', 'client-to-server']).describe('Refactoring pattern to apply')
      })
    },
    async ({ filePath, pattern }: { filePath: string; pattern: string }) => {
      try {
        const code = fs.readFileSync(filePath, 'utf-8');
        const refactored = refactorCode(code, pattern, filePath);
        
        return {
          content: [
            {
              type: 'text',
              text: refactored
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error refactoring code: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool 6: Get Best Practices
  server.registerTool(
    'mycustom-mcp-get-best-practices',
    {
      description: 'Get React or Next.js best practices guide. Automatically detects project type and returns appropriate guidelines for routing, data fetching, performance, security, etc.',
      inputSchema: z.object({
        topic: z.enum(['routing', 'data-fetching', 'server-components', 'client-components', 'performance', 'security', 'seo', 'accessibility', 'testing', 'deployment']).optional().describe('Specific topic (if not provided, returns all practices)')
      })
    },
    async ({ topic }: { topic?: string }) => {
      try {
        // Detect project framework
        const projectInfo = projectDetector.detectFramework();
        const isReact = projectInfo.framework === 'react';
        
        // Load appropriate rules
        const rulesFileName = isReact ? 'react-llm-rules.json' : 'next-llm-rules.json';
        const rulesPath = path.join(__dirname, '../config', rulesFileName);
        const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
        const rules = JSON.parse(rulesContent);

        let response = '';
        
        if (topic) {
          response = JSON.stringify(rules[topic] || rules, null, 2);
        } else {
          response = JSON.stringify(rules, null, 2);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: response
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting best practices: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool 7: Check Migration Readiness
  server.registerTool(
    'mycustom-mcp-check-migration-readiness',
    {
      description: 'Check if a Pages Router page is ready to migrate to App Router. Works on selected file or entire pages directory. Identifies blockers and provides migration steps.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('File path to check (e.g., pages/index.tsx). If not provided, checks entire pages directory')
      })
    },
    async ({ filePath }: { filePath?: string }) => {
      try {
        if (!filePath) {
          // Check entire pages directory
          const projectResult = await checkProjectMigrationReadiness();
          return {
            content: [{ type: 'text', text: JSON.stringify(projectResult, null, 2) }]
          };
        }
        const code = fs.readFileSync(filePath, 'utf-8');
        const analysis = checkMigrationReadiness(code, filePath);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error checking migration readiness: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Tool 8: Find Repeated Code
  server.registerTool(
    'mycustom-mcp-find-repeated-code',
    {
      description: 'Identifies repeated code patterns that can be extracted into reusable components or utility functions. Works on selected file or entire project. Detects duplicate JSX blocks, logic patterns, and suggests refactoring opportunities.',
      inputSchema: z.object({
        filePath: z.string().optional().describe('File path to analyze (e.g., src/components/page.tsx). If not provided, analyzes entire project'),
        minOccurrences: z.number().optional().describe('Minimum number of repetitions to report (default: 2)'),
        includeSmallPatterns: z.boolean().optional().describe('Include small patterns (less than 3 lines) (default: false)')
      })
    },
    async ({ filePath, minOccurrences = 2, includeSmallPatterns = false }: { filePath?: string; minOccurrences?: number; includeSmallPatterns?: boolean }) => {
      try {
        if (!filePath) {
          // Find repeated code across entire project
          const projectResult = await findRepeatedCodeInProject(minOccurrences, includeSmallPatterns);
          return {
            content: [{ type: 'text', text: JSON.stringify(projectResult, null, 2) }]
          };
        }
        const code = fs.readFileSync(filePath, 'utf-8');
        const result = findRepeatedCode(code, filePath, minOccurrences, includeSmallPatterns);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error finding repeated code: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  );
}
