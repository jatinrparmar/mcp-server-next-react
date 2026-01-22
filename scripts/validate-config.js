#!/usr/bin/env node

/**
 * CONFIG VALIDATION SCRIPT
 * Validates all simplified config files for correct format
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const CONFIG_DIR = './src/config';
const configFiles = [
  'simplified-security-rules-react.json',
  'simplified-security-rules-nextjs.json',
  'simplified-best-practices-rules-react.json',
  'simplified-best-practices-rules-nextjs.json',
  'simplified-accessibility-rules.json'
];

const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low'];
const VALID_CATEGORIES = ['security', 'best-practices', 'performance', 'accessibility', 'seo'];

let hasErrors = false;

console.log('\n🔍 Validating configuration files...\n');

for (const file of configFiles) {
  const filePath = path.join(CONFIG_DIR, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    continue;
  }

  console.log(`📋 Checking ${file}...`);

  try {
    const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!config.meta) {
      console.error(`  ❌ Missing 'meta' section`);
      hasErrors = true;
      continue;
    }

    if (!config.rules || !Array.isArray(config.rules)) {
      console.error(`  ❌ Missing 'rules' array`);
      hasErrors = true;
      continue;
    }

    let fileHasErrors = false;

    config.rules.forEach((rule, idx) => {
      const ruleNum = `Rule ${idx + 1}`;

      // Check required fields
      if (!rule.id) {
        console.error(`  ❌ ${ruleNum}: Missing 'id'`);
        fileHasErrors = true;
      }

      if (!rule.title) {
        console.error(`  ❌ ${ruleNum}: Missing 'title'`);
        fileHasErrors = true;
      }

      if (typeof rule.enabled !== 'boolean') {
        console.error(`  ❌ ${ruleNum} (${rule.id}): 'enabled' must be boolean`);
        fileHasErrors = true;
      }

      if (!VALID_SEVERITIES.includes(rule.severity)) {
        console.error(
          `  ❌ ${ruleNum} (${rule.id}): Invalid severity '${rule.severity}'. Must be: ${VALID_SEVERITIES.join(', ')}`
        );
        fileHasErrors = true;
      }

      if (!VALID_CATEGORIES.includes(rule.category)) {
        console.error(
          `  ❌ ${ruleNum} (${rule.id}): Invalid category '${rule.category}'. Must be: ${VALID_CATEGORIES.join(', ')}`
        );
        fileHasErrors = true;
      }

      if (!rule.recommendation || typeof rule.recommendation !== 'string') {
        console.error(`  ❌ ${ruleNum} (${rule.id}): Missing or invalid 'recommendation'`);
        fileHasErrors = true;
      }

      // Check optional fields
      if (rule.patterns && !Array.isArray(rule.patterns)) {
        console.error(`  ❌ ${ruleNum} (${rule.id}): 'patterns' must be an array`);
        fileHasErrors = true;
      }

      if (rule.excludePatterns && !Array.isArray(rule.excludePatterns)) {
        console.error(`  ❌ ${ruleNum} (${rule.id}): 'excludePatterns' must be an array`);
        fileHasErrors = true;
      }

      if (rule.codeExample) {
        if (!rule.codeExample.bad || !rule.codeExample.good) {
          console.error(`  ❌ ${ruleNum} (${rule.id}): 'codeExample' must have 'bad' and 'good' fields`);
          fileHasErrors = true;
        }
      }
    });

    if (!fileHasErrors) {
      console.log(`  ✅ Valid (${config.rules.length} rules)`);
    } else {
      hasErrors = true;
    }
  } catch (error) {
    console.error(`  ❌ Parse error: ${error.message}`);
    hasErrors = true;
  }
}

console.log('');

if (hasErrors) {
  console.error('❌ Validation failed. Please fix the errors above.\n');
  process.exit(1);
} else {
  console.log('✅ All configuration files are valid!\n');
  process.exit(0);
}
