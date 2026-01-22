# QUICK REFERENCE: Configuration System

## The Golden Rule

```
Edit src/config/ → Run npm run generate:rules → Rules auto-update
```

**Don't edit `src/rules/` directly - they auto-generate!**

---

## Three Steps to Modify Rules

### Step 1: Edit Config

Open one of the framework-specific config files:

**React:**
- `src/config/simplified-security-rules-react.json`
- `src/config/simplified-best-practices-rules-react.json`

**Next.js:**
- `src/config/simplified-security-rules-nextjs.json`
- `src/config/simplified-best-practices-rules-nextjs.json`

**Shared (both frameworks):**
- `src/config/simplified-accessibility-rules.json`

Make your changes to a rule:

```json
{
  "id": "my-rule",
  "title": "Rule Title",
  "enabled": true,
  "severity": "high",
  "category": "security",
  "patterns": ["pattern1", "pattern2"],
  "recommendation": "How to fix this",
  "codeExample": {
    "bad": "bad code",
    "good": "good code"
  }
}
```

### Step 2: Generate Rules

```bash
npm run generate:rules
```

### Step 3: Commit Changes

```bash
git add src/config/
git commit -m "Update rules: description"
```

---

## Common Commands

| Task | Command |
|------|---------|
| Add a new rule | Edit config file + `npm run generate:rules` |
| Enable/disable rule | Change `enabled: true/false` + `npm run generate:rules` |
| Change severity | Update `severity` field + `npm run generate:rules` |
| Update recommendation | Edit `recommendation` text + `npm run generate:rules` |
| Update patterns | Add/remove from `patterns` array + `npm run generate:rules` |
| Validate syntax | `npm run lint:config` |
| Test rules | `npm run test:rules` |

---

## Rule Field Quick Guide

```json
{
  // 🔴 REQUIRED
  "id": "unique-id",                    // kebab-case identifier
  "title": "Rule Name",                 // User-friendly title
  "enabled": true,                      // Is it active?
  "severity": "high",                   // critical|high|medium|low
  "category": "security",               // security|best-practices|performance|accessibility|seo
  "recommendation": "How to fix...",    // Plain English fix

  // 🟡 OPTIONAL
  "patterns": ["regex1", "regex2"],                    // Code patterns to detect
  "excludePatterns": ["*.test.ts"],                    // Patterns to skip
  "codeExample": { "bad": "...", "good": "..." }     // Examples
}
```

---

## Severity Levels

- **CRITICAL** 🔴🔴🔴: Security vulnerabilities, data loss, breaks functionality
- **HIGH** 🔴🔴: Important issues, potential vulnerabilities
- **MEDIUM** 🔴: Best practice violations, performance concerns
- **LOW** ⚪: Code style, documentation, minor improvements

---

## Categories

- **security**: Vulnerabilities, authentication, data protection
- **best-practices**: Code quality, patterns, standards
- **performance**: Optimization, bundle size, speed
- **accessibility**: WCAG compliance, inclusive design
- **seo**: Search engine optimization

---

## Example: Add a New Security Rule

### 1. Edit `src/config/simplified-security-rules.json`

```json
{
  "rules": [
    // ... existing rules ...
    
    {
      "id": "jwt-validation",
      "title": "Validate JWT Tokens",
      "enabled": true,
      "severity": "critical",
      "category": "security",
      "recommendation": "Always verify JWT tokens are valid and not expired before using claims",
      "codeExample": {
        "bad": "const user = jwt.decode(token);  // No verification!",
        "good": "const user = jwt.verify(token, process.env.JWT_SECRET);"
      }
    }
  ]
}
```

### 2. Run Generator

```bash
npm run generate:rules
```

### 3. Done! 🎉

Check generated rule:
```bash
cat src/rules/security-rules.json | jq '.securityRules[] | select(.id == "jwt-validation")'
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Patterns not detecting code | Test regex at regex101.com; check file types |
| Too many false positives | Use `excludePatterns` or make pattern more specific |
| "npm: command not found" | Run `npm run generate:rules` from project root |
| Generated rules are old | Delete `src/rules/*.json` and regenerate |
| Config won't parse | Check JSON syntax, use online JSON validator |

---

## What Gets Generated

Your config:
```json
{
  "id": "xss-prevention",
  "title": "Prevent XSS",
  "enabled": true,
  "severity": "critical",
  "category": "security",
  "patterns": ["dangerouslySetInnerHTML"],
  "recommendation": "Use React escaping..."
}
```

Becomes LLM-ready rule with:
```json
{
  // Your data
  "id": "xss-prevention",
  "title": "Prevent XSS",
  ...
  // Auto-generated for LLM
  "confidence": "high",
  "falsePositives": "low",
  "detectionExplanation": "...",
  "remediationExplanation": "...",
  "detectionLimitations": "...",
  "additionalNotes": "..."
}
```

---

## Keep This Nearby

Print this card and keep it at your desk!

```
┌─────────────────────────────────────┐
│  Edit → Generate → Done             │
│                                     │
│  1. Edit config/simplified-*.json   │
│  2. npm run generate:rules          │
│  3. Rules auto-update ✅            │
│                                     │
│  Never edit src/rules/ directly!    │
└─────────────────────────────────────┘
```

---

## For More Help

- **Setup Guide**: `docs/DEVELOPER_CONFIG_GUIDE.md`
- **Rule Descriptions**: `docs/RULES_REFERENCE.md` (coming soon)
- **Common Issues**: `docs/TROUBLESHOOTING.md` (coming soon)
