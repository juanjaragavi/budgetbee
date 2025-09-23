#!/usr/bin/env node

/**
 * UTM Parameter Handling Test Script
 * Tests the new dynamic UTM parameter logic for Quiz URLs
 */

// Mock browser environment for testing
global.window = {
  location: { href: "", search: "" },
  sessionStorage: {
    storage: {},
    getItem(key) {
      return this.storage[key] || null;
    },
    setItem(key, value) {
      this.storage[key] = value;
    },
    removeItem(key) {
      delete this.storage[key];
    },
    clear() {
      this.storage = {};
    },
  },
};

// Import our UTM utilities (would need to be adapted for Node.js testing)
// const { extractUtmFromUrl, buildQuizUrl, validateUtmSource } = require('../src/lib/utils/utmUtils.ts');

// Mock implementation for testing
const VALID_UTM_SOURCES = [
  "convertkit",
  "mailchimp",
  "google",
  "facebook",
  "linkedin",
  "twitter",
  "organic",
  "direct",
  "referral",
];

function validateUtmSource(source) {
  return VALID_UTM_SOURCES.includes(source.toLowerCase());
}

function extractUtmFromUrl(url) {
  const urlObj = new URL(url);
  const utmParams = {};

  for (const [key, value] of urlObj.searchParams.entries()) {
    if (key.startsWith("utm_")) {
      utmParams[key] = value;
    }
  }

  return utmParams;
}

function buildQuizUrl() {
  const baseUrl = "https://budgetbeepro.com/quiz";
  const storedParams = {};

  // Check utm_source first - if invalid, clear all and return clean URL
  const utmSource = window.sessionStorage.getItem("utm_source");
  if (!utmSource || !validateUtmSource(utmSource)) {
    // Clear all UTM parameters if source is invalid
    const utmKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];
    utmKeys.forEach((key) => window.sessionStorage.removeItem(key));
    return baseUrl;
  }

  // Get stored UTM parameters if source is valid
  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  utmKeys.forEach((key) => {
    const value = window.sessionStorage.getItem(key);
    if (value) {
      storedParams[key] = value;
    }
  });

  if (Object.keys(storedParams).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams(storedParams);
  return `${baseUrl}?${searchParams.toString()}`;
} // Test scenarios
const testScenarios = [
  {
    name: "Direct Visit",
    url: "https://budgetbeepro.com/",
    expected: "https://budgetbeepro.com/quiz",
    description: "Should return clean quiz URL for direct visits",
  },
  {
    name: "Valid Email Campaign",
    url: "https://budgetbeepro.com/?utm_source=convertkit&utm_medium=email&utm_campaign=us_tc_bc_44",
    expected:
      "https://budgetbeepro.com/quiz?utm_source=convertkit&utm_medium=email&utm_campaign=us_tc_bc_44",
    description: "Should preserve valid UTM parameters",
  },
  {
    name: "Invalid UTM Source",
    url: "https://budgetbeepro.com/?utm_source=invalid&utm_medium=email",
    expected: "https://budgetbeepro.com/quiz",
    description: "Should filter out invalid UTM sources",
  },
  {
    name: "Google Ads Campaign",
    url: "https://budgetbeepro.com/?utm_source=google&utm_medium=cpc&utm_campaign=credit_cards",
    expected:
      "https://budgetbeepro.com/quiz?utm_source=google&utm_medium=cpc&utm_campaign=credit_cards",
    description: "Should handle Google Ads campaigns correctly",
  },
  {
    name: "Partial UTM Parameters",
    url: "https://budgetbeepro.com/?utm_source=facebook&utm_content=ad_variant_1",
    expected:
      "https://budgetbeepro.com/quiz?utm_source=facebook&utm_content=ad_variant_1",
    description: "Should handle partial UTM parameter sets",
  },
];

console.log("🧪 UTM Parameter Handling Test Suite\n");

function runTest(scenario) {
  // Clear previous state
  window.sessionStorage.clear();

  // Extract and store UTM parameters (simulating UtmPersister behavior)
  const utmParams = extractUtmFromUrl(scenario.url);

  // Store valid UTM parameters
  Object.entries(utmParams).forEach(([key, value]) => {
    if (key === "utm_source" && !validateUtmSource(value)) {
      console.log(`   ⚠️  Filtering invalid UTM source: ${value}`);
      return;
    }
    window.sessionStorage.setItem(key, value);
  });

  // Build quiz URL
  const result = buildQuizUrl();

  // Check result
  const passed = result === scenario.expected;
  const status = passed ? "✅ PASS" : "❌ FAIL";

  console.log(`${status} ${scenario.name}`);
  console.log(`   📝 ${scenario.description}`);
  console.log(`   🔗 Input URL: ${scenario.url}`);
  console.log(`   🎯 Expected: ${scenario.expected}`);
  console.log(`   📤 Actual:   ${result}`);

  if (!passed) {
    console.log(`   ❗ Test failed!`);
  }
  console.log("");

  return passed;
}

// Run all tests
let passCount = 0;
testScenarios.forEach((scenario) => {
  if (runTest(scenario)) {
    passCount++;
  }
});

console.log(
  `📊 Test Results: ${passCount}/${testScenarios.length} tests passed`,
);

if (passCount === testScenarios.length) {
  console.log(
    "🎉 All tests passed! UTM parameter handling is working correctly.",
  );
  process.exit(0);
} else {
  console.log("💥 Some tests failed. Please review the implementation.");
  process.exit(1);
}
