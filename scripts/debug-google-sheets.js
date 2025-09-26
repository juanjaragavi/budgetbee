#!/usr/bin/env node

const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found at:", envPath);
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const envVars = {};

  envContent.split("\n").forEach((line) => {
    if (line.trim() && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        let value = valueParts.join("=");

        // Handle quoted values
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        envVars[key.trim()] = value;
      }
    }
  });

  return envVars;
}

async function debugGoogleSheets() {
  console.log("🔍 Google Sheets Debug Tool");
  console.log("=".repeat(50));

  try {
    // Load environment variables
    const envVars = loadEnvFile();
    console.log("✅ Environment variables loaded");

    // Check required variables
    const requiredVars = [
      "GOOGLE_SHEETS_CLIENT_EMAIL",
      "GOOGLE_PRIVATE_KEY",
      "GOOGLE_SHEET_ID",
    ];

    console.log("\n📋 Environment Variables Check:");
    for (const varName of requiredVars) {
      const value = envVars[varName];
      if (value) {
        console.log(`✅ ${varName}: Found (${value.length} chars)`);
      } else {
        console.log(`❌ ${varName}: Missing`);
      }
    }

    const clientEmail = envVars.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = envVars.GOOGLE_PRIVATE_KEY;
    const sheetId = envVars.GOOGLE_SHEET_ID;
    const sheetName = envVars.GOOGLE_SHEET_NAME || "Sheet1";

    if (!clientEmail || !privateKey || !sheetId) {
      console.error("\n❌ Missing required environment variables");
      process.exit(1);
    }

    console.log("\n🔐 Authentication Setup:");
    console.log(`Client Email: ${clientEmail}`);
    console.log(`Sheet ID: ${sheetId}`);
    console.log(`Sheet Name: ${sheetName}`);
    console.log(`Private Key Length: ${privateKey.length} chars`);

    // Clean up private key (replace \\n with actual newlines)
    const cleanPrivateKey = privateKey.replace(/\\n/g, "\n");

    // Initialize Google Auth
    const auth = new google.auth.JWT(clientEmail, undefined, cleanPrivateKey, [
      "https://www.googleapis.com/auth/spreadsheets",
    ]);

    console.log("\n🚀 Testing Google Sheets API...");

    // Initialize Sheets API
    const sheets = google.sheets({ version: "v4", auth });

    // Test 1: Simple connection test
    console.log("\n📊 Test 1: Basic Connection");
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      console.log("✅ Successfully connected to Google Sheets");
      console.log(`Spreadsheet title: ${response.data.properties?.title}`);
      console.log(`Sheets count: ${response.data.sheets?.length || 0}`);

      // List available sheets
      if (response.data.sheets) {
        console.log("Available sheets:");
        response.data.sheets.forEach((sheet, index) => {
          console.log(`  ${index + 1}. ${sheet.properties?.title}`);
        });
      }
    } catch (error) {
      console.error("❌ Connection test failed:", error.message);
      console.error("Error details:", {
        code: error.code,
        status: error.status,
        statusText: error.statusText,
      });
      throw error;
    }

    // Test 2: Read data test
    console.log("\n📖 Test 2: Read Data");
    try {
      const readResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:T10`,
      });

      console.log("✅ Successfully read from sheet");
      console.log(`Rows found: ${readResponse.data.values?.length || 0}`);

      if (readResponse.data.values && readResponse.data.values.length > 0) {
        console.log("First row (headers):");
        console.log(readResponse.data.values[0]);
      }
    } catch (error) {
      console.error("❌ Read test failed:", error.message);
      throw error;
    }

    // Test 3: Write test
    console.log("\n✍️  Test 3: Write Test");
    try {
      const testRow = [
        "Debug Test",
        "debug@test.com",
        "Debug",
        "Tester",
        "Test preference",
        "$50,000+",
        "true",
        "US",
        "debug-test-" + Date.now(),
        "BudgetBee",
        "debug",
        "test",
        "debug-campaign",
        "debug-content",
        "debug-term",
        "direct",
        "Debug User Agent",
        "http://localhost:4321/debug",
        new Date().toISOString(),
        "debug-" + Date.now(),
      ];

      const writeResponse = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:T`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [testRow],
        },
      });

      console.log("✅ Successfully wrote to sheet");
      console.log(`Updated range: ${writeResponse.data.updates?.updatedRange}`);
      console.log(`Updated rows: ${writeResponse.data.updates?.updatedRows}`);
    } catch (error) {
      console.error("❌ Write test failed:", error.message);
      throw error;
    }

    console.log(
      "\n🎉 All tests passed! Google Sheets integration is working correctly.",
    );
  } catch (error) {
    console.error("\n💥 Debug failed with error:");
    console.error("Message:", error.message);

    if (error.code) {
      console.error("Code:", error.code);
    }

    if (error.response?.data) {
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }

    process.exit(1);
  }
}

// Run the debug tool
debugGoogleSheets();
