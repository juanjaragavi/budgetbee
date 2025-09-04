#!/usr/bin/env node

/**
 * BudgetBee Sitemap Generator and Validator
 *
 * This script helps generate, validate, and analyze the sitemap for SEO optimization.
 * It can be run independently to test sitemap configuration before building.
 */

import {
  generateSitemapData,
  validateSitemapEntry,
  shouldExcludeFromSitemap,
  PRIORITY_KEYWORDS,
} from "../src/lib/sitemap-config.js";

// Mock page data for testing (in real implementation, this would come from Astro)
const MOCK_PAGES = [
  "https://budgetbeepro.com/",
  "https://budgetbeepro.com/about/",
  "https://budgetbeepro.com/contact/",
  "https://budgetbeepro.com/blog/",
  "https://budgetbeepro.com/blog/page/2/",
  "https://budgetbeepro.com/personal-finance/",
  "https://budgetbeepro.com/personal-finance/budgeting-methods-compared-which-approach-fits-your-spending-style/",
  "https://budgetbeepro.com/personal-finance/building-good-money-habits-consistency-is-key/",
  "https://budgetbeepro.com/personal-finance/page/2/",
  "https://budgetbeepro.com/financial-solutions/",
  "https://budgetbeepro.com/financial-solutions/chase-freedom-unlimited-credit-card-benefits/",
  "https://budgetbeepro.com/financial-solutions/citi-double-cash-credit-card-benefits/",
  "https://budgetbeepro.com/financial-solutions/page/2/",
  "https://budgetbeepro.com/quiz/",
  "https://budgetbeepro.com/quiz-results/",
  "https://budgetbeepro.com/credit-card-recommender-p1/",
  "https://budgetbeepro.com/credit-card-recommender-p2/",
  "https://budgetbeepro.com/credit-card-recommender-p3/",
  "https://budgetbeepro.com/privacy-policy/",
  "https://budgetbeepro.com/terms-conditions/",
  "https://budgetbeepro.com/categories/",
  // Test excluded pages
  "https://budgetbeepro.com/api/test/",
  "https://budgetbeepro.com/admin/dashboard/",
];

/**
 * Generate and validate sitemap
 */
function generateAndValidateSitemap() {
  console.log("🚀 BudgetBee Sitemap Generator\n");

  // Filter out excluded pages
  const filteredPages = MOCK_PAGES.filter(
    (url) => !shouldExcludeFromSitemap(url),
  );
  console.log(
    `📊 Processing ${filteredPages.length} pages (${MOCK_PAGES.length - filteredPages.length} excluded)\n`,
  );

  // Generate sitemap data
  const sitemapData = generateSitemapData(filteredPages);

  // Validation report
  console.log("✅ Validation Report:");
  console.log(`   Total pages: ${sitemapData.length}`);
  console.log(
    `   All entries valid: ${sitemapData.every(validateSitemapEntry)}\n`,
  );

  // Priority analysis
  console.log("📈 Priority Distribution:");
  const priorityGroups = {
    "1.0 (Critical)": sitemapData.filter((item) => item.priority === 1.0)
      .length,
    "0.9-0.95 (High)": sitemapData.filter(
      (item) => item.priority >= 0.9 && item.priority < 1.0,
    ).length,
    "0.7-0.8 (Medium-High)": sitemapData.filter(
      (item) => item.priority >= 0.7 && item.priority < 0.9,
    ).length,
    "0.5-0.6 (Medium)": sitemapData.filter(
      (item) => item.priority >= 0.5 && item.priority < 0.7,
    ).length,
    "0.2-0.4 (Low)": sitemapData.filter(
      (item) => item.priority >= 0.2 && item.priority < 0.5,
    ).length,
  };

  Object.entries(priorityGroups).forEach(([range, count]) => {
    console.log(`   ${range}: ${count} pages`);
  });

  // Change frequency analysis
  console.log("\n📅 Change Frequency Analysis:");
  const freqGroups = sitemapData.reduce((acc, item) => {
    acc[item.changefreq] = (acc[item.changefreq] || 0) + 1;
    return acc;
  }, {});

  Object.entries(freqGroups).forEach(([freq, count]) => {
    console.log(`   ${freq}: ${count} pages`);
  });

  // Recent updates
  console.log("\n🕒 Recent Updates:");
  const today = new Date().toISOString().split("T")[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const recentUpdates = sitemapData.filter((item) => item.lastmod >= lastWeek);
  console.log(`   Updated in last 7 days: ${recentUpdates.length} pages`);
  console.log(
    `   Updated today: ${sitemapData.filter((item) => item.lastmod === today).length} pages`,
  );

  // High-priority pages
  console.log("\n⭐ High-Priority Pages (0.9+):");
  sitemapData
    .filter((item) => item.priority >= 0.9)
    .forEach((item) => {
      console.log(`   ${item.priority.toFixed(2)} - ${item.url}`);
    });

  // Sample XML output
  console.log("\n📄 Sample XML Output:");
  console.log(generateSampleXML(sitemapData.slice(0, 3)));

  return sitemapData;
}

/**
 * Generate sample XML for verification
 */
function generateSampleXML(entries) {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  const xmlEntries = entries
    .map(
      (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>${
      entry.images
        ? entry.images
            .map(
              (img) => `
    <image:image>
      <image:loc>https://budgetbeepro.com${img}</image:loc>
    </image:image>`,
            )
            .join("")
        : ""
    }
  </url>`,
    )
    .join("");

  const xmlFooter = "\n</urlset>";

  return xmlHeader + xmlEntries + xmlFooter;
}

/**
 * SEO recommendations based on sitemap analysis
 */
function generateSEORecommendations(sitemapData) {
  console.log("\n🎯 SEO Recommendations:\n");

  const highPriorityCount = sitemapData.filter(
    (item) => item.priority >= 0.9,
  ).length;
  const totalPages = sitemapData.length;
  const highPriorityPercentage = (highPriorityCount / totalPages) * 100;

  if (highPriorityPercentage > 15) {
    console.log(
      "⚠️  Too many high-priority pages (>15%). Consider redistributing priorities.",
    );
  } else {
    console.log(
      "✅ Good priority distribution - high-priority pages are well-balanced.",
    );
  }

  const dailyUpdates = sitemapData.filter(
    (item) => item.changefreq === "daily",
  ).length;
  if (dailyUpdates > 5) {
    console.log(
      "⚠️  Many pages set to daily updates. Ensure you can maintain this frequency.",
    );
  } else {
    console.log("✅ Reasonable update frequency distribution.");
  }

  console.log("\n📋 Optimization Checklist:");
  console.log("   □ Verify all high-priority pages load quickly (<2s)");
  console.log(
    "   □ Ensure content on daily/weekly pages is actually updated regularly",
  );
  console.log("   □ Check that lastmod dates reflect actual content changes");
  console.log("   □ Validate all URLs return 200 status codes");
  console.log("   □ Submit sitemap to Google Search Console");
  console.log("   □ Monitor sitemap indexing status regularly");

  console.log("\n🔍 Keyword Optimization:");
  console.log("   Target keywords should appear in high-priority page titles:");
  PRIORITY_KEYWORDS.forEach((keyword) => {
    console.log(`   • ${keyword}`);
  });
}

/**
 * Main execution
 */
function main() {
  try {
    const sitemapData = generateAndValidateSitemap();
    generateSEORecommendations(sitemapData);

    console.log("\n🎉 Sitemap generation and analysis complete!");
    console.log("\nNext steps:");
    console.log('1. Run "pnpm build" to generate actual sitemap files');
    console.log("2. Verify sitemap at: https://budgetbeepro.com/sitemap-0.xml");
    console.log("3. Submit to Google Search Console");
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateAndValidateSitemap, generateSEORecommendations };
