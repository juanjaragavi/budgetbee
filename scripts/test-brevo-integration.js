#!/usr/bin/env node

/**
 * Test script for Brevo integration
 * Tests the quiz submission API with the specified test data
 */

async function testBrevoIntegration() {
  const testData = {
    name: "Juan Miguel",
    email: "juan.jaramillo@topnetworks.co",
    preference: "credit_cards",
    income: "50000-75000",
    acceptedTerms: true,
    // UTM and tracking data
    utm_source: "test",
    utm_medium: "script",
    utm_campaign: "brevo_migration_test",
    referrer: "test-script",
    userAgent: "Test-Agent/1.0",
    pageUrl: "http://localhost:4321/test",
  };

  console.log("🧪 Testing Brevo integration...");
  console.log("📝 Test data:", JSON.stringify(testData, null, 2));

  try {
    const response = await fetch("http://localhost:4321/api/quiz-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log("\n📊 Response Status:", response.status);
    console.log("📋 Response Data:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log("\n✅ Test PASSED! Brevo integration is working correctly.");

      if (result.integrations?.brevo) {
        console.log("🎯 Brevo integration: SUCCESS");
      } else {
        console.log("⚠️  Brevo integration: FAILED (check logs)");
      }

      if (result.integrations?.googleSheets) {
        console.log("📊 Google Sheets integration: SUCCESS");
      }

      console.log(`🆔 Submission ID: ${result.submissionId}`);
    } else {
      console.log("\n❌ Test FAILED!");
      console.log("Error:", result.message || "Unknown error");
    }
  } catch (error) {
    console.error("\n💥 Test ERROR:", error.message);
    console.log("\nMake sure the development server is running:");
    console.log("  pnpm dev");
  }
}

// Run the test
testBrevoIntegration();
