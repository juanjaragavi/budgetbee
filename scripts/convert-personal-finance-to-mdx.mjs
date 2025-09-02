/**
 * Convert all Personal Finance .md articles to .mdx and inject <AdZone id="us_budgetbeepro_4" />
 * immediately BEFORE the last in-article heading (##, ###, ####, #####, ######).
 *
 * Safety:
 * - Skips files that already contain <AdZone id="us_budgetbeepro_4" />
 * - Preserves frontmatter exactly as-is
 * - If no headings found, injects the AdZone near the end of the document (before trailing whitespace)
 * - Writes a new .mdx file, then deletes the old .md file
 * - Prints a summary of transformations
 */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PF_DIR = path.join(ROOT, "src", "content", "personal-finance");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function splitFrontmatter(raw) {
  // Returns { frontmatter: string|null, content: string, hasFM: boolean }
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) {
      const fm = raw.slice(0, end + 4); // include closing --- and newline
      const rest = raw.slice(end + 4);
      return { frontmatter: fm, content: rest, hasFM: true };
    }
  }
  return { frontmatter: null, content: raw, hasFM: false };
}

function injectAdZoneBeforeLastHeading(content) {
  // Find all headings of level 2-6 (## to ######) at start of a line
  const headingRegex = /^#{2,6}\s.+$/gm;
  let lastMatch = null;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    lastMatch = { index: match.index, text: match[0] };
  }

  const AD_BLOCK = `

<AdZone id="us_budgetbeepro_4" />

`;

  if (lastMatch) {
    // Insert just before the last heading
    return (
      content.slice(0, lastMatch.index) +
      AD_BLOCK +
      content.slice(lastMatch.index)
    );
  } else {
    // No headings found; append before trailing whitespace
    const trimmedEndIndex = content.replace(/\s+$/s, "").length;
    return (
      content.slice(0, trimmedEndIndex) +
      AD_BLOCK +
      content.slice(trimmedEndIndex)
    );
  }
}

function convertOne(file) {
  const raw = fs.readFileSync(file, "utf8");

  if (
    raw.includes("<AdZone") ||
    raw.includes('<AdZone id="us_budgetbeepro_4"')
  ) {
    return { file, skipped: true, reason: "already-contains-adzone" };
  }

  const { frontmatter, content } = splitFrontmatter(raw);
  let newContent = injectAdZoneBeforeLastHeading(content);

  const finalDoc = (frontmatter ? frontmatter : "") + newContent;

  const mdxPath = file.replace(/\.md$/i, ".mdx");
  fs.writeFileSync(mdxPath, finalDoc, "utf8");
  fs.unlinkSync(file);

  return { file, mdxPath, converted: true };
}

function run() {
  const all = walk(PF_DIR).filter((f) => f.toLowerCase().endsWith(".md"));
  const results = [];
  for (const md of all) {
    try {
      results.push(convertOne(md));
    } catch (e) {
      results.push({ file: md, error: String(e) });
    }
  }

  const summary = {
    scanned: all.length,
    converted: results.filter((r) => r.converted).length,
    skipped: results.filter((r) => r.skipped).length,
    errors: results.filter((r) => r.error).length,
    details: results,
  };

  console.log(JSON.stringify(summary, null, 2));
}

run();
