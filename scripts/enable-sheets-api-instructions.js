#!/usr/bin/env node

console.log("⏳ Waiting for you to enable the Google Sheets API...");
console.log("");
console.log("Please complete these steps in Google Cloud Console:");
console.log(
  "1. Visit: https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=absolute-brook-452020-d5",
);
console.log('2. Click "Enable" button');
console.log("3. Wait for API to be enabled");
console.log("4. Come back and run: node scripts/debug-google-sheets.js");
console.log("");
console.log(
  "✅ Once done, the Google Sheets integration should work perfectly!",
);
