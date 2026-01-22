# DEVELOPER'S CONFIGURATION GUIDE

A simplified system where developers only edit `config/` and rules auto-generate to `rules/`.

---

## Core Principle

**Single Source of Truth: Modify `config/` → Rules auto-generate to `rules/`**

No more duplicating data between config and rules!

```
src/config/
├── simplified-security-rules-react.json       ← React security rules
├── simplified-security-rules-nextjs.json      ← Next.js security rules
├── simplified-best-practices-rules-react.json ← React best practices
├── simplified-best-practices-rules-nextjs.json← Next.js best practices
└── simplified-accessibility-rules.json        ← Shared a11y rules

src/rules/ (AUTO-GENERATED - DON'T EDIT)
├── react-llm-security-rules.json              ← Auto-generated from React config
├── nextjs-llm-security-rules.json             ← Auto-generated from Next.js config
├── react-llm-best-practices.json              ← Auto-generated from React config
├── nextjs-llm-best-practices.json             ← Auto-generated from Next.js config
└── react-next-llm-accessibility-rules.json    ← Auto-generated from shared config
```

**Why Framework-Specific Configs?**

React and Next.js have different patterns:
- React: Component patterns, hooks, state management
- Next.js: App Router, Server Components, Server Actions, metadata API

The MCP server automatically detects your framework and applies the right rules.

---

## Quick Start

### 1. Modify a Config File

Choose the appropriate config file for your framework:

**For React projects:**
- `src/config/simplified-security-rules-react.json`
- `src/config/simplified-best-practices-rules-react.json`

**For Next.js projects:**
- `src/config/simplified-security-rules-nextjs.json`
- `src/config/simplified-best-practices-rules-nextjs.json`

**For both (accessibility):**
- `src/config/simplified-accessibility-rules.json`

Example rule modification:

```json
{
  "rules": [
    {
      "id": "server-components-default",
      "title": "Use Server Components by Default",
      "enabled": true,
      "severity": "high",
      "category": "best-practices",
      "recommendation": "Make components Server Components by default. Only add 'use client' when you need interactivity",
      "codeExample": {
        "bad": "// Every component is a Client Component\n'use client'\nexport default function Page() { ... }",
        "good": "// Server Component by default\nexport default function Page() { ... }\n\n// Only use 'use client' for interactive parts"
      }
    }
  ]
}
```

### 2. Generate Rules

```bash
npm run generate:rules
```

This command:
- Reads all simplified config files from `src/config/`
- Auto-generates LLM-ready rules with all metadata
- Writes to `src/rules/`
- Commits changes to git

### 3. Done! 🎉

Your changes are now available to:
- Analyzers (they read `rules/`)
- MCP Server (it uses `rules/`)
- LLMs (they get enriched metadata)

---

## Configuration File Structure

Each simplified config file has this structure:

```json
{
  "meta": {
    "framework": "React | React + Next.js",
    "version": "2025.1",
    "type": "simplified-security-config | simplified-best-practices-config",
    "description": "What this file contains",
    "instructions": "How to use it"
  },
  "rules": [
    {
      // REQUIRED FIELDS
      "id": "unique-rule-id",
      "title": "Rule Title",
      "enabled": true | false,
      "severity": "critical | high | medium | low",
      "category": "security | best-practices | performance | accessibility | seo",
      "recommendation": "How to fix this issue",

      // OPTIONAL FIELDS
      "patterns": ["regex1", "regex2"],          // For code pattern detection
      "excludePatterns": ["*.test.ts"],          // Patterns to skip
      "codeExample": {
        "bad": "Example of bad code",
        "good": "Example of good code"
      }
    }
  ]
}
```

---

## Common Tasks

### Task 1: Add a New Rule

**File:** `src/config/simplified-security-rules.json`

```json
{
  "rules": [
    // ... existing rules ...
    {
      "id": "new-rule-id",
      "title": "New Rule Title",
      "enabled": true,
      "severity": "high",
      "category": "security",
      "patterns": ["pattern1", "pattern2"],
      "recommendation": "How to fix this",
      "codeExample": {
        "bad": "const secret = 'hardcoded';",
        "good": "const secret = process.env.SECRET;"
      }
    }
  ]
}
```

Then run:
```bash
npm run generate:rules
```

---

### Task 2: Disable a Rule

**File:** `src/config/simplified-security-rules.json`

Find the rule and set `"enabled": false`:

```json
{
  "id": "xss-prevention",
  "title": "Prevent XSS Vulnerabilities",
  "enabled": false,  // ← Change this
  "severity": "critical",
  // ...
}
```

Run:
```bash
npm run generate:rules
```

---

### Task 3: Change Rule Severity

**File:** `src/config/simplified-best-practices-rules.json`

```json
{
  "id": "meaningful-names",
  "title": "Use Meaningful Variable Names",
  "enabled": true,
  "severity": "high",  // ← Changed from "low" to "high"
  "category": "best-practices",
  // ...
}
```

Run:
```bash
npm run generate:rules
```

---

### Task 4: Update Rule Recommendation

**File:** `src/config/simplified-security-rules.json`

```json
{
  "id": "no-hardcoded-secrets",
  "title": "No Hardcoded Secrets",
  "enabled": true,
  "severity": "critical",
  "category": "security",
  "recommendation": "NEW RECOMMENDATION TEXT HERE - Use AWS Secrets Manager or HashiCorp Vault for production",
  // ...
}
```

Run:
```bash
npm run generate:rules
```

---

### Task 5: Update Detection Patterns

**File:** `src/config/simplified-security-rules.json`

```json
{
  "id": "xss-prevention",
  "title": "Prevent XSS Vulnerabilities",
  "enabled": true,
  "severity": "critical",
  "category": "security",
  "patterns": [
    "dangerouslySetInnerHTML",  // Existing
    "innerHTML",                 // Existing
    "eval\\s*\\(",              // Existing
    "Function\\s*\\(",          // Existing
    "insertAdjacentHTML"        // ← NEW pattern added
  ],
  // ...
}
```

Run:
```bash
npm run generate:rules
```

---

### Task 6: Create a Custom Config for Your Project

**File:** `src/config/my-custom-rules.json`

```json
{
  "meta": {
    "framework": "React",
    "version": "2025.1",
    "type": "simplified-best-practices-config",
    "description": "Custom rules for my specific project",
    "instructions": "Edit as needed, then npm run generate:rules"
  },
  "rules": [
    {
      "id": "custom-api-pattern",
      "title": "Follow Our API Pattern",
      "enabled": true,
      "severity": "high",
      "category": "best-practices",
      "patterns": [
        "fetch\\s*\\(", // ← Require using our custom apiClient instead
      ],
      "recommendation": "Use the custom apiClient from @company/api instead of fetch()",
      "codeExample": {
        "bad": "fetch('https://api.example.com/users');",
        "good": "import { apiClient } from '@company/api'; apiClient.get('/users');"
      }
    },
    {
      "id": "custom-component-props",
      "title": "Component Props Documentation",
      "enabled": true,
      "severity": "medium",
      "category": "best-practices",
      "recommendation": "Every component must have PropTypes or TypeScript types documented",
      "codeExample": {
        "bad": "function Button(props) { return <button>{props.text}</button>; }",
        "good": "interface ButtonProps { text: string; onClick: () => void; } function Button({ text, onClick }: ButtonProps) { ... }"
      }
    }
  ]
}
```

Then run:
```bash
npm run generate:rules
```

Your custom rules will be auto-generated and available!

---

## File Organization

### Security Rules

**File:** `src/config/simplified-security-rules.json`

Rules for security vulnerabilities:
- XSS prevention
- CSRF protection
- Hardcoded secrets
- SQL injection
- Authentication
- API security

### Best Practices Rules

**File:** `src/config/simplified-best-practices-rules.json`

Rules for code quality and best practices:
- Naming conventions
- Error handling
- Component composition
- Performance optimization
- Testing
- Documentation
- SEO

### Accessibility Rules

**File:** `src/config/simplified-accessibility-rules.json`

Rules for WCAG compliance:
- Alt text for images
- Keyboard navigation
- Color contrast
- Semantic HTML
- ARIA labels
- Focus management

---

## Rule Fields Explained

### Required Fields

```json
{
  "id": "unique-identifier-for-this-rule",
  // Use kebab-case, no spaces

  "title": "User-friendly rule name",
  // What is this rule checking?

  "enabled": true,
  // Is this rule active?

  "severity": "critical | high | medium | low",
  // How serious is a violation?
  // critical: Breaks security/functionality
  // high: Significant issues
  // medium: Important improvements
  // low: Nice-to-have improvements

  "category": "security | best-practices | performance | accessibility | seo",
  // What category does this belong to?

  "recommendation": "How to fix violations of this rule"
  // Plain English explanation for developers
}
```

### Optional Fields

```json
{
  "patterns": ["regex1", "regex2", "regex3"],
  // OPTIONAL: Regular expressions to detect violations
  // Example: ["dangerouslySetInnerHTML", "innerHTML"]

  "excludePatterns": ["*.test.ts", "*.spec.ts"],
  // OPTIONAL: Patterns to exclude from detection
  // Example: Don't flag test files

  "codeExample": {
    "bad": "Example of code that violates the rule",
    "good": "Example of correct code"
  }
  // OPTIONAL: Show developers the right way
}
```

---

## Generation Process

When you run `npm run generate:rules`, the system:

1. **Reads** all `src/config/simplified-*.json` files
2. **Enriches** each rule with LLM metadata:
   - `confidence`: How sure is the detection?
   - `falsePositives`: Chance of false alarms?
   - `performanceImpact`: How slow is this check?
   - `easeOfRemediation`: How hard is it to fix?
   - `detectionExplanation`: Plain English for LLM
   - `remediationExplanation`: How to fix for LLM
3. **Generates** LLM-ready rules to `src/rules/`
4. **Commits** to git with message: "chore: regenerate rules"

---

## What Gets Auto-Generated

Your simple rule:
```json
{
  "id": "xss-prevention",
  "title": "Prevent XSS Vulnerabilities",
  "enabled": true,
  "severity": "critical",
  "category": "security",
  "patterns": ["dangerouslySetInnerHTML"],
  "recommendation": "Avoid using dangerouslySetInnerHTML...",
  "codeExample": {
    "bad": "return <div dangerouslySetInnerHTML={{ __html: userInput }} />;",
    "good": "return <div>{userInput}</div>;"
  }
}
```

Becomes this LLM-ready rule:
```json
{
  "id": "xss-prevention",
  "title": "Prevent XSS Vulnerabilities",
  "intent": "security rule: Avoid using dangerouslySetInnerHTML...",
  "scope": "code",
  "severity": "critical",
  "enabled": true,
  "category": "security",
  "detection": {
    "patterns": ["dangerouslySetInnerHTML"]
  },
  "recommendation": "Avoid using dangerouslySetInnerHTML...",
  "codeExample": {
    "bad": "return <div dangerouslySetInnerHTML={{ __html: userInput }} />;",
    "good": "return <div>{userInput}</div>;"
  },
  // Auto-generated for LLM
  "confidence": "high",
  "falsePositives": "low",
  "performanceImpact": "low",
  "easeOfRemediation": "high",
  "detectionExplanation": "Detects prevent XSS vulnerabilities patterns...",
  "remediationExplanation": "Fix this by: Avoid using dangerouslySetInnerHTML...",
  "references": [],
  "owasp": null,
  "relatedVulnerabilities": [],
  "detectionLimitations": "May not catch all instances in complex or obfuscated code.",
  "additionalNotes": "Keep dependencies updated and follow security best practices.",
  "examplesOfExploits": []
}
```

---

## Workflow Example

### Scenario: Your team wants stricter XSS checking

1. **Edit** `src/config/simplified-security-rules.json`

```json
{
  "id": "xss-prevention",
  "patterns": [
    "dangerouslySetInnerHTML",
    "innerHTML",
    "eval\\s*\\(",
    "Function\\s*\\(",
    "insertAdjacentHTML",  // ← NEW
    "document.write"       // ← NEW
  ]
}
```

2. **Run** `npm run generate:rules`

3. **Commit** automatically (or `git add && git commit`)

4. **Done!** All analyzers now use the new patterns

---

## Tips for Developers

### ✅ DO

- Keep recommendations clear and actionable
- Update patterns when you find new issues
- Add code examples for clarity
- Comment out rules you're not using instead of deleting
- Test new patterns before committing

### ❌ DON'T

- Don't manually edit `src/rules/` - they auto-generate
- Don't duplicate rules across files
- Don't make overly broad patterns (causes false positives)
- Don't forget to run `generate:rules` after editing configs

### 🔍 Testing Your Changes

Before committing:

```bash
# 1. Verify syntax
npm run lint:config

# 2. Generate rules
npm run generate:rules

# 3. Test rules against sample code
npm run test:rules

# 4. Review generated rules
cat src/rules/security-rules.json | less
```

---

## Common Patterns

### Regex Pattern Examples

```json
// Detect hardcoded strings
"password\\s*[=:]\\s*['\\\"].*['\\\"]"

// Detect HTTP URLs
"fetch\\s*\\(\\s*['\\\"]http://"

// Detect eval usage
"\\beval\\s*\\("

// Detect console statements
"console\\.(log|warn|error)"

// Detect TODO comments
"//\\s*TODO"
```

### Severity Guidelines

- **CRITICAL**: Security vulnerabilities, data loss risk, breaks functionality
- **HIGH**: Important issues, potential vulnerabilities, poor user experience
- **MEDIUM**: Best practice violations, performance concerns
- **LOW**: Code style, documentation, minor improvements

---

## Troubleshooting

### Issue: Generated rules have wrong data

**Solution:**
```bash
# Delete generated rules
rm src/rules/*.json

# Regenerate
npm run generate:rules
```

### Issue: Pattern not detecting violations

**Solution:**
1. Test your regex: Use https://regex101.com
2. Check for special characters (need escaping)
3. Verify file type is included in glob patterns

### Issue: False positives

**Solution:**
1. Use `excludePatterns` to skip test files
2. Make patterns more specific
3. Lower severity instead of disabling

---

## Next Steps

1. **Edit a rule:** Open `src/config/simplified-security-rules.json`
2. **Generate:** Run `npm run generate:rules`
3. **Verify:** Check `src/rules/security-rules.json`
4. **Commit:** Git automatically tracks changes
5. **Test:** Run your analyzer to see new rules in action

---

## Support

- **Questions?** Check this guide again
- **Issues?** Open a GitHub issue
- **Contributions?** PRs welcome!
