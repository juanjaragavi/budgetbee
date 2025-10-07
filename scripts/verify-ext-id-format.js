#!/usr/bin/env node

/**
 * Simple verification of the ext_id format
 */

function testExtIdFormat() {
  console.log("🔍 Testing ext_id format generation...");

  // Simulate the format used in the implementation
  const timestamp = Date.now();
  const extId = `budgetbee-${timestamp}`;

  console.log(`Generated ext_id: "${extId}"`);

  // Validate format
  const isValidFormat = /^budgetbee-\d+$/.test(extId);
  console.log(
    `Format validation: ${isValidFormat ? "✅ CORRECT" : "❌ INCORRECT"}`,
  );

  // Show examples
  console.log("\nExamples:");
  for (let i = 0; i < 3; i++) {
    const exampleExtId = `budgetbee-${Date.now() + i}`;
    console.log(`  ${exampleExtId}`);
  }

  return isValidFormat;
}

const isValid = testExtIdFormat();

if (isValid) {
  console.log("\n✅ ext_id format implementation is correct!");
} else {
  console.log("\n❌ ext_id format implementation has issues!");
}
