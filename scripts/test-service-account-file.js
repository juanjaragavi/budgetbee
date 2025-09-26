#!/usr/bin/env node

const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

async function testWithServiceAccountFile() {
  console.log("🔍 Google Sheets Service Account File Test");
  console.log("=".repeat(50));

  try {
    // Load the service account JSON file
    const keyFilePath = path.join(
      __dirname,
      "..",
      "src",
      "lib",
      "absolute-brook-452020-d5-bfba282d0f42.json",
    );

    if (!fs.existsSync(keyFilePath)) {
      console.error("❌ Service account file not found at:", keyFilePath);
      process.exit(1);
    }

    console.log("✅ Service account file found");

    // Read the JSON file
    const serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, "utf8"));
    console.log("✅ Service account JSON parsed successfully");
    console.log(`Project ID: ${serviceAccount.project_id}`);
    console.log(`Client Email: ${serviceAccount.client_email}`);
    console.log(`Private Key ID: ${serviceAccount.private_key_id}`);

    // Load environment variables for sheet info
    const envPath = path.join(__dirname, "..", ".env");
    const envContent = fs.readFileSync(envPath, "utf8");
    const envVars = {};

    envContent.split("\n").forEach((line) => {
      if (line.trim() && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          let value = valueParts.join("=");
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

    const sheetId = envVars.GOOGLE_SHEET_ID;
    const sheetName = envVars.GOOGLE_SHEET_NAME || "registros";

    console.log(`\nSheet ID: ${sheetId}`);
    console.log(`Sheet Name: ${sheetName}`);

    // Initialize Google Auth using the service account file
    console.log("\n🚀 Testing Authentication...");

    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Test 1: Get spreadsheet info
    console.log("\n📊 Test 1: Spreadsheet Connection");
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    console.log("✅ Successfully connected to Google Sheets");
    console.log(
      `Spreadsheet title: ${spreadsheetResponse.data.properties?.title}`,
    );
    console.log(
      `Sheets count: ${spreadsheetResponse.data.sheets?.length || 0}`,
    );

    // List all sheets
    if (spreadsheetResponse.data.sheets) {
      console.log("Available sheets:");
      spreadsheetResponse.data.sheets.forEach((sheet, index) => {
        console.log(
          `  ${index + 1}. ${sheet.properties?.title} (${sheet.properties?.sheetType})`,
        );
      });
    }

    // Test 2: Read existing data
    console.log("\n📖 Test 2: Read Data");
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:T10`,
    });

    console.log("✅ Successfully read from sheet");
    console.log(`Rows found: ${readResponse.data.values?.length || 0}`);

    if (readResponse.data.values && readResponse.data.values.length > 0) {
      console.log("First row (headers):");
      console.log(readResponse.data.values[0]);

      if (readResponse.data.values.length > 1) {
        console.log("Sample data row:");
        console.log(readResponse.data.values[1]);
      }
    }

    // Test 3: Write new data
    console.log("\n✍️  Test 3: Write Data");
    const testRow = [
      "Service Account Test", // A: Name
      "service-test@budgetbee.com", // B: Email
      "Service", // C: First Name
      "Test", // D: Last Name
      "High credit limit", // E: Preference
      "$75,000+", // F: Income
      "true", // G: Accepted Terms
      "US", // H: Country
      "service-test-" + Date.now(), // I: External ID
      "BudgetBee", // J: Brand
      "service", // K: UTM Source
      "test", // L: UTM Medium
      "service-campaign", // M: UTM Campaign
      "service-content", // N: UTM Content
      "service-term", // O: UTM Term
      "direct", // P: Referrer
      "Service Account Test User Agent", // Q: User Agent
      "http://localhost:4321/service-test", // R: Page URL
      new Date().toISOString(), // S: Timestamp
      "service-test-" + Date.now(), // T: Submission ID
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

    // Test 4: Verify the write by reading the last few rows
    console.log("\n🔍 Test 4: Verify Written Data");
    const verifyResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:T`,
    });

    if (verifyResponse.data.values && verifyResponse.data.values.length > 0) {
      const lastRow =
        verifyResponse.data.values[verifyResponse.data.values.length - 1];
      console.log("✅ Last row in sheet:");
      console.log(lastRow);
    }

    console.log(
      "\n🎉 All tests passed! Google Sheets integration is working perfectly.",
    );
    console.log("\n📋 Summary:");
    console.log("✅ Service account authentication successful");
    console.log("✅ Spreadsheet connection established");
    console.log("✅ Data reading functional");
    console.log("✅ Data writing functional");
    console.log("✅ Ready for production use");
  } catch (error) {
    console.error("\n💥 Test failed with error:");
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

// Run the test
testWithServiceAccountFile();
