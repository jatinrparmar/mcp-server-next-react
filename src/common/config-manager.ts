import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration Manager
 * Provides centralized, project-specific, and user-friendly configuration management
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private configs: Map<string, any> = new Map();
  private projectRoot: string;
  private configPath: string;
  private presetsPath: string;
  
  private constructor() {
    this.projectRoot = process.cwd();
    this.configPath = path.join(__dirname, '../config');
    this.presetsPath = path.join(this.configPath, 'industry-presets.json');
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Load configuration with project-specific overrides
   * Priority: project config > user config > default config
   */
  loadConfig(configName: string): any {
    const cacheKey = `${this.projectRoot}:${configName}`;
    
    if (this.configs.has(cacheKey)) {
      return this.configs.get(cacheKey);
    }

    // 1. Load default config
    const defaultConfig = this.loadDefaultConfig(configName);
    
    // 2. Load user config from home directory (optional)
    const userConfig = this.loadUserConfig(configName);
    
    // 3. Load project-specific config (optional)
    const projectConfig = this.loadProjectConfig(configName);
    
    // Optional preset selection via env or .mcp/profile.json
    const presetName = this.resolvePresetName();
    const presetOverrides = presetName ? this.getPresetOverrides(presetName) : {};

    // Merge configs (default < user < preset < project)
    const mergedConfig = this.deepMerge(
      defaultConfig,
      userConfig,
      presetOverrides,
      projectConfig
    );
    
    this.configs.set(cacheKey, mergedConfig);
    return mergedConfig;
  }

  /**
   * Resolve preset name from env MCP_PROFILE or .mcp/profile.json
   */
  private resolvePresetName(): string | null {
    const fromEnv = process.env.MCP_PROFILE;
    if (fromEnv) return fromEnv;

    const profileFile = path.join(this.projectRoot, '.mcp', 'profile.json');
    if (fs.existsSync(profileFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(profileFile, 'utf-8'));
        return data.profile || null;
      } catch {}
    }
    return null;
  }

  /**
   * Load and return preset overrides
   */
  private getPresetOverrides(presetName: string): any {
    if (!fs.existsSync(this.presetsPath)) return {};
    try {
      const presets = JSON.parse(fs.readFileSync(this.presetsPath, 'utf-8'));
      const preset = presets?.presets?.[presetName];
      return preset || {};
    } catch {
      return {};
    }
  }

  /**
   * Load default configuration from src/config
   */
  private loadDefaultConfig(configName: string): any {
    const configFile = path.join(this.configPath, `${configName}.json`);
    
    if (!fs.existsSync(configFile)) {
      throw new Error(`Config file not found: ${configFile}`);
    }
    
    return JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  }

  /**
   * Load user-specific config from ~/.mcp-config/
   */
  private loadUserConfig(configName: string): any {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const userConfigDir = path.join(homeDir, '.mcp-config');
    const userConfigFile = path.join(userConfigDir, `${configName}.json`);
    
    if (fs.existsSync(userConfigFile)) {
      try {
        return JSON.parse(fs.readFileSync(userConfigFile, 'utf-8'));
      } catch (error) {
        console.warn(`Warning: Failed to load user config: ${userConfigFile}`);
      }
    }
    
    return {};
  }

  /**
   * Load project-specific config from .mcp/ directory
   */
  private loadProjectConfig(configName: string): any {
    const projectConfigDir = path.join(this.projectRoot, '.mcp');
    const projectConfigFile = path.join(projectConfigDir, `${configName}.json`);
    
    if (fs.existsSync(projectConfigFile)) {
      try {
        return JSON.parse(fs.readFileSync(projectConfigFile, 'utf-8'));
      } catch (error) {
        console.warn(`Warning: Failed to load project config: ${projectConfigFile}`);
      }
    }
    
    return {};
  }

  /**
   * Deep merge multiple objects
   */
  private deepMerge(...objects: any[]): any {
    const isObject = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj);
    
    return objects.reduce((prev, obj) => {
      if (!obj) return prev;
      
      Object.keys(obj).forEach(key => {
        const pVal = prev[key];
        const oVal = obj[key];
        
        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = [...pVal, ...oVal];
        } else if (isObject(pVal) && isObject(oVal)) {
          prev[key] = this.deepMerge(pVal, oVal);
        } else {
          prev[key] = oVal;
        }
      });
      
      return prev;
    }, {});
  }

  /**
   * Save project-specific configuration
   */
  saveProjectConfig(configName: string, config: any): void {
    const projectConfigDir = path.join(this.projectRoot, '.mcp');
    
    if (!fs.existsSync(projectConfigDir)) {
      fs.mkdirSync(projectConfigDir, { recursive: true });
    }
    
    const projectConfigFile = path.join(projectConfigDir, `${configName}.json`);
    fs.writeFileSync(projectConfigFile, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * Get specific rule from config
   */
  getRule(configName: string, ruleId: string): any {
    const config = this.loadConfig(configName);
    
    if (config.securityRules) {
      return config.securityRules.find((rule: any) => rule.id === ruleId);
    }
    
    return null;
  }

  /**
   * Update specific rule in config
   */
  updateRule(configName: string, ruleId: string, updates: any): void {
    const config = this.loadConfig(configName);
    
    if (config.securityRules) {
      const ruleIndex = config.securityRules.findIndex((rule: any) => rule.id === ruleId);
      if (ruleIndex !== -1) {
        config.securityRules[ruleIndex] = {
          ...config.securityRules[ruleIndex],
          ...updates
        };
        this.saveProjectConfig(configName, config);
      }
    }
  }

  /**
   * Enable/disable a specific rule
   */
  toggleRule(configName: string, ruleId: string, enabled: boolean): void {
    this.updateRule(configName, ruleId, { enabled });
  }

  /**
   * Get all enabled rules from config
   */
  getEnabledRules(configName: string): any[] {
    const config = this.loadConfig(configName);
    
    if (config.securityRules) {
      return config.securityRules.filter((rule: any) => rule.enabled !== false);
    }
    
    return [];
  }

  /**
   * List all available configs
   */
  listConfigs(): string[] {
    return fs.readdirSync(this.configPath)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  }

  /**
   * Initialize project with default configs
   */
  initProject(framework: 'nextjs' | 'react'): void {
    const projectConfigDir = path.join(this.projectRoot, '.mcp');
    
    if (!fs.existsSync(projectConfigDir)) {
      fs.mkdirSync(projectConfigDir, { recursive: true });
    }

    // Create README
    const readmeContent = `# MCP Configuration

This directory contains project-specific configuration for the MCP Code Analysis tools.

## Configuration Files

- \`${framework}-llm-best-practices.json\` - Best practices rules
- \`${framework}-llm-security-rules.json\` - Security analysis rules  
- \`react-next-llm-accessibility-rules.json\` - Accessibility rules

## Customization

You can override any default rule by adding it to the corresponding file.
Only specify the rules you want to change - the rest will use defaults.

## Example: Disable a Security Rule

\`\`\`json
{
  "securityRules": [
    {
      "id": "no-env-variable-exposure",
      "enabled": false
    }
  ]
}
\`\`\`

## Example: Adjust Rule Severity

\`\`\`json
{
  "securityRules": [
    {
      "id": "server-action-validation",
      "severity": "warning"
    }
  ]
}
\`\`\`

For more information, see: https://github.com/your-repo/mcp-server-next-react
`;

    fs.writeFileSync(
      path.join(projectConfigDir, 'README.md'),
      readmeContent,
      'utf-8'
    );

    // Create template config
    const templateConfig = {
      meta: {
        framework,
        customized: true,
        createdAt: new Date().toISOString()
      },
      comment: "Add your custom configuration here. Only specify rules you want to override."
    };

    fs.writeFileSync(
      path.join(projectConfigDir, `${framework}-llm-best-practices.json`),
      JSON.stringify(templateConfig, null, 2),
      'utf-8'
    );

    console.log(`✅ Initialized MCP configuration in ${projectConfigDir}`);
  }

  /**
   * Clear config cache
   */
  clearCache(): void {
    this.configs.clear();
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();
