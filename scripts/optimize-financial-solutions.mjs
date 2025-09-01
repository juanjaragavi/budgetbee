import fs from "fs";
import path from "path";

const FS_DIR = "src/content/financial-solutions";
const BLOG_DIR = "src/content/personal-finance";

function sluggifyFilename(file) {
  return file.replace(/\.(md|mdx)$/, "");
}

function parseFrontmatterTitle(content) {
  const fmMatch = content.match(/^---\s*([\s\S]*?)\s*---/m);
  if (!fmMatch) return null;
  const fm = fmMatch[1];
  const titleMatch = fm.match(/^\s*title:\s*["']([^"']+)["']/m);
  return titleMatch ? titleMatch[1] : null;
}

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function writeFileIfChanged(p, oldContent, newContent, summary) {
  if (newContent !== oldContent) {
    fs.writeFileSync(p, newContent, "utf8");
    summary.changed.push(p);
  } else {
    summary.unchanged.push(p);
  }
}

function seededIndices(seed, length, count) {
  // Simple deterministic pseudo-random selection based on seed (string)
  let s = 0;
  for (let i = 0; i < seed.length; i++)
    s = (s * 31 + seed.charCodeAt(i)) & 0x7fffffff;
  const indices = new Set();
  for (let i = 0; i < length && indices.size < count; i++) {
    s = (1103515245 * s + 12345) & 0x7fffffff;
    const idx = s % length;
    indices.add(idx);
  }
  return Array.from(indices);
}

function buildPools() {
  const files = fs.readdirSync(FS_DIR).filter((f) => f.endsWith(".mdx"));
  const benefits = files.filter((f) => f.endsWith("-benefits.mdx"));
  const requirements = files.filter((f) => f.endsWith("-requirements.mdx"));

  const productPool = benefits.map((file) => {
    const full = path.join(FS_DIR, file);
    const content = readFileSafe(full) || "";
    const title = parseFrontmatterTitle(content) || sluggifyFilename(file);
    const slug = sluggifyFilename(file); // used under /financial-solutions/<slug>
    return { file, slug, title, full };
  });

  // Blog pool
  const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const blogPool = blogFiles.map((file) => {
    const full = path.join(BLOG_DIR, file);
    const content = readFileSafe(full) || "";
    const title = parseFrontmatterTitle(content) || sluggifyFilename(file);
    const slug = sluggifyFilename(file); // used under /personal-finance/<slug>
    return { file, slug, title, full };
  });

  return { productPool, benefits, requirements, blogPool };
}

const BUTTON_REGEX = /<Button\b[\s\S]*?\/>/g;
const ATTR_LABEL_REGEX = /label\s*=\s*"(.*?)"/;
const ATTR_LINK_REGEX = /link\s*=\s*"(.*?)"/;

function makeBenefitsCTA(reqSlug) {
  return [
    "<Button",
    '  label="See Requirements"',
    `  link="/financial-solutions/${reqSlug}"`,
    "/>",
  ].join("\n");
}

function stripLinksFromText(md) {
  // Remove markdown links and HTML anchors, keep display text
  let out = md.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  out = out.replace(/<a\s+[^>]*href="[^"]+"[^>]*>([\s\S]*?)<\/a>/g, "$1");
  return out;
}

function ensureAdZoneImport(content) {
  // If AdZone already imported, do nothing
  if (content.includes(`from "@/shortcodes/AdZone"`) || content.includes(`from '@/shortcodes/AdZone'`)) {
    return content;
  }
  // Find the end of the MDX frontmatter block (--- ... ---)
  const fmMatch = content.match(/^---\s*[\s\S]*?---\s*/m);
  if (fmMatch) {
    const insertAt = fmMatch[0].length;
    const importLine = `import AdZone from "@/shortcodes/AdZone";\n\n`;
    return content.slice(0, insertAt) + importLine + content.slice(insertAt);
  }
  // No frontmatter found; insert at top
  return `import AdZone from "@/shortcodes/AdZone";\n\n` + content;
}

function optimizeBenefits(filePath, content, summary) {
  const filename = path.basename(filePath);
  const reqSlug = sluggifyFilename(filename).replace(
    /-benefits$/,
    "-requirements",
  );
  const desired = makeBenefitsCTA(reqSlug);

  // Remove all existing Button blocks
  let newContent = content.replace(BUTTON_REGEX, "");

  // Append desired CTA at the end (ensuring trailing newline separation)
  newContent = newContent.trimEnd() + "\n\n" + desired + "\n";

  if (newContent !== content) {
    summary.benefitsFixed.push(path.basename(filePath));
  }
  // Insert AdZone before the last section heading; fallback to CTA position
  const btns = findCTAButtons(newContent);
  const fallbackIdx = btns.length ? btns[0].index : newContent.length;
  const adInsB = insertAdZoneBeforeLastHeading(newContent, fallbackIdx);
  newContent = adInsB.content;

  // Ensure AdZone import for MDX
  newContent = ensureAdZoneImport(newContent);

  return newContent;
}

function findCTAButtons(content) {
  const matches = [];
  let m;
  while ((m = BUTTON_REGEX.exec(content)) !== null) {
    matches.push({ index: m.index, text: m[0], length: m[0].length });
  }
  return matches;
}

function getButtonLink(buttonText) {
  const lm = buttonText.match(ATTR_LINK_REGEX);
  return lm ? lm[1] : null;
}

function getButtonLabel(buttonText) {
  const lm = buttonText.match(ATTR_LABEL_REGEX);
  return lm ? lm[1] : null;
}

function chooseExternalCTA(buttons) {
  // Prefer the last button with an external link (http/https)
  const externals = buttons.filter((b) =>
    /^https?:\/\//.test(getButtonLink(b.text) || ""),
  );
  if (externals.length > 0) return externals[externals.length - 1];
  // Fallback: last button
  return buttons[buttons.length - 1];
}

function insertInlineSuggestions(
  seed,
  content,
  products,
  blogs,
  excludeProductSlug,
  ctaStartIndex,
) {
  if (products.length <= 1 || blogs.length === 0)
    return { content, inserted: false };

  const prodCandidates = products.filter((p) => p.slug !== excludeProductSlug);
  if (prodCandidates.length === 0) return { content, inserted: false };

  const prodCount = Math.min(2, prodCandidates.length);
  const prodIdxs = seededIndices(
    seed + "-prod",
    prodCandidates.length,
    prodCount,
  );
  const chosenProducts = prodIdxs.map((i) => prodCandidates[i]);

  const blogIdxs = seededIndices(seed + "-blog", blogs.length, 1);
  const chosenBlog = blogs[blogIdxs[0]];

  const productsText = chosenProducts
    .map((p) => `[${p.title}](/financial-solutions/${p.slug})`)
    .join(" or ");
  const suggestion = `\n\n> Also consider ${productsText}. For a deeper dive, read [${chosenBlog.title}](/personal-finance/${chosenBlog.slug}).\n\n`;

  // Avoid duplicate insertion if suggestion already present (old or new format)
  if (content.includes(suggestion) || content.includes("> Also consider ")) {
    return { content, inserted: false };
  }

  // Try to insert after the 2nd h3 if available, else before CTA
  const h3Matches = [...content.matchAll(/^###\s.+$/gm)].map((m) => ({
    index: m.index,
    text: m[0],
  }));
  let insertPos = -1;
  if (h3Matches.length >= 2) {
    // insert after 2nd heading line end
    const second = h3Matches[1];
    const nextNewline = content.indexOf(
      "\n",
      second.index + second.text.length,
    );
    insertPos =
      nextNewline === -1 ? second.index + second.text.length : nextNewline + 1;
  } else if (h3Matches.length >= 1) {
    const first = h3Matches[0];
    const nextNewline = content.indexOf("\n", first.index + first.text.length);
    insertPos =
      nextNewline === -1 ? first.index + first.text.length : nextNewline + 1;
  } else {
    // No headings, insert right before CTA
    insertPos = Math.max(0, ctaStartIndex);
  }

  if (insertPos < 0 || insertPos > ctaStartIndex) {
    // Safety: ensure we don't insert after the CTA
    insertPos = Math.max(0, ctaStartIndex);
  }

  const newContent =
    content.slice(0, insertPos) + suggestion + content.slice(insertPos);
  return { content: newContent, inserted: true };
}

function insertAdZoneBeforeLastHeading(content, fallbackIndex) {
  // Avoid duplicate insertion if AdZone already exists
  if (content.includes("<AdZone") || content.includes('id="us_budgetbeepro_4"')) {
    return { content, inserted: false };
  }
  const h3Matches = [...content.matchAll(/^###\s.+$/gm)];
  let insertPos = -1;
  if (h3Matches.length >= 1) {
    const last = h3Matches[h3Matches.length - 1];
    insertPos = last.index;
  } else {
    // No headings; fall back to the provided boundary (e.g., CTA start)
    insertPos = Math.max(0, fallbackIndex);
  }
  // Ensure we never insert after the fallback boundary (e.g., CTA)
  if (insertPos > fallbackIndex) {
    insertPos = Math.max(0, fallbackIndex);
  }
  const insertion = "\n\n<AdZone id=\"us_budgetbeepro_4\" />\n\n";
  const updated = content.slice(0, insertPos) + insertion + content.slice(insertPos);
  return { content: updated, inserted: true };
}

function optimizeRequirements(
  filePath,
  content,
  productPool,
  blogPool,
  summary,
) {
  const filename = path.basename(filePath);
  const baseProductSlug = sluggifyFilename(filename).replace(
    /-requirements$/,
    "",
  );
  const buttons = findCTAButtons(content);
  if (buttons.length === 0) {
    // No CTA found - cannot fabricate external URL. Leave unchanged but note.
    summary.requirementsNoCTA.push(filename);
    return content;
  }

  // Keep exactly one CTA - the last external if present, else last button
  const keep = chooseExternalCTA(buttons);
  let newContent = content;
  // Remove all other buttons (iterate from end to avoid index shifting)
  for (let i = buttons.length - 1; i >= 0; i--) {
    const b = buttons[i];
    if (b.index === keep.index && b.length === keep.length) continue;
    newContent =
      newContent.slice(0, b.index) + newContent.slice(b.index + b.length);
  }
  // Cleanup malformed legacy suggestions (e.g., accidental extra brackets after links)
  newContent = newContent.replace(/\]\]/g, "]");
  // Fix patterns like "](url)]" -> "](url)"
  newContent = newContent.replace(/\]\(([^)]+)\)\]/g, "]($1)");

  // Re-find the kept CTA in the updated content to get accurate indices
  const keepLink = getButtonLink(keep.text);
  // Locate kept CTA in updated content by link
  let reButtons = findCTAButtons(newContent);
  let keptNow = null;
  for (const b of reButtons) {
    if (getButtonLink(b.text) === keepLink) {
      keptNow = b;
      break;
    }
  }
  if (!keptNow && reButtons.length) keptNow = reButtons[reButtons.length - 1];

  // Normalize CTA label
  if (keptNow) {
    const normalizedText = keptNow.text.replace(
      ATTR_LABEL_REGEX,
      'label="Apply on Official Site"',
    );
    newContent =
      newContent.slice(0, keptNow.index) +
      normalizedText +
      newContent.slice(keptNow.index + keptNow.length);
  }

  // Re-find kept CTA after normalization
  reButtons = findCTAButtons(newContent);
  let keptForInsert = null;
  for (const b of reButtons) {
    if (getButtonLink(b.text) === keepLink) {
      keptForInsert = b;
      break;
    }
  }
  if (!keptForInsert && reButtons.length)
    keptForInsert = reButtons[reButtons.length - 1];

  // Insert inline suggestions before CTA
  const ins = insertInlineSuggestions(
    filename,
    newContent,
    productPool,
    blogPool,
    baseProductSlug + "-benefits",
    keptForInsert ? keptForInsert.index : 0,
  );
  newContent = ins.content;
  if (ins.inserted) summary.requirementsInlineAdded.push(filename);

  // Insert AdZone before the last section heading; do not go past CTA
  {
    const adInsR = insertAdZoneBeforeLastHeading(newContent, keptForInsert ? keptForInsert.index : 0);
    newContent = adInsR.content;
  }

  // Ensure no links after CTA: strip markdown/HTML links from tail
  // Re-find CTA indices after insertion
  const reButtons2 = findCTAButtons(newContent);
  let keptAfterInsert = null;
  for (const b of reButtons2) {
    if (getButtonLink(b.text) === keepLink) {
      keptAfterInsert = b;
      break;
    }
  }
  if (!keptAfterInsert && reButtons2.length)
    keptAfterInsert = reButtons2[reButtons2.length - 1];

  const tailStart = keptAfterInsert.index + keptAfterInsert.length;
  let head = newContent.slice(0, tailStart);
  let tail = newContent.slice(tailStart);
  const tailClean = stripLinksFromText(tail);
  if (tail !== tailClean) summary.requirementsTailLinksStripped.push(filename);
  newContent = head + tailClean;

  // Ensure AdZone import for MDX
  newContent = ensureAdZoneImport(newContent);

  return newContent;
}

function run() {
  const summary = {
    changed: [],
    unchanged: [],
    benefitsFixed: [],
    requirementsInlineAdded: [],
    requirementsTailLinksStripped: [],
    requirementsNoCTA: [],
  };

  const { productPool, benefits, requirements, blogPool } = buildPools();

  // Optimize benefits: exactly one CTA to requirements with standardized label
  for (const file of benefits) {
    const full = path.join(FS_DIR, file);
    const content = readFileSafe(full);
    if (!content) continue;
    const newContent = optimizeBenefits(full, content, summary);
    writeFileIfChanged(full, content, newContent, summary);
  }

  // Optimize requirements: add inline varied links before CTA; strip links after CTA
  for (const file of requirements) {
    const full = path.join(FS_DIR, file);
    const content = readFileSafe(full);
    if (!content) continue;
    const newContent = optimizeRequirements(
      full,
      content,
      productPool,
      blogPool,
      summary,
    );
    writeFileIfChanged(full, content, newContent, summary);
  }

  // Report
  console.log("Optimization Summary:");
  console.log(`  Files changed: ${summary.changed.length}`);
  console.log(`  Files unchanged: ${summary.unchanged.length}`);
  console.log(
    `  Benefits fixed (single CTA enforced): ${summary.benefitsFixed.length}`,
  );
  console.log(
    `  Requirements with inline links added: ${summary.requirementsInlineAdded.length}`,
  );
  console.log(
    `  Requirements with tail links stripped: ${summary.requirementsTailLinksStripped.length}`,
  );
  if (summary.requirementsNoCTA.length) {
    console.log(
      "  Requirements pages without detectable CTA (left unchanged):",
    );
    summary.requirementsNoCTA.forEach((f) => console.log("   - " + f));
  }
}

run();
