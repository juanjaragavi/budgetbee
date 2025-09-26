#!/usr/bin/env node

/**
 * Google Sheets Credentials Validation Script
 * Use this script to validate your Google Sheets API setup
 */

async function validateGoogleSheetsCredentials() {
  console.log("🔐 Google Sheets Credentials Validation");
  console.log("=".repeat(50));

  try {
    const response = await fetch(
      "http://localhost:4321/api/test-google-sheets-connection",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Google Sheets connection test passed!");
      console.log("📊 Sheet access verified");
      if (result.sheetName) {
        console.log(`📋 Sheet name: ${result.sheetName}`);
      }
    } else {
      console.log("❌ Google Sheets connection test failed");
      console.log(`   Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log("❌ Could not test connection");
    console.log(`   Error: ${error.message}`);
  }

  console.log("\n💡 Manual Validation Steps:");
  console.log("1. Ensure these environment variables are set:");
  console.log("   - GOOGLE_SHEETS_CLIENT_EMAIL");
  console.log("   - GOOGLE_SHEETS_PRIVATE_KEY");
  console.log("   - GOOGLE_SHEET_ID");
  console.log('   - GOOGLE_SHEET_NAME (optional, defaults to "Sheet1")');
  console.log("\n2. Verify Google Sheet sharing:");
  console.log("   - Share your Google Sheet with the service account email");
  console.log('   - Give "Editor" permissions to the service account');
  console.log("\n3. Check Google APIs:");
  console.log("   - Google Sheets API is enabled");
  console.log("   - Google Drive API is enabled");
  console.log("   - Service account has valid JSON key");
}

validateGoogleSheetsCredentials();
