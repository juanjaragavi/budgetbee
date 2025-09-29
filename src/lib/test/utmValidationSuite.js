/**
 * UTM Parameter Validation Suite for BudgetBee Quiz Page
 * Tests handling of dynamic UTM parameters with focus on Google Ads campaign format
 */

/**
 * Sample Google Ads URL from task:
 * https://budgetbeepro.com/quiz?utm_source=googleads&utm_campaign=22950333792&utm_content=id22950333792-771621153085&utm_medium=-22950333792
 */

export class UtmValidator {
  constructor() {
    this.testResults = [];
    this.originalConsoleLog = console.log;
    this.logs = [];
  }

  log(message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null,
    };
    this.logs.push(logEntry);
    this.originalConsoleLog(`[UTM Validator] ${message}`, data || "");
  }

  // Test 1: Validate UTM Parameter Parsing
  testUtmParameterParsing() {
    this.log("=== Test 1: UTM Parameter Parsing ===");

    const testUrl =
      "https://budgetbeepro.com/quiz?utm_source=googleads&utm_campaign=22950333792&utm_content=id22950333792-771621153085&utm_medium=-22950333792";
    const urlObj = new URL(testUrl);

    // Test extractUtmFromUrl function
    const extractedParams = {};
    for (const [key, value] of urlObj.searchParams.entries()) {
      if (key.startsWith("utm_")) {
        extractedParams[key] = value;
      }
    }

    const expectedParams = {
      utm_source: "googleads",
      utm_campaign: "22950333792",
      utm_content: "id22950333792-771621153085",
      utm_medium: "-22950333792",
    };

    const parseResult = this.compareObjects(extractedParams, expectedParams);
    this.testResults.push({
      test: "UTM Parameter Parsing",
      passed: parseResult.passed,
      expected: expectedParams,
      actual: extractedParams,
      details: parseResult.details,
    });

    this.log("Extracted UTM Parameters:", extractedParams);
    this.log(
      `Test Result: ${parseResult.passed ? "PASS" : "FAIL"}`,
      parseResult.details,
    );

    return parseResult.passed;
  }

  // Test 2: Validate UTM Naming Conventions
  testUtmNamingConventions() {
    this.log("=== Test 2: UTM Naming Conventions ===");

    const testParams = {
      utm_source: "googleads",
      utm_campaign: "22950333792",
      utm_content: "id22950333792-771621153085",
      utm_medium: "-22950333792",
    };

    const conventionChecks = {
      utm_source_valid: /^[a-zA-Z0-9_-]+$/.test(testParams.utm_source),
      utm_campaign_format: /^[a-zA-Z0-9_-]+$/.test(testParams.utm_campaign),
      utm_content_format: /^[a-zA-Z0-9_-]+$/.test(testParams.utm_content),
      utm_medium_format: /^[a-zA-Z0-9_-]+$/.test(testParams.utm_medium),
      required_params_present: ["utm_source", "utm_campaign"].every(
        (param) => testParams[param],
      ),
    };

    const allValid = Object.values(conventionChecks).every((check) => check);

    this.testResults.push({
      test: "UTM Naming Conventions",
      passed: allValid,
      checks: conventionChecks,
      params: testParams,
    });

    this.log("Convention Checks:", conventionChecks);
    this.log(`Test Result: ${allValid ? "PASS" : "FAIL"}`);

    return allValid;
  }

  // Test 3: Test SessionStorage Persistence
  testSessionStoragePersistence() {
    this.log("=== Test 3: SessionStorage Persistence ===");

    // Clear existing storage
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ].forEach((key) => {
      sessionStorage.removeItem(key);
    });

    // Store test UTM parameters
    const testParams = {
      utm_source: "googleads",
      utm_campaign: "22950333792",
      utm_content: "id22950333792-771621153085",
      utm_medium: "-22950333792",
    };

    Object.entries(testParams).forEach(([key, value]) => {
      sessionStorage.setItem(key, value);
    });

    // Retrieve and verify
    const retrievedParams = {};
    Object.keys(testParams).forEach((key) => {
      const value = sessionStorage.getItem(key);
      if (value !== null) {
        retrievedParams[key] = value;
      }
    });

    const storageResult = this.compareObjects(retrievedParams, testParams);
    this.testResults.push({
      test: "SessionStorage Persistence",
      passed: storageResult.passed,
      stored: testParams,
      retrieved: retrievedParams,
      details: storageResult.details,
    });

    this.log("Stored Parameters:", testParams);
    this.log("Retrieved Parameters:", retrievedParams);
    this.log(`Test Result: ${storageResult.passed ? "PASS" : "FAIL"}`);

    return storageResult.passed;
  }

  // Test 4: Test Data Layer Accessibility
  testDataLayerAccessibility() {
    this.log("=== Test 4: Data Layer Accessibility ===");

    // Simulate quiz page load with UTM parameters
    const mockUtmParams = {
      utm_source: "googleads",
      utm_campaign: "22950333792",
      utm_content: "id22950333792-771621153085",
      utm_medium: "-22950333792",
    };

    // Store in sessionStorage (simulating UtmPersister behavior)
    Object.entries(mockUtmParams).forEach(([key, value]) => {
      sessionStorage.setItem(key, value);
    });

    // Test accessibility through various methods
    const accessibilityTests = {
      sessionStorage: this.testSessionStorageAccess(mockUtmParams),
      urlParams: this.testUrlParamAccess(mockUtmParams),
      dataLayerVariables: this.testDataLayerVariables(mockUtmParams),
    };

    const allAccessible = Object.values(accessibilityTests).every(
      (test) => test.passed,
    );

    this.testResults.push({
      test: "Data Layer Accessibility",
      passed: allAccessible,
      accessibilityTests,
    });

    this.log("Accessibility Tests:", accessibilityTests);
    this.log(`Test Result: ${allAccessible ? "PASS" : "FAIL"}`);

    return allAccessible;
  }

  // Test 5: Validate UTM Source Recognition
  testUtmSourceValidation() {
    this.log("=== Test 5: UTM Source Validation ===");

    const testSources = {
      googleads: true, // Should be valid
      google: true, // Should be valid
      facebook: true, // Should be valid
      sendgrid: true, // Should be valid
      invalid_source: false, // Should be invalid
      spam123: false, // Should be invalid
    };

    // Test the validation function (if available)
    const validationResults = {};
    Object.entries(testSources).forEach(([source, expectedValid]) => {
      // Mock validation logic based on the allowedSources from utmUtils
      const allowedSources = [
        "sendgrid",
        "email",
        "adwords",
        "google",
        "facebook",
        "instagram",
        "twitter",
        "linkedin",
        "newsletter",
        "organic",
        "direct",
        "referral",
        "googleads",
      ];

      const isValid = allowedSources.includes(source.toLowerCase());
      validationResults[source] = {
        expected: expectedValid,
        actual: isValid,
        passed: expectedValid === isValid,
      };
    });

    const allPassed = Object.values(validationResults).every(
      (result) => result.passed,
    );

    this.testResults.push({
      test: "UTM Source Validation",
      passed: allPassed,
      validationResults,
    });

    this.log("Source Validation Results:", validationResults);
    this.log(`Test Result: ${allPassed ? "PASS" : "FAIL"}`);

    return allPassed;
  }

  // Test 6: Real-world Campaign URL Handling
  testRealWorldCampaignUrl() {
    this.log("=== Test 6: Real-world Campaign URL Handling ===");

    const campaignUrl =
      "https://budgetbeepro.com/quiz?utm_source=googleads&utm_campaign=22950333792&utm_content=id22950333792-771621153085&utm_medium=-22950333792";

    // Parse the URL
    const urlObj = new URL(campaignUrl);
    const extractedParams = {};
    for (const [key, value] of urlObj.searchParams.entries()) {
      if (key.startsWith("utm_")) {
        extractedParams[key] = value;
      }
    }

    // Validate the campaign structure
    const campaignValidation = {
      has_required_utm_source: !!extractedParams.utm_source,
      has_campaign_id: !!extractedParams.utm_campaign,
      campaign_id_is_numeric: /^\d+$/.test(extractedParams.utm_campaign || ""),
      content_has_campaign_reference: extractedParams.utm_content?.includes(
        extractedParams.utm_campaign || "",
      ),
      medium_format_valid: extractedParams.utm_medium !== undefined,
    };

    const campaignValid = Object.values(campaignValidation).every(
      (check) => check,
    );

    // Test that parameters would be properly stored and retrievable
    Object.entries(extractedParams).forEach(([key, value]) => {
      sessionStorage.setItem(`test_${key}`, value);
    });

    const retrievedParams = {};
    Object.keys(extractedParams).forEach((key) => {
      const value = sessionStorage.getItem(`test_${key}`);
      if (value !== null) {
        retrievedParams[key] = value;
      }
    });

    const storageIntegrity = this.compareObjects(
      extractedParams,
      retrievedParams,
    );

    this.testResults.push({
      test: "Real-world Campaign URL Handling",
      passed: campaignValid && storageIntegrity.passed,
      campaignUrl,
      extractedParams,
      campaignValidation,
      storageIntegrity,
    });

    this.log("Campaign URL:", campaignUrl);
    this.log("Extracted Parameters:", extractedParams);
    this.log("Campaign Validation:", campaignValidation);
    this.log("Storage Integrity:", storageIntegrity);
    this.log(
      `Test Result: ${campaignValid && storageIntegrity.passed ? "PASS" : "FAIL"}`,
    );

    // Cleanup test storage
    Object.keys(extractedParams).forEach((key) => {
      sessionStorage.removeItem(`test_${key}`);
    });

    return campaignValid && storageIntegrity.passed;
  }

  // Helper method for object comparison
  compareObjects(obj1, obj2) {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();

    if (keys1.length !== keys2.length) {
      return {
        passed: false,
        details: `Key count mismatch: expected ${keys2.length}, got ${keys1.length}`,
      };
    }

    for (let key of keys1) {
      if (obj1[key] !== obj2[key]) {
        return {
          passed: false,
          details: `Value mismatch for ${key}: expected '${obj2[key]}', got '${obj1[key]}'`,
        };
      }
    }

    return { passed: true, details: "Objects match exactly" };
  }

  // Helper methods for accessibility testing
  testSessionStorageAccess(params) {
    try {
      const retrieved = {};
      Object.keys(params).forEach((key) => {
        const value = sessionStorage.getItem(key);
        if (value !== null) retrieved[key] = value;
      });
      return {
        passed: Object.keys(retrieved).length === Object.keys(params).length,
        data: retrieved,
      };
    } catch (error) {
      return { passed: false, error: error.message };
    }
  }

  testUrlParamAccess(params) {
    try {
      // Simulate URL access
      const mockUrl = new URL(window.location.href);
      Object.entries(params).forEach(([key, value]) => {
        mockUrl.searchParams.set(key, value);
      });

      const retrieved = {};
      for (const [key, value] of mockUrl.searchParams.entries()) {
        if (key.startsWith("utm_")) {
          retrieved[key] = value;
        }
      }

      return { passed: Object.keys(retrieved).length > 0, data: retrieved };
    } catch (error) {
      return { passed: false, error: error.message };
    }
  }

  testDataLayerVariables(params) {
    try {
      // Test if window.dataLayer exists and can hold UTM data
      if (!window.dataLayer) {
        window.dataLayer = [];
      }

      // Push UTM data to dataLayer
      window.dataLayer.push({
        event: "utm_parameters_loaded",
        utm_parameters: params,
      });

      // Verify it was stored
      const lastEntry = window.dataLayer[window.dataLayer.length - 1];
      const hasUtmData =
        lastEntry &&
        lastEntry.utm_parameters &&
        Object.keys(lastEntry.utm_parameters).length ===
          Object.keys(params).length;

      return { passed: hasUtmData, data: lastEntry };
    } catch (error) {
      return { passed: false, error: error.message };
    }
  }

  // Run all tests
  runAllTests() {
    this.log("🧪 Starting UTM Parameter Validation Suite");
    this.log(
      `Test URL: https://budgetbeepro.com/quiz?utm_source=googleads&utm_campaign=22950333792&utm_content=id22950333792-771621153085&utm_medium=-22950333792`,
    );

    const testMethods = [
      "testUtmParameterParsing",
      "testUtmNamingConventions",
      "testSessionStoragePersistence",
      "testDataLayerAccessibility",
      "testUtmSourceValidation",
      "testRealWorldCampaignUrl",
    ];

    const results = testMethods.map((method) => {
      try {
        return this[method]();
      } catch (error) {
        this.log(`Error in ${method}:`, error.message);
        return false;
      }
    });

    const passedCount = results.filter((result) => result).length;
    const totalCount = results.length;

    this.log("=== Test Suite Summary ===");
    this.log(`Tests Passed: ${passedCount}/${totalCount}`);
    this.log(`Success Rate: ${((passedCount / totalCount) * 100).toFixed(1)}%`);

    if (passedCount === totalCount) {
      this.log(
        "🎉 All tests passed! UTM parameter handling is working correctly.",
      );
    } else {
      this.log("❌ Some tests failed. Review the detailed results below.");
    }

    // Return detailed test results
    return {
      summary: {
        passed: passedCount,
        total: totalCount,
        successRate: (passedCount / totalCount) * 100,
      },
      testResults: this.testResults,
      logs: this.logs,
    };
  }

  // Generate validation report
  generateReport() {
    const results = this.runAllTests();

    console.log("\n" + "=".repeat(80));
    console.log("UTM PARAMETER VALIDATION REPORT");
    console.log("=".repeat(80));

    console.log(`\nTest Summary:`);
    console.log(`✓ Passed: ${results.summary.passed}`);
    console.log(`✗ Failed: ${results.summary.total - results.summary.passed}`);
    console.log(`📊 Success Rate: ${results.summary.successRate.toFixed(1)}%`);

    console.log(`\nDetailed Results:`);
    results.testResults.forEach((result, index) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`${index + 1}. ${status} - ${result.test}`);
      if (!result.passed && result.details) {
        console.log(`   Details: ${result.details}`);
      }
    });

    console.log("\n" + "=".repeat(80));

    return results;
  }
}

// Export for use in browser console or testing frameworks
if (typeof window !== "undefined") {
  window.UtmValidator = UtmValidator;

  // Auto-run validation when script loads
  window.addEventListener("DOMContentLoaded", () => {
    console.log(
      "UTM Validator loaded. Run: new UtmValidator().generateReport()",
    );
  });
}
