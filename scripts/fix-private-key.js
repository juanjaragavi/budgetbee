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

async function fixPrivateKeyAndTest() {
  console.log("🔧 Google Sheets Private Key Fix & Test");
  console.log("=".repeat(50));

  try {
    // Load environment variables
    const envVars = loadEnvFile();
    console.log("✅ Environment variables loaded");

    const clientEmail = envVars.GOOGLE_SHEETS_CLIENT_EMAIL;
    let privateKey = envVars.GOOGLE_PRIVATE_KEY;
    const sheetId = envVars.GOOGLE_SHEET_ID;
    const sheetName = envVars.GOOGLE_SHEET_NAME || "registros";

    console.log("\n🔑 Private Key Diagnostics:");
    console.log(`Original length: ${privateKey.length} chars`);

    // Try different private key formats
    const privateKeyVariants = [
      // Variant 1: Original key
      privateKey,

      // Variant 2: Replace \\n with actual newlines
      privateKey.replace(/\\n/g, "\n"),

      // Variant 3: Try to extract just the key part if it's wrapped
      privateKey.includes("-----BEGIN")
        ? privateKey.replace(/\\n/g, "\n")
        : `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`,

      // Variant 4: Clean and reformat
      privateKey
        .replace(/\\n/g, "\n")
        .replace(/\s+/g, "\n")
        .replace(/\n+/g, "\n"),
    ];

    for (let i = 0; i < privateKeyVariants.length; i++) {
      const variant = privateKeyVariants[i];
      console.log(`\n🧪 Testing Private Key Variant ${i + 1}:`);
      console.log(`Length: ${variant.length} chars`);
      console.log(
        `Has BEGIN: ${variant.includes("-----BEGIN PRIVATE KEY-----")}`,
      );
      console.log(`Has END: ${variant.includes("-----END PRIVATE KEY-----")}`);
      console.log(`First 50 chars: ${variant.substring(0, 50)}...`);

      try {
        // Create service account credentials object
        const credentials = {
          type: "service_account",
          project_id: "absolute-brook-452020-d5",
          private_key_id: "test-key-id",
          private_key: variant,
          client_email: clientEmail,
          client_id: "123456789",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url:
            "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
        };

        // Write temporary key file
        const tempKeyPath = path.join(
          __dirname,
          `temp-key-variant-${i + 1}.json`,
        );
        fs.writeFileSync(tempKeyPath, JSON.stringify(credentials, null, 2));

        console.log(`Created temp key file: ${tempKeyPath}`);

        const auth = new google.auth.GoogleAuth({
          keyFile: tempKeyPath,
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });

        // Test the connection
        const response = await sheets.spreadsheets.get({
          spreadsheetId: sheetId,
        });

        console.log(`✅ SUCCESS with Variant ${i + 1}!`);
        console.log(`Spreadsheet title: ${response.data.properties?.title}`);
        console.log(`Sheets count: ${response.data.sheets?.length || 0}`);

        // Test read operation
        const readResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: `${sheetName}!A1:T5`,
        });

        console.log(
          `✅ Read test successful: ${readResponse.data.values?.length || 0} rows found`,
        );

        // Test write operation
        const testRow = [
          "Fix Test",
          "fix-test@budgetbee.com",
          "Fix",
          "Tester",
          "High credit limit",
          "$50,000+",
          "true",
          "US",
          "fix-test-" + Date.now(),
          "BudgetBee",
          "fix",
          "test",
          "fix-campaign",
          "fix-content",
          "fix-term",
          "direct",
          "Fix Test User Agent",
          "http://localhost:4321/fix-test",
          new Date().toISOString(),
          "fix-test-" + Date.now(),
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

        console.log(
          `✅ Write test successful: ${writeResponse.data.updates?.updatedRows} rows added`,
        );

        // Clean up temp file
        fs.unlinkSync(tempKeyPath);

        console.log("\n🎉 WORKING PRIVATE KEY FORMAT FOUND!");
        console.log(
          `Use Variant ${i + 1} format for your Google Sheets service`,
        );

        // Save the working private key format for reference
        fs.writeFileSync(
          path.join(__dirname, "working-private-key.txt"),
          variant,
        );
        console.log(
          "💾 Working private key saved to scripts/working-private-key.txt",
        );

        return; // Exit on success
      } catch (error) {
        console.log(`❌ Variant ${i + 1} failed: ${error.message}`);

        // Clean up temp file
        const tempKeyPath = path.join(
          __dirname,
          `temp-key-variant-${i + 1}.json`,
        );
        if (fs.existsSync(tempKeyPath)) {
          fs.unlinkSync(tempKeyPath);
        }

        continue; // Try next variant
      }
    }

    console.log("\n❌ All private key variants failed");
  } catch (error) {
    console.error("\n💥 Fix attempt failed with error:");
    console.error("Message:", error.message);
    process.exit(1);
  }
}

// Run the fix tool
fixPrivateKeyAndTest();
