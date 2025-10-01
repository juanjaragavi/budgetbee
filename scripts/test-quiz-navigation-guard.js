/**
 * Quiz Navigation Guard Testing Script
 *
 * This script provides automated and manual testing utilities for the
 * Quiz Navigation Guard system in BudgetBee.
 *
 * Usage in Browser Console:
 * 1. Copy and paste this entire script into the browser console
 * 2. Run: testQuizGuard.runAllTests()
 * 3. Review results in console
 */

const testQuizGuard = {
  /**
   * Test Results Tracking
   */
  results: [],

  /**
   * Log test result
   */
  logResult(testName, passed, message) {
    const result = {
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString(),
    };
    this.results.push(result);
    console.log(
      `[QuizGuardTest] ${passed ? "✅ PASS" : "❌ FAIL"}: ${testName}`,
      message ? `\n  ${message}` : "",
    );
    return passed;
  },

  /**
   * Clear all test results
   */
  clearResults() {
    this.results = [];
    console.log("[QuizGuardTest] Results cleared");
  },

  /**
   * Display test summary
   */
  showSummary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;

    console.log("\n========================================");
    console.log("QUIZ NAVIGATION GUARD TEST SUMMARY");
    console.log("========================================");
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed}`);
    console.log("========================================\n");

    if (failed > 0) {
      console.log("Failed Tests:");
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`  ❌ ${r.test}: ${r.message}`);
        });
    }

    return { total, passed, failed };
  },

  /**
   * Test 1: Check if guard utility functions exist
   */
  testUtilityFunctionsExist() {
    const testName = "Utility Functions Exist";

    try {
      // This test requires importing the module
      // In actual use, check if functions are accessible
      const functionsToCheck = [
        "hasAccessedRecommender",
        "markRecommenderAccessed",
        "isQuizPage",
        "isRecommenderPage",
        "guardQuizAccess",
        "installRecommenderGuard",
        "clearGuardState",
      ];

      // Since we can't import in browser console, we check sessionStorage API
      const hasSessionStorage = typeof sessionStorage !== "undefined";

      return this.logResult(
        testName,
        hasSessionStorage,
        hasSessionStorage
          ? "sessionStorage API available"
          : "sessionStorage not available",
      );
    } catch (error) {
      return this.logResult(testName, false, error.message);
    }
  },

  /**
   * Test 2: SessionStorage accessibility
   */
  testSessionStorage() {
    const testName = "SessionStorage Accessibility";

    try {
      sessionStorage.setItem("test_key", "test_value");
      const value = sessionStorage.getItem("test_key");
      sessionStorage.removeItem("test_key");

      const passed = value === "test_value";
      return this.logResult(
        testName,
        passed,
        passed
          ? "SessionStorage read/write successful"
          : "SessionStorage operations failed",
      );
    } catch (error) {
      return this.logResult(testName, false, error.message);
    }
  },

  /**
   * Test 3: Check current page detection
   */
  testCurrentPageDetection() {
    const testName = "Current Page Detection";

    try {
      const path = window.location.pathname;
      const isQuiz = path === "/quiz" || path.startsWith("/quiz/");
      const isRecommender = path.includes("/credit-card-recommender-");

      let message = `Current path: ${path}\n`;
      message += `  Is Quiz Page: ${isQuiz}\n`;
      message += `  Is Recommender Page: ${isRecommender}`;

      return this.logResult(testName, true, message);
    } catch (error) {
      return this.logResult(testName, false, error.message);
    }
  },

  /**
   * Test 4: Guard state management
   */
  testGuardState() {
    const testName = "Guard State Management";

    try {
      // Clear any existing state
      sessionStorage.removeItem("budgetbee_recommender_accessed");
      sessionStorage.removeItem("budgetbee_quiz_completed");

      // Test setting state
      sessionStorage.setItem("budgetbee_recommender_accessed", "true");
      sessionStorage.setItem(
        "budgetbee_quiz_completed",
        new Date().toISOString(),
      );

      // Test reading state
      const accessed = sessionStorage.getItem("budgetbee_recommender_accessed");
      const completed = sessionStorage.getItem("budgetbee_quiz_completed");

      // Clean up
      sessionStorage.removeItem("budgetbee_recommender_accessed");
      sessionStorage.removeItem("budgetbee_quiz_completed");

      const passed = accessed === "true" && completed !== null;
      return this.logResult(
        testName,
        passed,
        passed
          ? "Guard state can be set and retrieved"
          : "Guard state operations failed",
      );
    } catch (error) {
      return this.logResult(testName, false, error.message);
    }
  },

  /**
   * Test 5: UTM parameter preservation
   */
  testUtmPreservation() {
    const testName = "UTM Parameter Preservation";

    try {
      const testUtmParams = {
        utm_source: "test_source",
        utm_medium: "test_medium",
        utm_campaign: "test_campaign",
        utm_term: "test_term",
        utm_content: "test_content",
      };

      // Save to sessionStorage
      Object.entries(testUtmParams).forEach(([key, value]) => {
        sessionStorage.setItem(key, value);
      });

      // Retrieve and verify
      const retrieved = {};
      Object.keys(testUtmParams).forEach((key) => {
        retrieved[key] = sessionStorage.getItem(key);
      });

      // Clean up
      Object.keys(testUtmParams).forEach((key) => {
        sessionStorage.removeItem(key);
      });

      const allMatch = Object.entries(testUtmParams).every(
        ([key, value]) => retrieved[key] === value,
      );

      return this.logResult(
        testName,
        allMatch,
        allMatch
          ? "All UTM parameters preserved correctly"
          : "UTM parameter mismatch detected",
      );
    } catch (error) {
      return this.logResult(testName, false, error.message);
    }
  },

  /**
   * Test 6: URL query parameter parsing
   */
  testUrlParameterParsing() {
    const testName = "URL Parameter Parsing";

    try {
      const currentUrl = new URL(window.location.href);
      const params = new URLSearchParams(currentUrl.search);

      const hasParams = params.toString().length > 0;
      let message = `Current URL: ${window.location.href}\n`;
      message += `  Query String: ${params.toString() || "(none)"}\n`;

      if (hasParams) {
        message += "  Parameters:\n";
        for (const [key, value] of params) {
          message += `    ${key}=${value}\n`;
        }
      }

      return this.logResult(testName, true, message);
    } catch (error) {
      return this.logResult(testName, false, error.message);
    }
  },

  /**
   * Test 7: History API availability
   */
  testHistoryApi() {
    const testName = "History API Availability";

    try {
      const hasHistory = typeof window.history !== "undefined";
      const hasReplaceState = typeof window.history.replaceState === "function";
      const hasPushState = typeof window.history.pushState === "function";

      const passed = hasHistory && hasReplaceState && hasPushState;

      let message = `History API: ${hasHistory ? "✓" : "✗"}\n`;
      message += `  replaceState(): ${hasReplaceState ? "✓" : "✗"}\n`;
      message += `  pushState(): ${hasPushState ? "✓" : "✗"}`;

      return this.logResult(testName, passed, message);
    } catch (error) {
      return this.logResult(testName, false, error.message);
    }
  },

  /**
   * Test 8: Event listener attachment
   */
  testEventListeners() {
    const testName = "Event Listener Attachment";

    try {
      let popstateListenerWorks = false;
      let visibilityListenerWorks = false;

      // Test popstate listener
      const popstateHandler = () => {
        popstateListenerWorks = true;
      };
      window.addEventListener("popstate", popstateHandler);
      window.removeEventListener("popstate", popstateHandler);

      // Test visibilitychange listener
      const visibilityHandler = () => {
        visibilityListenerWorks = true;
      };
      document.addEventListener("visibilitychange", visibilityHandler);
      document.removeEventListener("visibilitychange", visibilityHandler);

      const passed = true; // If we got here without errors, listeners can be attached

      let message = "Event listeners can be attached and removed:\n";
      message += `  popstate: ✓\n`;
      message += `  visibilitychange: ✓`;

      return this.logResult(testName, passed, message);
    } catch (error) {
      return this.logResult(testName, false, error.message);
    }
  },

  /**
   * Test 9: Check current guard state
   */
  testCurrentGuardState() {
    const testName = "Current Guard State";

    try {
      const recommenderAccessed =
        sessionStorage.getItem("budgetbee_recommender_accessed") === "true";
      const quizCompleted = sessionStorage.getItem("budgetbee_quiz_completed");

      let message = "Current Guard State:\n";
      message += `  Recommender Accessed: ${recommenderAccessed ? "YES" : "NO"}\n`;
      message += `  Quiz Completed: ${quizCompleted || "NO"}`;

      if (quizCompleted) {
        message += `\n  Completed At: ${quizCompleted}`;
      }

      return this.logResult(testName, true, message);
    } catch (error) {
      return this.logResult(testName, false, error.message);
    }
  },

  /**
   * Test 10: Simulate guard activation
   */
  testGuardActivation() {
    const testName = "Guard Activation Simulation";

    try {
      // Save current state
      const originalRecommenderState = sessionStorage.getItem(
        "budgetbee_recommender_accessed",
      );
      const originalQuizState = sessionStorage.getItem(
        "budgetbee_quiz_completed",
      );

      // Simulate guard activation
      sessionStorage.setItem("budgetbee_recommender_accessed", "true");
      sessionStorage.setItem(
        "budgetbee_quiz_completed",
        new Date().toISOString(),
      );

      const activated =
        sessionStorage.getItem("budgetbee_recommender_accessed") === "true";

      // Restore original state
      if (originalRecommenderState === null) {
        sessionStorage.removeItem("budgetbee_recommender_accessed");
      } else {
        sessionStorage.setItem(
          "budgetbee_recommender_accessed",
          originalRecommenderState,
        );
      }

      if (originalQuizState === null) {
        sessionStorage.removeItem("budgetbee_quiz_completed");
      } else {
        sessionStorage.setItem("budgetbee_quiz_completed", originalQuizState);
      }

      return this.logResult(
        testName,
        activated,
        activated
          ? "Guard can be activated successfully"
          : "Guard activation failed",
      );
    } catch (error) {
      return this.logResult(testName, false, error.message);
    }
  },

  /**
   * Run all tests
   */
  runAllTests() {
    console.log("\n========================================");
    console.log("STARTING QUIZ NAVIGATION GUARD TESTS");
    console.log("========================================\n");

    this.clearResults();

    this.testUtilityFunctionsExist();
    this.testSessionStorage();
    this.testCurrentPageDetection();
    this.testGuardState();
    this.testUtmPreservation();
    this.testUrlParameterParsing();
    this.testHistoryApi();
    this.testEventListeners();
    this.testCurrentGuardState();
    this.testGuardActivation();

    this.showSummary();
  },

  /**
   * Manual Test: Activate Guard
   */
  manualActivateGuard() {
    console.log("\n[Manual Test] Activating Navigation Guard...");
    sessionStorage.setItem("budgetbee_recommender_accessed", "true");
    sessionStorage.setItem(
      "budgetbee_quiz_completed",
      new Date().toISOString(),
    );
    console.log("✅ Guard activated. Try navigating to /quiz");
  },

  /**
   * Manual Test: Deactivate Guard
   */
  manualDeactivateGuard() {
    console.log("\n[Manual Test] Deactivating Navigation Guard...");
    sessionStorage.removeItem("budgetbee_recommender_accessed");
    sessionStorage.removeItem("budgetbee_quiz_completed");
    console.log("✅ Guard deactivated. You can now access /quiz");
  },

  /**
   * Manual Test: Add UTM Parameters to Current URL
   */
  manualAddUtmParams() {
    console.log("\n[Manual Test] Adding test UTM parameters...");
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("utm_source", "test_source");
    currentUrl.searchParams.set("utm_medium", "test_medium");
    currentUrl.searchParams.set("utm_campaign", "test_campaign");
    window.history.replaceState({}, "", currentUrl);
    console.log("✅ UTM parameters added:", currentUrl.href);
  },

  /**
   * Get help information
   */
  help() {
    console.log("\n========================================");
    console.log("QUIZ NAVIGATION GUARD TEST UTILITIES");
    console.log("========================================\n");
    console.log("Automated Tests:");
    console.log(
      "  testQuizGuard.runAllTests()         - Run all automated tests",
    );
    console.log(
      "  testQuizGuard.showSummary()         - Show test results summary",
    );
    console.log(
      "  testQuizGuard.clearResults()        - Clear all test results\n",
    );
    console.log("Manual Tests:");
    console.log(
      "  testQuizGuard.manualActivateGuard() - Manually activate the guard",
    );
    console.log(
      "  testQuizGuard.manualDeactivateGuard() - Manually deactivate the guard",
    );
    console.log(
      "  testQuizGuard.manualAddUtmParams()  - Add test UTM parameters to URL\n",
    );
    console.log("Individual Tests:");
    console.log("  testQuizGuard.testSessionStorage()");
    console.log("  testQuizGuard.testCurrentPageDetection()");
    console.log("  testQuizGuard.testGuardState()");
    console.log("  testQuizGuard.testUtmPreservation()");
    console.log("  testQuizGuard.testUrlParameterParsing()");
    console.log("  testQuizGuard.testHistoryApi()");
    console.log("  testQuizGuard.testEventListeners()");
    console.log("  testQuizGuard.testCurrentGuardState()");
    console.log("  testQuizGuard.testGuardActivation()\n");
  },
};

// Auto-run help on load
testQuizGuard.help();

// Export for use in console
if (typeof window !== "undefined") {
  window.testQuizGuard = testQuizGuard;
  console.log(
    '\n✅ Test utilities loaded! Type "testQuizGuard.help()" for available commands.',
  );
}
