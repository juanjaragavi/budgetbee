/**
 * Test scenarios for dynamic UTM parameter handling
 * Run these in browser console to verify correct behavior
 */

// Test 1: Direct visit to quiz (should have no UTM parameters)
console.log("Test 1: Direct quiz visit");
console.log("Expected: Clean URL without UTM parameters");
window.location.href = "/quiz";

// Test 2: Visit from email campaign (should preserve campaign UTM parameters)
console.log("Test 2: Email campaign visit");
console.log("Expected: UTM parameters preserved and propagated");
window.location.href =
  "/quiz?utm_source=sendgrid&utm_medium=email&utm_campaign=us_tc_bc_44&utm_term=broadcast&utm_content=boton_1";

// Test 3: Visit from different campaign (should preserve different UTM parameters)
console.log("Test 3: Different campaign visit");
console.log("Expected: Different UTM parameters preserved");
window.location.href =
  "/quiz?utm_source=google&utm_medium=cpc&utm_campaign=credit_cards";

// Test 4: Visit with no UTM after campaign visit (should inherit stored UTMs)
console.log("Test 4: Follow-up visit without UTM");
console.log("Expected: Inherit UTM parameters from session storage");
// First visit with UTMs, then visit without UTMs
window.location.href =
  "/blog?utm_source=facebook&utm_medium=social&utm_campaign=awareness";
// Then navigate to quiz (should inherit Facebook campaign UTMs)
setTimeout(() => {
  window.location.href = "/quiz";
}, 1000);

// Test 5: qz redirect with UTM parameters
console.log("Test 5: qz redirect with UTMs");
console.log("Expected: UTM parameters preserved through redirect");
window.location.href =
  "/qz?utm_source=newsletter&utm_medium=email&utm_campaign=weekly";

// Manual test functions for browser console
window.testUtmHandling = {
  // Test clean quiz URL generation
  testCleanQuiz: function () {
    // Clear any stored UTMs first
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ].forEach((key) => {
      sessionStorage.removeItem(key);
    });

    // Navigate to quiz - should be clean
    window.location.href = "/quiz";
  },

  // Test campaign UTM preservation
  testCampaignUtms: function () {
    const testUtms =
      "utm_source=test&utm_medium=manual&utm_campaign=verification";
    window.location.href = `/quiz?${testUtms}`;
  },

  // Test UTM inheritance from stored values
  testUtmInheritance: function () {
    // Set some UTMs in storage
    sessionStorage.setItem("utm_source", "stored_test");
    sessionStorage.setItem("utm_medium", "stored_manual");
    sessionStorage.setItem("utm_campaign", "stored_verification");

    // Navigate to quiz without UTMs - should inherit from storage
    window.location.href = "/quiz";
  },

  // Test mixed scenarios
  testMixedScenario: function () {
    // First visit with UTMs
    window.location.href =
      "/blog?utm_source=initial&utm_medium=email&utm_campaign=welcome";

    setTimeout(() => {
      // Second visit to quiz without UTMs (should inherit)
      window.location.href = "/quiz";
    }, 1000);
  },

  // Check current UTM status
  checkUtmStatus: function () {
    console.log("Current URL:", window.location.href);
    console.log("UTMs in URL:", new URLSearchParams(window.location.search));
    console.log("UTMs in storage:", {
      utm_source: sessionStorage.getItem("utm_source"),
      utm_medium: sessionStorage.getItem("utm_medium"),
      utm_campaign: sessionStorage.getItem("utm_campaign"),
      utm_term: sessionStorage.getItem("utm_term"),
      utm_content: sessionStorage.getItem("utm_content"),
    });
  },
};

console.log(
  "UTM testing functions loaded. Use window.testUtmHandling.* to run tests.",
);
console.log("Available functions:", Object.keys(window.testUtmHandling));
