# Security Rules Configuration Guide

## Overview

Your MCP server now includes a **configuration-driven security analysis system** similar to how best practices are handled. All security checks are controlled by JSON configuration files, making it easy to customize security rules, enable/disable specific checks, and extend the security analysis.

## Architecture

### New Files Added

1. **[src/core/securityAnalyzer.ts](src/core/securityAnalyzer.ts)** - Core security analysis engine
   - Config-driven rule checking
   - Pattern-based vulnerability detection
   - Project-wide and file-level analysis

2. **[src/config/nextjs-llm-security-rules.json](src/config/nextjs-llm-security-rules.json)** - Next.js security rules
   - 11 comprehensive security rules
   - Framework-specific checks

3. **[src/config/react-llm-security-rules.json](src/config/react-llm-security-rules.json)** - React security rules
   - 10 focused security rules
   - Client-side focused checks

4. **Updated [src/types/schema.ts](src/types/schema.ts)** - New type definitions
   - `SecurityRule` interface
   - `SecurityConfig` interface
   - `SecurityCheckResult` interface

5. **Updated [src/core/analyzer.ts](src/core/analyzer.ts)** - Integrated SecurityAnalyzer
   - Now uses config-driven security checks
   - Removed hardcoded security logic

6. **Updated [src/tools/index.ts](src/tools/index.ts)** - New security management tool
   - Enhanced `check-security` tool
   - New `manage-security-rules` tool for rule configuration

---

## Security Rules Structure

### Rule Format

Each security rule in the JSON config follows this structure:

```json
{
  "id": "rule-id",
  "title": "Human-readable title",
  "intent": "Why this rule exists",
  "scope": "code|component|function|config|project",
  "severity": "critical|high|medium|low",
  "enabled": true,
  "detection": {
    "patterns": ["regex pattern 1", "regex pattern 2"],
    "fileGlobs": ["**/*.tsx"],
    "fileExtensions": [".ts", ".tsx"],
    "requirePatterns": ["validation library"],
    "requireAbsence": ["dangerous pattern"],
    "excludePatterns": ["test files"]
  },
  "recommendation": "How to fix the issue",
  "references": ["https://..."],
  "codeExample": {
    "bad": "// Bad code",
    "good": "// Good code"
  }
}
```

---

## Next.js Security Rules (11 Rules)

### 1. `no-env-variable-exposure`
**Severity:** Critical
- **Purpose:** Prevent sensitive environment variables from being exposed to the client side
- **Detects:** `process.env` calls without `NEXT_PUBLIC_` prefix containing secrets
- **Recommendation:** Use only `NEXT_PUBLIC_` prefixed variables on client side

### 2. `server-action-validation`
**Severity:** Critical
- **Purpose:** Ensure server actions validate all user inputs
- **Detects:** Server actions without input validation
- **Recommendation:** Always use Zod, Yup, or Joi for validation

### 3. `no-hardcoded-secrets`
**Severity:** Critical
- **Purpose:** Prevent hardcoded API keys, tokens, and passwords
- **Detects:** Hardcoded sensitive values in code
- **Recommendation:** Store all secrets in environment variables

### 4. `xss-prevention`
**Severity:** High
- **Purpose:** Prevent XSS vulnerabilities
- **Detects:** `dangerouslySetInnerHTML`, `innerHTML`, `eval()` usage
- **Recommendation:** React auto-escapes by default; avoid dangerous patterns

### 5. `sql-injection-prevention`
**Severity:** Critical
- **Purpose:** Prevent SQL injection attacks
- **Detects:** String concatenation in SQL queries
- **Recommendation:** Use parameterized queries or Prisma ORM

### 6. `csp-headers`
**Severity:** High
- **Purpose:** Configure Content Security Policy headers
- **Detects:** Missing CSP header configuration
- **Recommendation:** Configure CSP in next.config.js or middleware

### 7. `csrf-protection`
**Severity:** High
- **Purpose:** CSRF token protection
- **Detects:** Server actions without CSRF validation
- **Recommendation:** Validate CSRF tokens in state-changing operations

### 8. `secure-headers`
**Severity:** High
- **Purpose:** Implement all security headers
- **Detects:** Missing security headers (X-Frame-Options, X-Content-Type-Options)
- **Recommendation:** Configure headers in middleware or next.config.js

### 9. `auth-validation`
**Severity:** Critical
- **Purpose:** Validate authentication and authorization
- **Detects:** Protected resources without auth checks
- **Recommendation:** Always validate user sessions

### 10. `dependency-vulnerabilities`
**Severity:** High
- **Purpose:** Check for vulnerable packages
- **Detects:** Known vulnerable dependencies
- **Recommendation:** Run `npm audit` and keep packages updated

### 11. `no-console-sensitive-data`
**Severity:** Medium
- **Purpose:** Prevent logging sensitive information
- **Detects:** Console logs of passwords, tokens, secrets
- **Recommendation:** Remove sensitive data from logs

---

## React Security Rules (10 Rules)

### 1. `xss-prevention`
**Severity:** Critical
- Prevent XSS attacks
- Detects dangerous patterns

### 2. `no-hardcoded-secrets`
**Severity:** Critical
- No hardcoded sensitive data in code

### 3. `dependency-vulnerabilities`
**Severity:** High
- Check for vulnerable npm packages

### 4. `secure-api-calls`
**Severity:** High
- Ensure HTTPS and authentication in API calls

### 5. `no-eval`
**Severity:** Critical
- Prevent eval() and dynamic code execution

### 6. `no-console-sensitive-data`
**Severity:** Medium
- Don't log sensitive information

### 7. `secure-localStorage`
**Severity:** High
- Don't store tokens in localStorage (use httpOnly cookies)

### 8. `input-validation`
**Severity:** High
- Validate and sanitize user input

### 9. `csp-compliance`
**Severity:** Medium
- Comply with Content Security Policy

### 10. `third-party-risk`
**Severity:** Medium
- Assess third-party dependencies for security

---

## Usage

### 1. Check Security for a Single File

```bash
# Using the MCP tool with VS Code extension
Tool: check-security
Input: filePath = /path/to/file.tsx
```

Result includes:
- All security violations found
- Rule-by-rule breakdown
- Security score (0-100)
- Recommendations for each issue

### 2. Scan Entire Project

```bash
Tool: check-security
Input: Leave filePath empty
```

Results show:
- Total files scanned
- Files with issues
- Summary of violations by severity
- Top 50 issues across the project

### 3. Manage Security Rules

```bash
Tool: manage-security-rules
Input: action = "list"
```

Available actions:
- `list` - See all enabled rules with descriptions
- `get-config` - Get full security configuration
- `enable` - Enable a specific rule by ID
- `disable` - Disable a specific rule by ID

Example:
```bash
Tool: manage-security-rules
Input: action = "disable", ruleId = "csp-headers"
```

---

## Customizing Security Rules

### Edit Security Configuration

To modify security rules for your project:

1. **Next.js Projects:** Edit [src/config/nextjs-llm-security-rules.json](src/config/nextjs-llm-security-rules.json)
2. **React Projects:** Edit [src/config/react-llm-security-rules.json](src/config/react-llm-security-rules.json)

### Add a New Rule

```json
{
  "id": "custom-rule-id",
  "title": "Custom Security Check",
  "intent": "Why this matters",
  "scope": "code",
  "severity": "high",
  "enabled": true,
  "detection": {
    "patterns": ["pattern1", "pattern2"]
  },
  "recommendation": "How to fix",
  "references": ["https://..."],
  "codeExample": {
    "bad": "bad code",
    "good": "good code"
  }
}
```

### Modify Detection Patterns

```json
"detection": {
  "patterns": [
    "process\\.env\\.(?!NEXT_PUBLIC_)",
    "hardcoded.*api.*key"
  ],
  "excludePatterns": ["*.test.*", "mock*"],
  "requirePatterns": ["validate"],
  "requireAbsence": ["eval"]
}
```

### Disable Rules Temporarily

Set `"enabled": false` in the rule:

```json
{
  "id": "csp-headers",
  "enabled": false
}
```

---

## Security Score Calculation

The security score is calculated as follows:

- **Base Score:** 100
- **Critical Violations:** -20 points each
- **High Violations:** -10 points each
- **Medium Violations:** -5 points each
- **Low Violations:** -2 points each
- **Minimum Score:** 0

**Example:** 2 critical + 1 high violation = 100 - 40 - 10 = **50/100**

---

## Framework Detection

The SecurityAnalyzer automatically detects your project framework:

- **Next.js** → Uses `nextjs-llm-security-rules.json`
- **React** → Uses `react-llm-security-rules.json`
- **Mixed** → Applies rules per file based on file type

---

## Best Practices

### 1. Regular Security Audits
```bash
# Run project-wide security check regularly
Tool: check-security
Leave filePath empty
```

### 2. Fix Critical Issues First
Focus on severity order:
1. Critical violations
2. High violations
3. Medium violations
4. Low violations

### 3. Review Rule Recommendations
Each rule includes:
- `recommendation` - Specific fix
- `codeExample.good` - Working example
- `references` - Additional resources

### 4. Tailor Rules to Your Project
- Disable inapplicable rules
- Adjust patterns for your coding standards
- Add custom rules for company policies

### 5. Integrate into CI/CD
Use the analyzer in your build pipeline to catch security issues before deployment.

---

## LLM-Specific Features

### For GitHub Copilot and Claude

All security rules include:
- **intent** - Why the rule matters
- **recommendation** - How to fix it
- **codeExample** - Good and bad patterns
- **references** - Learning resources

LLMs can use this information to:
- Provide contextual fixes
- Explain security implications
- Suggest improvements
- Generate secure code examples

---

## Example Output

```json
{
  "file": "src/app/page.tsx",
  "framework": "nextjs",
  "issues": [
    {
      "type": "error",
      "category": "security",
      "message": "[no-env-variable-exposure] Prevent Environment Variable Exposure: const apiKey = process.env.API_KEY",
      "line": 12,
      "code": "no-env-variable-exposure",
      "fix": "Only use environment variables prefixed with NEXT_PUBLIC_ on the client side..."
    }
  ],
  "securityScore": 85,
  "totalViolations": 2,
  "summary": "⚠ Security issues found: 1 critical, 1 warnings, 0 info (Score: 85/100)"
}
```

---

## Troubleshooting

### No Rules Loading
- Check framework detection: Run `manage-security-rules` with `action: "get-config"`
- Verify JSON syntax in rules file

### Pattern Not Matching
- Test regex patterns independently
- Check file paths and extensions
- Review exclude patterns

### Performance Issues
Large projects may take time to scan. To improve:
- Run on specific files instead of entire project
- Disable non-essential rules
- Increase timeout values

---

## Related Files

- [src/core/securityAnalyzer.ts](src/core/securityAnalyzer.ts) - Implementation
- [src/types/schema.ts](src/types/schema.ts#L140) - Type definitions
- [src/tools/index.ts](src/tools/index.ts) - Tool registration
- [README.md](../README.md) - Main documentation

---

**Version:** 2.0.0 (Config-driven)  
**Last Updated:** January 13, 2026
