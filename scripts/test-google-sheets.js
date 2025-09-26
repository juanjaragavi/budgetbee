#!/usr/bin/env node

/**
 * Test script for Google Sheets integration
 * Run this script to test the quiz submission API and Google Sheets connectivity
 */

const testSubmission = {
  preference: "High credit limit",
  income: "Under $25,000",
  email: "test@budgetbee.com",
  name: "Test User",
  acceptedTerms: true,
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "test_campaign_2024",
  utm_content: "quiz_button",
  utm_term: "credit card quiz",
  referrer: "https://google.com/search?q=credit+card+quiz",
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  pageUrl:
    "http://localhost:4321/quiz?utm_source=google&utm_campaign=test_campaign_2024",
};

async function testGoogleSheetsIntegration() {
  console.log("🧪 Testing Google Sheets Integration...\n");
  console.log("📊 Test Data:", JSON.stringify(testSubmission, null, 2));
  console.log("\n🚀 Sending request to API...\n");

  try {
    const response = await fetch("http://localhost:4321/api/quiz-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testSubmission),
    });

    const result = await response.json();

    console.log(
      `📈 Response Status: ${response.status} ${response.statusText}`,
    );
    console.log("📋 Response Body:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log("\n✅ SUCCESS: Quiz submission processed successfully!");

      if (result.integrations) {
        console.log("\n🔗 Integration Status:");
        console.log(
          `   📊 Google Sheets: ${result.integrations.googleSheets ? "✅ Success" : "❌ Failed"}`,
        );
        console.log(
          `   📧 SendGrid: ${result.integrations.sendGrid ? "✅ Success" : "❌ Failed"}`,
        );

        if (result.submissionId) {
          console.log(`   🆔 Submission ID: ${result.submissionId}`);
        }
      }

      console.log("\n📝 Next Steps:");
      console.log("   1. Check your Google Sheet for the new row");
      console.log("   2. Verify all data fields are populated correctly");
      console.log("   3. Check SendGrid for new subscriber (if enabled)");
    } else {
      console.log("\n❌ FAILED: Quiz submission failed");
      console.log(`   Error: ${result.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("\n💥 ERROR: Network or connection issue");
    console.error("   Details:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Ensure Astro dev server is running (pnpm dev)");
    console.log("   2. Check environment variables are set");
    console.log("   3. Verify Google Sheets API credentials");
  }
}

async function testEnvironmentConfiguration() {
  console.log("🔧 Environment Configuration Check...\n");

  const requiredEnvVars = [
    "GOOGLE_SHEETS_CLIENT_EMAIL",
    "GOOGLE_SHEETS_PRIVATE_KEY",
    "GOOGLE_SHEET_ID",
    "SENDGRID_API_KEY",
    "SENDGRID_LIST_ID",
  ];

  const envStatus = {};

  // Note: We can't directly access env vars from this script
  // This is just for demonstration - the actual check happens in the API
  requiredEnvVars.forEach((varName) => {
    envStatus[varName] = process.env[varName]
      ? "✅ Set"
      : "⚠️  Not detected (check .env files)";
  });

  console.log("📋 Required Environment Variables:");
  Object.entries(envStatus).forEach(([key, status]) => {
    console.log(`   ${key}: ${status}`);
  });

  console.log("\n💡 Note: Environment variables are loaded by Astro server");
  console.log("   Check your .env, .env.local, and .env.production files\n");
}

async function runAllTests() {
  console.log("🎯 BudgetBee Google Sheets Integration Test Suite");
  console.log("=".repeat(50));
  console.log();

  await testEnvironmentConfiguration();
  console.log("-".repeat(50));
  await testGoogleSheetsIntegration();

  console.log("\n" + "=".repeat(50));
  console.log("✨ Test completed! Check the results above.");
}

// Run the tests
runAllTests().catch((error) => {
  console.error("\n💥 Test suite failed:", error);
  process.exit(1);
});
