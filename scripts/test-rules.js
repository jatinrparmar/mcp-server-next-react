#!/usr/bin/env node

/**
 * RULES TESTING SCRIPT
 * Tests generated rules against sample code
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const RULES_DIR = './src/rules';
const TEST_FILES_DIR = './test-files';

console.log('\n🧪 Testing generated rules...\n');

// Check if rules directory exists
if (!fs.existsSync(RULES_DIR)) {
  console.error('❌ Rules directory not found. Run: npm run generate:rules\n');
  process.exit(1);
}

// Check if test files directory exists
if (!fs.existsSync(TEST_FILES_DIR)) {
  console.log('ℹ️  No test files found. Skipping tests.\n');
  console.log('To add tests, create sample code files in ./test-files/\n');
  process.exit(0);
}

const ruleFiles = fs.readdirSync(RULES_DIR).filter(f => f.endsWith('.json'));

if (ruleFiles.length === 0) {
  console.error('❌ No rule files found. Run: npm run generate:rules\n');
  process.exit(1);
}

console.log(`📋 Found ${ruleFiles.length} rule files:\n`);

let totalRules = 0;
let enabledRules = 0;
let testsPassed = true;

for (const ruleFile of ruleFiles) {
  const filePath = path.join(RULES_DIR, ruleFile);
  const content = fs.readFileSync(filePath, 'utf-8');

  try {
    const ruleData = JSON.parse(content);

    // Get rules array (different file types have different structure)
    let rules = [];
    if (ruleData.securityRules) {
      rules = ruleData.securityRules;
    } else if (ruleData.bestPracticeRules) {
      rules = ruleData.bestPracticeRules;
    } else if (ruleData.accessibilityRules) {
      rules = ruleData.accessibilityRules;
    }

    totalRules += rules.length;
    enabledRules += rules.filter(r => r.enabled).length;

    console.log(`✅ ${ruleFile}`);
    console.log(`   Total: ${rules.length} | Enabled: ${rules.filter(r => r.enabled).length}`);

    // Validate each rule has required LLM fields
    for (const rule of rules) {
      const missingFields = [];

      const requiredFields = [
        'id',
        'title',
        'severity',
        'enabled',
        'recommendation',
        'detectionExplanation',
        'remediationExplanation'
      ];

      for (const field of requiredFields) {
        if (!(field in rule)) {
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        console.error(`   ❌ Rule '${rule.id}' missing fields: ${missingFields.join(', ')}`);
        testsPassed = false;
      }

      // Validate patterns if they exist
      if (rule.detection && rule.detection.patterns) {
        for (const pattern of rule.detection.patterns) {
          try {
            new RegExp(pattern);
          } catch (e) {
            console.error(`   ❌ Rule '${rule.id}' has invalid regex pattern: ${pattern}`);
            testsPassed = false;
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error parsing ${ruleFile}: ${error.message}`);
    testsPassed = false;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Total Rules: ${totalRules}`);
console.log(`   Enabled: ${enabledRules}`);
console.log(`   Disabled: ${totalRules - enabledRules}`);
console.log('');

if (testsPassed) {
  console.log('✅ All rules are valid!\n');
  process.exit(0);
} else {
  console.log('❌ Some rules have issues. Please fix them.\n');
  process.exit(1);
}
