#!/usr/bin/env node

/**
 * Enhanced test script for Brevo integration
 * Verifies the ext_id format and payload structure
 */

// Mock Brevo API endpoint to inspect the payload
const express = require("express");
const app = express();

app.use(express.json());

let capturedPayload = null;

// Mock Brevo endpoint
app.post("/v3/contacts", (req, res) => {
  capturedPayload = req.body;
  console.log("\n🔍 Captured Brevo payload:");
  console.log(JSON.stringify(capturedPayload, null, 2));

  // Validate ext_id format
  const extId = capturedPayload.ext_id;
  const isValidFormat = /^budgetbee-\d+$/.test(extId);

  console.log(`\n🔍 ext_id validation:`);
  console.log(`   Value: "${extId}"`);
  console.log(
    `   Format: ${isValidFormat ? "✅ CORRECT" : "❌ INCORRECT"} (should be budgetbee-{timestamp})`,
  );

  // Validate COUNTRIES field
  const hasCountries =
    capturedPayload.attributes?.COUNTRIES === "United States";
  console.log(
    `   COUNTRIES: ${hasCountries ? "✅ CORRECT" : "❌ INCORRECT"} (${capturedPayload.attributes?.COUNTRIES || "missing"})`,
  );

  // Return success response like Brevo
  res.status(201).json({ id: 123 });
});

const server = app.listen(3001, () => {
  console.log("🎭 Mock Brevo server running on port 3001");
  runTest();
});

async function runTest() {
  // Wait a moment for server to start
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const testData = {
    name: "Juan Miguel",
    email: "juan.jaramillo@topnetworks.co",
    preference: "credit_cards",
    income: "50000-75000",
    acceptedTerms: true,
    utm_source: "test",
    utm_medium: "payload_validation",
    utm_campaign: "brevo_migration_test",
  };

  console.log("🧪 Testing Brevo integration with payload inspection...");

  try {
    // Temporarily modify the API to use our mock server
    // We'll need to check the actual implementation to see if this works

    const response = await fetch("http://localhost:4321/api/quiz-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    console.log("\n📊 Quiz API Response:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n💥 Test ERROR:", error.message);
  } finally {
    server.close();
    console.log("\n🏁 Test completed");
  }
}
