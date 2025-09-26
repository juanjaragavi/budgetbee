#!/usr/bin/env node

const { google } = require("googleapis");
const path = require("path");

async function testDuplicatePrevention() {
  console.log("🔍 Testing Google Sheets Duplicate Prevention");
  console.log("=".repeat(60));

  try {
    // Test data - same email for both submissions
    const testEmail = "duplicate-test@budgetbee.com";

    const firstSubmission = {
      preference: "High credit limit",
      income: "$50,000+",
      email: testEmail,
      name: "First Submission",
      acceptedTerms: true,
      utm_source: "first-test",
      utm_medium: "api",
      utm_campaign: "duplicate-test-1",
    };

    const secondSubmission = {
      preference: "Low interest rate",
      income: "$75,000+",
      email: testEmail, // Same email
      name: "Second Submission",
      acceptedTerms: true,
      utm_source: "second-test",
      utm_medium: "api",
      utm_campaign: "duplicate-test-2",
    };

    console.log(`📧 Testing with email: ${testEmail}`);
    console.log(
      "📊 Test scenario: Submit same email twice to verify duplicate prevention\n",
    );

    // Test 1: First submission
    console.log("🧪 Test 1: First Submission");
    const response1 = await fetch("http://localhost:4321/api/quiz-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(firstSubmission),
    });

    const result1 = await response1.json();
    console.log("Response 1:", JSON.stringify(result1, null, 2));

    if (result1.ok && result1.integrations.googleSheets) {
      console.log("✅ First submission successful");
    } else {
      console.log("❌ First submission failed");
    }

    // Wait a moment between submissions
    console.log("\n⏳ Waiting 2 seconds before second submission...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 2: Second submission (duplicate email)
    console.log("🧪 Test 2: Second Submission (Duplicate Email)");
    const response2 = await fetch("http://localhost:4321/api/quiz-submission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(secondSubmission),
    });

    const result2 = await response2.json();
    console.log("Response 2:", JSON.stringify(result2, null, 2));

    if (result2.ok && result2.integrations.googleSheets) {
      console.log(
        "✅ Second submission processed (should have updated existing entry)",
      );
    } else {
      console.log("❌ Second submission failed");
    }

    // Test 3: Verify in Google Sheets directly
    console.log("\n🔍 Test 3: Verifying Google Sheets Content");

    const keyFilePath = path.resolve(
      process.cwd(),
      "src",
      "lib",
      "absolute-brook-452020-d5-bfba282d0f42.json",
    );
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const sheetId = "1VPUVv5eSeGxlcuKj3VoVSqwwHjFBjWxZLlbKQtVEhbQ";
    const sheetName = "registros";

    // Read all data to check for duplicates
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:T`,
    });

    if (readResponse.data.values) {
      // Count occurrences of our test email
      const emailColumn = 1; // Column B (0-indexed)
      let emailCount = 0;
      let foundRows = [];

      for (let i = 1; i < readResponse.data.values.length; i++) {
        // Skip header
        const row = readResponse.data.values[i];
        if (
          row[emailColumn] &&
          row[emailColumn].toLowerCase() === testEmail.toLowerCase()
        ) {
          emailCount++;
          foundRows.push({
            row: i + 1,
            name: row[0],
            email: row[1],
            preference: row[4],
            income: row[5],
            utm_campaign: row[12],
          });
        }
      }

      console.log(`📊 Found ${emailCount} entries for email ${testEmail}`);

      if (emailCount === 0) {
        console.log("❌ No entries found - something went wrong");
      } else if (emailCount === 1) {
        console.log(
          "✅ Perfect! Only one entry exists (duplicate prevention worked)",
        );
        console.log("Entry details:", foundRows[0]);

        // Check if it's the updated entry (should have second submission data)
        const entry = foundRows[0];
        if (
          entry.preference === "Low interest rate" &&
          entry.utm_campaign === "duplicate-test-2"
        ) {
          console.log("✅ Entry was correctly updated with latest data");
        } else {
          console.log(
            "⚠️  Entry contains original data (may not have updated)",
          );
        }
      } else {
        console.log(
          `❌ Found ${emailCount} entries - duplicate prevention failed!`,
        );
        console.log("All entries:", foundRows);
      }
    }

    console.log("\n📋 Summary:");
    console.log("✅ Duplicate prevention test completed");
    console.log("✅ Check results above to verify functionality");
  } catch (error) {
    console.error("\n💥 Test failed with error:");
    console.error("Message:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
    }
    process.exit(1);
  }
}

// Run the test
testDuplicatePrevention();
