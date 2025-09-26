#!/usr/bin/env node

// Test the Google Sheets service in the same environment as Astro
import { googleSheetsService } from "../src/lib/googleSheets.ts";

async function testDirectService() {
  console.log("🧪 Testing Google Sheets Service Directly");
  console.log("=".repeat(50));

  try {
    // Test connection first
    console.log("Testing connection...");
    const connected = await googleSheetsService.testConnection();
    console.log(`Connection test result: ${connected}`);

    if (!connected) {
      console.log("❌ Connection failed, cannot proceed with submission test");
      return;
    }

    // Test submission
    console.log("\nTesting submission...");
    const testSubmission = {
      name: "Direct Service Test",
      email: "direct-test@budgetbee.com",
      first_name: "Direct",
      last_name: "Test",
      preference: "High credit limit",
      income: "$50,000+",
      acceptedTerms: true,
      country: "US",
      external_id: "direct-test-" + Date.now(),
      brand: "BudgetBee",
      utm_source: "direct-service",
      utm_medium: "test",
      utm_campaign: "direct-service-test",
      utm_content: "direct-content",
      utm_term: "direct-term",
      referrer: "direct",
      userAgent: "Direct Service Test Agent",
      pageUrl: "http://localhost:4321/direct-test",
      timestamp: new Date().toISOString(),
      submissionId: "direct-test-" + Date.now(),
    };

    const result = await googleSheetsService.appendSubmission(testSubmission);
    console.log(`Submission test result: ${result}`);

    if (result) {
      console.log("✅ Google Sheets service is working correctly!");
    } else {
      console.log("❌ Google Sheets submission failed");
    }
  } catch (error) {
    console.error("❌ Direct service test failed:", error);
  }
}

testDirectService();
