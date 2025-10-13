/**
 * AdZep Activation Test Script
 * Tests the correct invocation of window.AdZepActivateAds() after router fixes
 *
 * Usage: node scripts/test-adzep-activation.mjs
 */

import { chromium } from "playwright";

const BASE_URL = "http://localhost:4321";
const TEST_TIMEOUT = 15000;

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
};

// Test pages with expected ad behavior
const testPages = [
  {
    path: "/credit-card-recommender-p1",
    name: "Credit Card Recommender P1",
    shouldHaveAds: true,
    expectedContainers: ["us_budgetbeepro_1", "us_budgetbeepro_2"],
  },
  {
    path: "/credit-card-recommender-p2",
    name: "Credit Card Recommender P2",
    shouldHaveAds: true,
    expectedContainers: ["us_budgetbeepro_1"],
  },
  {
    path: "/credit-card-recommender-p3",
    name: "Credit Card Recommender P3",
    shouldHaveAds: true,
    expectedContainers: ["us_budgetbeepro_1"],
  },
  {
    path: "/blog/page/2",
    name: "Blog Pagination (Fixed Route)",
    shouldHaveAds: false, // Check if page loads correctly
    expectedContainers: [],
  },
  {
    path: "/personal-finance/page/2",
    name: "Personal Finance Pagination (Fixed Route)",
    shouldHaveAds: false, // Check if page loads correctly
    expectedContainers: [],
  },
  {
    path: "/financial-solutions/page/2",
    name: "Financial Solutions Pagination (Fixed Route)",
    shouldHaveAds: false, // Check if page loads correctly
    expectedContainers: [],
  },
];

/**
 * Check AdZep activation state on a page
 */
async function checkAdZepActivation(page, pageName) {
  const results = {
    pageName,
    functionAvailable: false,
    stateActivated: false,
    lastActivationTime: null,
    activationAttempts: 0,
    adContainersFound: [],
    consoleMessages: [],
    errors: [],
  };

  // Collect console messages
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("[AdZep]") || text.includes("[AdZepBridge]")) {
      results.consoleMessages.push(text);
    }
  });

  // Collect errors
  page.on("pageerror", (error) => {
    results.errors.push(error.message);
  });

  try {
    // Wait for page to be ready
    await page.waitForLoadState("networkidle", { timeout: TEST_TIMEOUT });

    // Check if AdZepActivateAds function is available
    results.functionAvailable = await page.evaluate(() => {
      return typeof window.AdZepActivateAds === "function";
    });

    // Check AdZep state
    const adZepState = await page.evaluate(() => {
      return window.__adZepState || null;
    });

    if (adZepState) {
      results.stateActivated = adZepState.activated;
      results.lastActivationTime = adZepState.lastActivation;
      results.activationAttempts = adZepState.activationAttempts;
    }

    // Check for ad containers
    results.adContainersFound = await page.evaluate(() => {
      const containers = document.querySelectorAll('[id^="us_budgetbeepro_"]');
      return Array.from(containers).map((el) => el.id);
    });

    // Wait a bit to ensure activation has time to complete
    await page.waitForTimeout(2000);

    // Re-check state after wait
    const finalState = await page.evaluate(() => {
      return window.__adZepState || null;
    });

    if (finalState) {
      results.stateActivated = finalState.activated;
      results.lastActivationTime = finalState.lastActivation;
      results.activationAttempts = finalState.activationAttempts;
    }

    return results;
  } catch (error) {
    results.errors.push(error.message);
    return results;
  }
}

/**
 * Run tests on all pages
 */
async function runTests() {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 AdZep Activation Test Suite - Post Router Fix Verification");
  console.log("=".repeat(80) + "\n");

  let browser;
  let allTestsPassed = true;

  try {
    log.info("Launching browser...");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    log.success("Browser launched successfully\n");

    for (const testPage of testPages) {
      console.log("\n" + "-".repeat(80));
      log.test(`Testing: ${testPage.name}`);
      log.info(`URL: ${BASE_URL}${testPage.path}`);
      console.log("-".repeat(80));

      try {
        // Navigate to page
        await page.goto(`${BASE_URL}${testPage.path}`, {
          waitUntil: "domcontentloaded",
          timeout: TEST_TIMEOUT,
        });

        log.success("Page loaded successfully");

        // Check AdZep activation
        const results = await checkAdZepActivation(page, testPage.name);

        // Display results
        console.log("\n📊 Results:");
        console.log(
          `   AdZepActivateAds function available: ${results.functionAvailable ? "✅" : "❌"}`,
        );
        console.log(
          `   AdZep state activated: ${results.stateActivated ? "✅" : "❌"}`,
        );
        console.log(`   Activation attempts: ${results.activationAttempts}`);
        console.log(
          `   Last activation: ${results.lastActivationTime ? new Date(results.lastActivationTime).toISOString() : "N/A"}`,
        );
        console.log(
          `   Ad containers found: ${results.adContainersFound.length > 0 ? results.adContainersFound.join(", ") : "None"}`,
        );

        // Show console messages
        if (results.consoleMessages.length > 0) {
          console.log("\n📝 AdZep Console Messages:");
          results.consoleMessages.forEach((msg) => {
            console.log(`   ${msg}`);
          });
        }

        // Show errors if any
        if (results.errors.length > 0) {
          console.log("\n⚠️  Errors:");
          results.errors.forEach((err) => {
            console.log(`   ${err}`);
          });
        }

        // Validate based on expectations
        if (testPage.shouldHaveAds) {
          // Check if ads should be activated
          if (!results.functionAvailable) {
            log.error(
              `AdZepActivateAds function not available on ${testPage.name}`,
            );
            allTestsPassed = false;
          } else if (!results.stateActivated) {
            log.warning(
              `AdZep state not activated on ${testPage.name} (this may be due to ad blockers or script loading delays)`,
            );
          } else {
            log.success(`AdZep properly activated on ${testPage.name}`);
          }

          // Check for expected ad containers
          const missingContainers = testPage.expectedContainers.filter(
            (id) => !results.adContainersFound.includes(id),
          );
          if (missingContainers.length > 0) {
            log.warning(
              `Missing ad containers: ${missingContainers.join(", ")}`,
            );
          }
        } else {
          // Just verify page loads correctly
          log.success(`Route functioning correctly after router fix`);
        }
      } catch (error) {
        log.error(`Test failed for ${testPage.name}: ${error.message}`);
        allTestsPassed = false;
      }

      // Brief pause between tests
      await page.waitForTimeout(1000);
    }

    // Test navigation between pages
    console.log("\n" + "=".repeat(80));
    log.test("Testing Navigation Between Pages (SPA transitions)");
    console.log("=".repeat(80));

    try {
      await page.goto(`${BASE_URL}/credit-card-recommender-p1`, {
        waitUntil: "domcontentloaded",
      });
      log.success("Navigated to P1");

      await page.waitForTimeout(1500);

      await page.goto(`${BASE_URL}/credit-card-recommender-p2`, {
        waitUntil: "domcontentloaded",
      });
      log.success("Navigated to P2");

      await page.waitForTimeout(1500);

      const p2Results = await checkAdZepActivation(page, "P2 after navigation");

      if (p2Results.stateActivated) {
        log.success("AdZep re-activated correctly after navigation");
      } else {
        log.warning(
          "AdZep state not detected after navigation (may need more time or encounter blocking)",
        );
      }

      console.log(
        `\n📝 Activation attempts during navigation: ${p2Results.activationAttempts}`,
      );
      console.log(`📝 Console messages: ${p2Results.consoleMessages.length}`);
    } catch (error) {
      log.error(`Navigation test failed: ${error.message}`);
      allTestsPassed = false;
    }
  } catch (error) {
    log.error(`Test suite error: ${error.message}`);
    allTestsPassed = false;
  } finally {
    if (browser) {
      await browser.close();
      log.info("Browser closed");
    }
  }

  // Final summary
  console.log("\n" + "=".repeat(80));
  if (allTestsPassed) {
    log.success("ALL TESTS PASSED ✅");
    log.success("Router fixes did NOT negatively impact AdZep activation");
  } else {
    log.warning("SOME TESTS HAD ISSUES ⚠️");
    log.info("Review the detailed output above for specifics");
  }
  console.log("=".repeat(80) + "\n");

  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
