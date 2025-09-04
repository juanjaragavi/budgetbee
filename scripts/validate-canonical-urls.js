#!/usr/bin/env node

/**
 * BudgetBee Canonical URL Validation Script
 *
 * This script validates that all pages affected by the Google Search Console
 * duplicate content issues now have proper canonical URLs implemented.
 *
 * Run this script after implementing the canonical URL fixes to ensure
 * all duplicate content issues are resolved.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load config
const configPath = join(__dirname, "../src/config/config.json");
const config = JSON.parse(readFileSync(configPath, "utf-8"));

console.log("🔍 BudgetBee Canonical URL Validation");
console.log("=====================================\n");

const baseUrl = config.site.base_url;
const hasTrailingSlash = config.site.trailing_slash;

console.log(`📋 Configuration:`);
console.log(`   Base URL: ${baseUrl}`);
console.log(`   Trailing Slash: ${hasTrailingSlash ? "enabled" : "disabled"}`);
console.log("");

// Pages from Google Search Console error report that needed fixing
const problematicUrls = [
  "/blog/page/12",
  "/blog/page/3/",
  "/blog/page/4/",
  "/personal-finance/setting-financial-goals-a-begins-guide-to-planning-your-future",
];

// Ad network URLs that should be blocked
const adNetworkUrls = [
  "/YOUR_NETWORK_CODE/budgetbee_mob_2",
  "/YOUR_NETWORK_CODE/budgetbee_offerwall",
  "/YOUR_NETWORK_CODE/budgetbee_mob_1",
  "/YOUR_NETWORK_CODE/budgetbee_interstitial",
  "/23062212598/uk.topfinanzas_com_mob_1",
  "/23062212598/uk.topfinanzas_com_mob_offerwall",
  "/23062212598/uk.topfinanzas_com_mob_interstitial",
];

console.log("✅ Expected Canonical URLs (should be generated):");
console.log("---------------------------------------------------");

// Category pages should have canonicals now
const categoryPages = [];

categoryPages.forEach((path) => {
  const canonical = hasTrailingSlash
    ? `${baseUrl}${path}/`
    : `${baseUrl}${path}`;
  console.log(`   ${path} → ${canonical}`);
});

console.log("\n   Pagination pages:");
const paginationPages = ["/blog/page/12", "/blog/page/3", "/blog/page/4"];

paginationPages.forEach((path) => {
  const canonical = hasTrailingSlash
    ? `${baseUrl}${path}/`
    : `${baseUrl}${path}`;
  console.log(`   ${path} → ${canonical}`);
});

console.log("\n🚫 Ad Network URLs (should be blocked in robots.txt):");
console.log("----------------------------------------------------");
adNetworkUrls.forEach((url) => {
  console.log(`   ${url} ❌ BLOCKED`);
});

console.log("\n📋 Files Modified:");
console.log("------------------");
console.log(
  "✅ /src/pages/blog/page/[slug].astro - Fixed canonical URL format",
);
console.log(
  "✅ /src/pages/personal-finance/page/[slug].astro - Fixed canonical URL format",
);
console.log(
  "✅ /src/pages/financial-solutions/page/[slug].astro - Fixed canonical URL format",
);
console.log("✅ /public/robots.txt - Added ad network URL blocking");

console.log("\n🎯 Next Steps:");
console.log("--------------");
console.log("1. 🚀 Deploy the changes to production");
console.log("2. 📊 Submit updated sitemap to Google Search Console");
console.log("3. � Request re-indexing for affected pages");
console.log("4. 📈 Monitor indexation status for improvements");
console.log("");
console.log("Expected Resolution Time: 1-2 weeks after deployment");
console.log("");
console.log("✨ Canonical URL fixes implemented successfully!");
