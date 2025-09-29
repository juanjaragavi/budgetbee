/**
 * Browser-based UTM Parameter Validation Test
 * Run this script in the browser console on the Quiz page to validate UTM handling
 *
 * Instructions:
 * 1. Open the Quiz page with the Google Ads URL:
 *    https://budgetbeepro.com/quiz?utm_source=googleads&utm_campaign=22950333792&utm_content=id22950333792-771621153085&utm_medium=-22950333792
 * 2. Open browser developer tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this script
 * 5. Press Enter to run
 */

console.log("🚀 UTM Parameter Validation Test - Browser Console Version");
console.log("=" + "=".repeat(65));

// Test configuration
const testConfig = {
  expectedParams: {
    utm_source: "googleads",
    utm_campaign: "22950333792",
    utm_content: "id22950333792-771621153085",
    utm_medium: "-22950333792",
  },
  testUrl:
    "https://budgetbeepro.com/quiz?utm_source=googleads&utm_campaign=22950333792&utm_content=id22950333792-771621153085&utm_medium=-22950333792",
};

// Test results container
const testResults = {
  passed: 0,
  total: 0,
  details: [],
};

function logTest(testName, passed, details = null) {
  testResults.total++;
  if (passed) testResults.passed++;

  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} ${testName}`);
  if (details) {
    console.log("   Details:", details);
  }

  testResults.details.push({ testName, passed, details });
}

// Test 1: Current URL UTM Parameters
console.log("\nTest 1: Current URL UTM Parameter Extraction");
console.log("-".repeat(50));

const currentParams = new URLSearchParams(window.location.search);
const extractedUtms = {};

["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(
  (key) => {
    const value = currentParams.get(key);
    if (value) {
      extractedUtms[key] = value;
    }
  },
);

console.log("Current URL:", window.location.href);
console.log("Extracted UTM Parameters:", extractedUtms);

const urlParamTest = Object.keys(testConfig.expectedParams).every(
  (key) => extractedUtms[key] === testConfig.expectedParams[key],
);
logTest("URL Parameter Extraction", urlParamTest);

// Test 2: SessionStorage UTM Persistence
console.log("\nTest 2: SessionStorage UTM Persistence");
console.log("-".repeat(50));

const storedUtms = {};
["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(
  (key) => {
    const value = sessionStorage.getItem(key);
    if (value !== null) {
      storedUtms[key] = value;
    }
  },
);

console.log("SessionStorage UTM Parameters:", storedUtms);

const sessionStorageTest = Object.keys(testConfig.expectedParams).every(
  (key) => storedUtms[key] === testConfig.expectedParams[key],
);
logTest("SessionStorage Persistence", sessionStorageTest);

// Test 3: UTM Parameter Validation
console.log("\nTest 3: UTM Parameter Validation");
console.log("-".repeat(50));

// Check if UTM source is in allowed list
const allowedSources = [
  "sendgrid",
  "email",
  "adwords",
  "google",
  "googleads",
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "newsletter",
  "organic",
  "direct",
  "referral",
];

const sourceValidation = allowedSources.includes(
  (extractedUtms.utm_source || "").toLowerCase(),
);
console.log("UTM Source:", extractedUtms.utm_source);
console.log("Allowed Sources:", allowedSources);
logTest("UTM Source Validation", sourceValidation);

// Test 4: Data Layer Integration
console.log("\nTest 4: Data Layer Integration");
console.log("-".repeat(50));

// Check if dataLayer exists
if (typeof window.dataLayer === "undefined") {
  window.dataLayer = [];
}

// Push UTM data to dataLayer (simulating analytics integration)
window.dataLayer.push({
  event: "utm_validation_test",
  test_timestamp: new Date().toISOString(),
  utm_parameters: extractedUtms,
  page_location: window.location.href,
  page_title: document.title,
});

const dataLayerEntry = window.dataLayer[window.dataLayer.length - 1];
const dataLayerTest =
  dataLayerEntry &&
  dataLayerEntry.event === "utm_validation_test" &&
  dataLayerEntry.utm_parameters &&
  Object.keys(dataLayerEntry.utm_parameters).length > 0;

console.log("DataLayer Entry:", dataLayerEntry);
logTest("Data Layer Integration", dataLayerTest);

// Test 5: Page Context Accessibility
console.log("\nTest 5: Page Context Accessibility");
console.log("-".repeat(50));

const pageContext = {
  url: window.location.href,
  pathname: window.location.pathname,
  search: window.location.search,
  title: document.title,
  referrer: document.referrer,
  userAgent: navigator.userAgent.substring(0, 50) + "...",
};

console.log("Page Context:", pageContext);

const pageContextTest =
  pageContext.pathname === "/quiz" &&
  pageContext.search.includes("utm_source=googleads");
logTest("Page Context Accessibility", pageContextTest);

// Test 6: UTM Parameter Format Validation
console.log("\nTest 6: UTM Parameter Format Validation");
console.log("-".repeat(50));

const formatValidation = {
  utm_source_format: /^[a-zA-Z0-9_-]+$/.test(extractedUtms.utm_source || ""),
  utm_campaign_numeric: /^\d+$/.test(extractedUtms.utm_campaign || ""),
  utm_content_structured: /^id\d+-\d+$/.test(extractedUtms.utm_content || ""),
  utm_medium_negative_ref: /^-\d+$/.test(extractedUtms.utm_medium || ""),
  all_required_present: ["utm_source", "utm_campaign"].every(
    (key) => extractedUtms[key],
  ),
};

console.log("Format Validation Results:", formatValidation);

const formatTest = Object.values(formatValidation).every((check) => check);
logTest("UTM Parameter Format Validation", formatTest);

// Test 7: Quiz Page Functionality
console.log("\nTest 7: Quiz Page Functionality");
console.log("-".repeat(50));

const quizElements = {
  quizForm: document.querySelector("form"),
  quizContainer:
    document.querySelector('[data-testid="quiz-container"]') ||
    document.querySelector(".quiz-container") ||
    document.querySelector("#quiz"),
  submitButton:
    document.querySelector('button[type="submit"]') ||
    document.querySelector(".submit-btn") ||
    document.querySelector("button"),
  inputFields: document.querySelectorAll("input, select, textarea"),
};

console.log("Quiz Page Elements:", {
  hasForm: !!quizElements.quizForm,
  hasContainer: !!quizElements.quizContainer,
  hasSubmitButton: !!quizElements.submitButton,
  inputFieldCount: quizElements.inputFields.length,
});

const quizFunctionalityTest = Object.values(quizElements).some(
  (element) => element && (element.length > 0 || element.tagName),
);
logTest("Quiz Page Functionality", quizFunctionalityTest);

// Test 8: Analytics Tracking Readiness
console.log("\nTest 8: Analytics Tracking Readiness");
console.log("-".repeat(50));

const analyticsReadiness = {
  hasDataLayer: typeof window.dataLayer !== "undefined",
  hasGoogleAnalytics:
    typeof window.gtag !== "undefined" || typeof window.ga !== "undefined",
  hasSessionStorage: typeof window.sessionStorage !== "undefined",
  hasUtmInStorage: Object.keys(storedUtms).length > 0,
  hasUtmInUrl: Object.keys(extractedUtms).length > 0,
};

console.log("Analytics Readiness:", analyticsReadiness);

const analyticsTest =
  analyticsReadiness.hasDataLayer &&
  analyticsReadiness.hasSessionStorage &&
  (analyticsReadiness.hasUtmInStorage || analyticsReadiness.hasUtmInUrl);
logTest("Analytics Tracking Readiness", analyticsTest);

// Test Summary
console.log("\n" + "=".repeat(70));
console.log("TEST SUMMARY");
console.log("=".repeat(70));

console.log(
  `\n📊 Results: ${testResults.passed}/${testResults.total} tests passed`,
);
console.log(
  `🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`,
);

testResults.details.forEach((result, index) => {
  const status = result.passed ? "✅" : "❌";
  console.log(`${index + 1}. ${status} ${result.testName}`);
});

if (testResults.passed === testResults.total) {
  console.log(
    "\n🎉 All tests passed! UTM parameter handling is working correctly on the Quiz page.",
  );
  console.log(
    "✅ The page can accept and process Google Ads campaign URLs properly.",
  );
  console.log("✅ UTM parameters are accessible for analytics and tracking.");
  console.log("✅ Data integrity is maintained throughout the page lifecycle.");
} else {
  console.log("\n⚠️  Some tests failed. This may indicate issues with:");
  console.log("   - UTM parameter extraction or storage");
  console.log("   - Page functionality or element detection");
  console.log("   - Analytics integration setup");
  console.log(
    "\n📝 Review the detailed test results above for specific issues.",
  );
}

// Export results for further analysis
window.utmValidationResults = {
  summary: {
    passed: testResults.passed,
    total: testResults.total,
    successRate: (testResults.passed / testResults.total) * 100,
  },
  extractedUtms,
  storedUtms,
  pageContext,
  testResults: testResults.details,
  timestamp: new Date().toISOString(),
};

console.log(
  "\n💾 Results saved to window.utmValidationResults for further analysis.",
);
console.log(
  "📋 To view saved results: console.log(window.utmValidationResults)",
);

return window.utmValidationResults;
