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

async function debugGoogleSheetsAuth() {
  console.log("🔍 Google Sheets Authentication Debug Tool");
  console.log("=".repeat(60));

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

    // Check private key format
    console.log("\n🔑 Private Key Analysis:");
    if (privateKey.includes("BEGIN PRIVATE KEY")) {
      console.log("✅ Private key contains proper header");
    } else {
      console.log("❌ Private key missing proper header");
    }

    if (privateKey.includes("END PRIVATE KEY")) {
      console.log("✅ Private key contains proper footer");
    } else {
      console.log("❌ Private key missing proper footer");
    }

    // Clean up private key (replace \\n with actual newlines)
    const cleanPrivateKey = privateKey.replace(/\\n/g, "\n");
    console.log(`Cleaned private key length: ${cleanPrivateKey.length} chars`);

    // Try Method 1: Using JWT authentication
    console.log("\n🚀 Method 1: JWT Authentication");
    try {
      const auth = new google.auth.JWT(
        clientEmail,
        undefined,
        cleanPrivateKey,
        ["https://www.googleapis.com/auth/spreadsheets"],
      );

      // Try to get access token
      console.log("Getting access token...");
      const tokenResponse = await auth.getAccessToken();
      console.log("✅ Successfully obtained access token");
      console.log(
        `Token starts with: ${tokenResponse.token?.substring(0, 20)}...`,
      );

      // Test with Sheets API
      const sheets = google.sheets({ version: "v4", auth });

      const response = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      console.log("✅ JWT Method: Successfully connected to Google Sheets");
      console.log(`Spreadsheet title: ${response.data.properties?.title}`);
    } catch (jwtError) {
      console.log("❌ JWT Method failed:", jwtError.message);
      console.log("JWT Error code:", jwtError.code);
    }

    // Try Method 2: Using credentials object
    console.log("\n🚀 Method 2: Credentials Object Authentication");
    try {
      const credentials = {
        type: "service_account",
        project_id: "absolute-brook-452020-d5",
        private_key_id: "dummy-key-id",
        private_key: cleanPrivateKey,
        client_email: clientEmail,
        client_id: "dummy-client-id",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
      };

      const auth2 = google.auth.fromJSON(credentials);
      auth2.scopes = ["https://www.googleapis.com/auth/spreadsheets"];

      const sheets2 = google.sheets({ version: "v4", auth: auth2 });

      const response2 = await sheets2.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      console.log(
        "✅ Credentials Method: Successfully connected to Google Sheets",
      );
      console.log(`Spreadsheet title: ${response2.data.properties?.title}`);
    } catch (credError) {
      console.log("❌ Credentials Method failed:", credError.message);
      console.log("Credentials Error code:", credError.code);
    }

    // Try Method 3: Direct service account key file approach
    console.log("\n🚀 Method 3: Creating temporary service account key file");
    try {
      const keyFileContent = {
        type: "service_account",
        project_id: "absolute-brook-452020-d5",
        private_key_id: "temp-key-id",
        private_key: cleanPrivateKey,
        client_email: clientEmail,
        client_id: "123456789",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
      };

      // Write temporary key file
      const tempKeyPath = path.join(__dirname, "temp-service-key.json");
      fs.writeFileSync(tempKeyPath, JSON.stringify(keyFileContent, null, 2));

      const auth3 = new google.auth.GoogleAuth({
        keyFile: tempKeyPath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets3 = google.sheets({ version: "v4", auth: auth3 });

      const response3 = await sheets3.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      console.log(
        "✅ Key File Method: Successfully connected to Google Sheets",
      );
      console.log(`Spreadsheet title: ${response3.data.properties?.title}`);

      // Clean up temp file
      fs.unlinkSync(tempKeyPath);
    } catch (keyFileError) {
      console.log("❌ Key File Method failed:", keyFileError.message);
      console.log("Key File Error code:", keyFileError.code);

      // Clean up temp file if it exists
      const tempKeyPath = path.join(__dirname, "temp-service-key.json");
      if (fs.existsSync(tempKeyPath)) {
        fs.unlinkSync(tempKeyPath);
      }
    }
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
debugGoogleSheetsAuth();
