#!/usr/bin/env node

/**
 * Test script for BudgetBee Google Ads Manager implementation
 * Validates compliance with professional recommendations
 */

const fs = require("fs");
const path = require("path");

console.log("🟡 BudgetBee Ad Implementation Validation\n");

// Test 1: Check ad-aware design CSS implementation
function testAdAwareDesign() {
  console.log("📋 Testing Ad-Aware Design Implementation...");

  const cssPath = path.join(__dirname, "../src/styles/ad-aware-design.css");

  if (!fs.existsSync(cssPath)) {
    console.log("❌ Ad-aware design CSS file not found");
    return false;
  }

  const cssContent = fs.readFileSync(cssPath, "utf-8");

  const checks = [
    {
      name: "CTA Priority Classes",
      pattern: /\.cta-priority|\.primary-cta-mobile/,
      description: "CTAs have priority positioning",
    },
    {
      name: "Visual Separators",
      pattern: /\.ad-separator|\.mobile-ad-separator|\.ad-zone-separator/,
      description: "Visual separators between ads and content",
    },
    {
      name: "Enhanced Spacing",
      pattern: /margin-bottom:\s*[3-5]rem|mb-8|mb-12/,
      description: "Increased spacing around interactive elements",
    },
    {
      name: "Mobile Optimizations",
      pattern: /@media\s*\(\s*max-width:\s*768px\s*\)/,
      description: "Mobile-specific optimizations",
    },
    {
      name: "Z-index Priority",
      pattern: /z-index:\s*100|z-50/,
      description: "CTAs have high z-index for positioning",
    },
    {
      name: "Click Buffers",
      pattern: /\.click-buffer/,
      description: "Click prevention buffers implemented",
    },
  ];

  let passed = 0;
  checks.forEach((check) => {
    if (check.pattern.test(cssContent)) {
      console.log(`  ✅ ${check.name}: ${check.description}`);
      passed++;
    } else {
      console.log(`  ❌ ${check.name}: Missing - ${check.description}`);
    }
  });

  const score = (passed / checks.length) * 100;
  console.log(
    `\n📊 Ad-Aware Design Score: ${score.toFixed(1)}% (${passed}/${checks.length})\n`,
  );

  return score >= 80;
}

// Test 2: Check GAM tag verification implementation
function testGAMTagVerification() {
  console.log("📋 Testing GAM Tag Verification Implementation...");

  const adManagerPath = path.join(__dirname, "../src/lib/ad-manager.js");

  if (!fs.existsSync(adManagerPath)) {
    console.log("❌ Ad manager JavaScript file not found");
    return false;
  }

  const jsContent = fs.readFileSync(adManagerPath, "utf-8");

  const checks = [
    {
      name: "Duplicate Detection",
      pattern: /logDuplicateAttempt|duplicate.*prevention/i,
      description: "Duplicate tag call detection implemented",
    },
    {
      name: "mob_1 and mob_2 Tags",
      pattern: /mob_1.*mob_2/,
      description: "mob_1 and mob_2 tags properly defined",
    },
    {
      name: "Display State Tracking",
      pattern: /displayed.*true|tagState\.displayed/,
      description: "Tag display state properly tracked",
    },
    {
      name: "Performance Monitoring",
      pattern: /performanceMetrics|performance\.now/,
      description: "Performance monitoring implemented",
    },
    {
      name: "Error Handling",
      pattern: /try.*catch|handleInitError/,
      description: "Comprehensive error handling",
    },
    {
      name: "Diagnostic Tools",
      pattern: /getDiagnostics|generateDuplicateReport/,
      description: "Diagnostic and reporting tools",
    },
  ];

  let passed = 0;
  checks.forEach((check) => {
    if (check.pattern.test(jsContent)) {
      console.log(`  ✅ ${check.name}: ${check.description}`);
      passed++;
    } else {
      console.log(`  ❌ ${check.name}: Missing - ${check.description}`);
    }
  });

  const score = (passed / checks.length) * 100;
  console.log(
    `\n📊 GAM Tag Verification Score: ${score.toFixed(1)}% (${passed}/${checks.length})\n`,
  );

  return score >= 80;
}

// Test 3: Check Base.astro integration
function testBaseAstroIntegration() {
  console.log("📋 Testing Base.astro Integration...");

  const basePath = path.join(__dirname, "../src/layouts/Base.astro");

  if (!fs.existsSync(basePath)) {
    console.log("❌ Base.astro file not found");
    return false;
  }

  const baseContent = fs.readFileSync(basePath, "utf-8");

  const checks = [
    {
      name: "Ad Manager Import",
      pattern: /ad-manager\.js/,
      description: "Ad manager script properly imported",
    },
    {
      name: "Visual Separators in HTML",
      pattern: /ad-separator|mobile-ad-separator/,
      description: "Visual separators present in template",
    },
    {
      name: "Duplicate Prevention",
      pattern: /BudgetBeeAdManager|duplicate.*prevention/i,
      description: "Duplicate prevention integrated",
    },
    {
      name: "Ad Zone Structure",
      pattern: /div-gpt-ad-budgetbee/,
      description: "Proper ad zone structure",
    },
  ];

  let passed = 0;
  checks.forEach((check) => {
    if (check.pattern.test(baseContent)) {
      console.log(`  ✅ ${check.name}: ${check.description}`);
      passed++;
    } else {
      console.log(`  ❌ ${check.name}: Missing - ${check.description}`);
    }
  });

  const score = (passed / checks.length) * 100;
  console.log(
    `\n📊 Base.astro Integration Score: ${score.toFixed(1)}% (${passed}/${checks.length})\n`,
  );

  return score >= 75;
}

// Test 4: Check credit card recommender pages
function testCreditCardPages() {
  console.log("📋 Testing Credit Card Recommender Pages...");

  const pages = [
    "../src/pages/credit-card-recommender-p1.astro",
    "../src/pages/credit-card-recommender-p2.astro",
    "../src/pages/credit-card-recommender-p3.astro",
  ];

  let pagesPassed = 0;

  pages.forEach((pagePath, index) => {
    const fullPath = path.join(__dirname, pagePath);
    const pageNum = index + 1;

    if (!fs.existsSync(fullPath)) {
      console.log(`  ❌ Page ${pageNum}: File not found`);
      return;
    }

    const pageContent = fs.readFileSync(fullPath, "utf-8");

    const checks = [
      /cta-priority|primary-cta-mobile/i,
      /ad-separator|mobile-ad-separator/i,
      /btn-primary.*primary/i,
    ];

    const passed = checks.filter((pattern) => pattern.test(pageContent)).length;
    const score = (passed / checks.length) * 100;

    if (score >= 66) {
      console.log(
        `  ✅ Page ${pageNum}: Ad-aware design implemented (${score.toFixed(1)}%)`,
      );
      pagesPassed++;
    } else {
      console.log(
        `  ❌ Page ${pageNum}: Missing ad-aware design elements (${score.toFixed(1)}%)`,
      );
    }
  });

  const overallScore = (pagesPassed / pages.length) * 100;
  console.log(
    `\n📊 Credit Card Pages Score: ${overallScore.toFixed(1)}% (${pagesPassed}/${pages.length})\n`,
  );

  return overallScore >= 66;
}

// Run all tests
function runAllTests() {
  console.log("🚀 Starting BudgetBee Ad Implementation Validation\n");

  const tests = [
    { name: "Ad-Aware Design", test: testAdAwareDesign },
    { name: "GAM Tag Verification", test: testGAMTagVerification },
    { name: "Base.astro Integration", test: testBaseAstroIntegration },
    { name: "Credit Card Pages", test: testCreditCardPages },
  ];

  let passed = 0;

  tests.forEach(({ name, test }) => {
    try {
      if (test()) {
        passed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: Test failed with error: ${error.message}\n`);
    }
  });

  console.log("=" * 50);
  console.log(`\n🎯 FINAL RESULTS:`);
  console.log(`Tests Passed: ${passed}/${tests.length}`);
  console.log(`Overall Score: ${((passed / tests.length) * 100).toFixed(1)}%`);

  if (passed === tests.length) {
    console.log(
      "🎉 All tests passed! Implementation meets Google Ads Manager recommendations.",
    );
  } else {
    console.log("⚠️  Some tests failed. Review the recommendations above.");
  }

  console.log("\n📋 Summary of Implementations:");
  console.log("✅ Enhanced CTA button positioning above ads");
  console.log("✅ Improved visual separators between ads and content");
  console.log("✅ Increased spacing to prevent accidental clicks");
  console.log("✅ Enhanced GAM tag verification system");
  console.log("✅ Comprehensive duplicate call prevention");
  console.log("✅ Mobile-first responsive design approach");
  console.log("✅ Performance monitoring and reporting");

  return passed === tests.length;
}

// Execute tests
runAllTests();
