#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");

// Function to generate a date in the past
function generatePastDate(index, total) {
  // Use August 2024 as the base date (actually in the past)
  const baseDate = new Date("2024-08-31");
  // Spread posts over the last 90 days from the base date
  const daysAgo = Math.floor((index / total) * 90);
  const pastDate = new Date(baseDate);
  pastDate.setDate(pastDate.getDate() - daysAgo);

  // Randomize the time of day
  pastDate.setHours(Math.floor(Math.random() * 12) + 8); // Between 8 AM and 8 PM
  pastDate.setMinutes(0);
  pastDate.setSeconds(0);
  pastDate.setMilliseconds(0);

  return pastDate.toISOString();
}

// Function to update the date in a markdown file
async function updateFileDate(filePath, newDate) {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Find and replace the date in the frontmatter
    const updatedContent = content.replace(/^date:\s*.+$/m, `date: ${newDate}`);

    if (content !== updatedContent) {
      await fs.writeFile(filePath, updatedContent, "utf-8");
      console.log(`✅ Updated: ${path.basename(filePath)} -> ${newDate}`);
      return true;
    } else {
      console.log(`⚠️  No date found in: ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Function to process all files in a directory
async function processDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const mdFiles = files.filter(
      (f) => f.endsWith(".md") && !f.startsWith("-"),
    );

    console.log(`\n📁 Processing ${dirPath}...`);
    console.log(`Found ${mdFiles.length} markdown files\n`);

    let updatedCount = 0;

    for (let i = 0; i < mdFiles.length; i++) {
      const filePath = path.join(dirPath, mdFiles[i]);
      const newDate = generatePastDate(i, mdFiles.length);

      const updated = await updateFileDate(filePath, newDate);
      if (updated) updatedCount++;
    }

    console.log(
      `\n✨ Updated ${updatedCount} out of ${mdFiles.length} files in ${path.basename(dirPath)}`,
    );
    return updatedCount;
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
    return 0;
  }
}

// Main function
async function main() {
  console.log("🔧 Fixing blog post dates...\n");

  const baseDir = path.join(process.cwd(), "src", "content");
  const directories = [
    path.join(baseDir, "personal-finance"),
    path.join(baseDir, "financial-solutions"),
  ];

  let totalUpdated = 0;

  for (const dir of directories) {
    const updated = await processDirectory(dir);
    totalUpdated += updated;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`🎉 Complete! Updated ${totalUpdated} blog posts total.`);
  console.log("=".repeat(50));

  console.log("\n💡 Next steps:");
  console.log('1. Run "pnpm dev" to see the changes');
  console.log("2. The posts should now appear on the homepage and blog pages");
  console.log("3. Commit the changes when ready");
}

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
