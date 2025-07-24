/**
 * BudgetBee Sitemap Configuration
 * Comprehensive sitemap management with detailed metadata for SEO optimization
 */

export interface SitemapEntry {
  url: string;
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
  lastmod: string;
  images?: string[];
}

/**
 * Core site pages with their SEO configuration
 */
export const CORE_PAGES: Record<string, Omit<SitemapEntry, "url">> = {
  // Homepage - Maximum priority, updated daily
  "/": {
    changefreq: "daily",
    priority: 1.0,
    lastmod: new Date().toISOString().split("T")[0],
    images: ["/images/og-image.png", "/images/banner-art.webp"],
  },

  // Main navigation pages
  "/about/": {
    changefreq: "monthly",
    priority: 0.9,
    lastmod: "2025-01-20",
  },
  "/contact/": {
    changefreq: "monthly",
    priority: 0.8,
    lastmod: "2025-01-15",
  },

  // Content hub pages - High priority, frequently updated
  "/blog/": {
    changefreq: "weekly",
    priority: 0.9,
    lastmod: new Date().toISOString().split("T")[0],
  },
  "/personal-finance/": {
    changefreq: "weekly",
    priority: 0.9,
    lastmod: new Date().toISOString().split("T")[0],
  },
  "/financial-solutions/": {
    changefreq: "weekly",
    priority: 0.9,
    lastmod: new Date().toISOString().split("T")[0],
  },

  // Interactive tools - High conversion value
  "/quiz/": {
    changefreq: "monthly",
    priority: 0.95,
    lastmod: "2025-01-20",
  },
  "/quiz-results/": {
    changefreq: "monthly",
    priority: 0.9,
    lastmod: "2025-01-20",
  },
  "/credit-card-recommender-p1/": {
    changefreq: "monthly",
    priority: 0.9,
    lastmod: "2025-01-15",
  },
  "/credit-card-recommender-p2/": {
    changefreq: "monthly",
    priority: 0.9,
    lastmod: "2025-01-15",
  },
  "/credit-card-recommender-p3/": {
    changefreq: "monthly",
    priority: 0.9,
    lastmod: "2025-01-15",
  },

  // Legal pages - Lower priority, rarely updated
  "/privacy-policy/": {
    changefreq: "yearly",
    priority: 0.3,
    lastmod: "2025-01-01",
  },
  "/terms-conditions/": {
    changefreq: "yearly",
    priority: 0.3,
    lastmod: "2025-01-01",
  },
  "/cookie-policy/": {
    changefreq: "yearly",
    priority: 0.3,
    lastmod: "2025-01-01",
  },

  // Utility pages
  "/categories/": {
    changefreq: "weekly",
    priority: 0.6,
    lastmod: new Date().toISOString().split("T")[0],
  },
  "/elements/": {
    changefreq: "yearly",
    priority: 0.2,
    lastmod: "2024-12-01",
  },
};

/**
 * Content-specific configurations for different page types
 */
export const CONTENT_PATTERNS: Record<
  string,
  Omit<SitemapEntry, "url" | "lastmod">
> = {
  // Personal finance articles
  "personal-finance-article": {
    changefreq: "monthly",
    priority: 0.7,
  },

  // Financial solutions/products
  "financial-solution": {
    changefreq: "monthly",
    priority: 0.7,
  },

  // Blog articles
  "blog-article": {
    changefreq: "monthly",
    priority: 0.6,
  },

  // Pagination pages
  pagination: {
    changefreq: "weekly",
    priority: 0.5,
  },
};

/**
 * High-value financial keywords for priority pages
 */
export const PRIORITY_KEYWORDS = [
  "budget calculator",
  "expense tracker",
  "savings goals",
  "credit card recommendations",
  "personal finance",
  "budgeting app",
  "financial planning",
  "debt management",
  "investment guidance",
  "retirement planning",
];

/**
 * Generate sitemap entry configuration based on URL pattern
 */
export function getSitemapConfig(url: string): Omit<SitemapEntry, "url"> {
  const path = url.replace("https://budgetbeepro.com", "");
  const normalizedPath = path.endsWith("/") ? path : path + "/";

  // Check for exact match in core pages
  if (CORE_PAGES[normalizedPath]) {
    return CORE_PAGES[normalizedPath];
  }

  // Pattern-based matching
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const now = new Date().toISOString().split("T")[0];

  // Personal finance articles
  if (path.includes("/personal-finance/") && path !== "/personal-finance/") {
    return {
      ...CONTENT_PATTERNS["personal-finance-article"],
      lastmod: lastWeek,
    };
  }

  // Financial solutions
  if (
    path.includes("/financial-solutions/") &&
    path !== "/financial-solutions/"
  ) {
    return {
      ...CONTENT_PATTERNS["financial-solution"],
      lastmod: lastWeek,
    };
  }

  // Blog articles
  if (path.includes("/blog/") && path !== "/blog/") {
    return {
      ...CONTENT_PATTERNS["blog-article"],
      lastmod: lastWeek,
    };
  }

  // Pagination pages
  if (path.includes("/page/")) {
    return {
      ...CONTENT_PATTERNS["pagination"],
      lastmod: now,
    };
  }

  // Default configuration for unmatched pages
  return {
    changefreq: "monthly",
    priority: 0.5,
    lastmod: lastWeek,
  };
}

/**
 * Validate sitemap entry according to XML sitemap standards
 */
export function validateSitemapEntry(entry: SitemapEntry): boolean {
  // URL validation
  if (!entry.url || !entry.url.startsWith("https://")) {
    return false;
  }

  // Priority validation (0.0 to 1.0)
  if (entry.priority < 0 || entry.priority > 1.0) {
    return false;
  }

  // Change frequency validation
  const validFrequencies = [
    "always",
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "never",
  ];
  if (!validFrequencies.includes(entry.changefreq)) {
    return false;
  }

  // Date validation (YYYY-MM-DD format)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(entry.lastmod)) {
    return false;
  }

  return true;
}

/**
 * Generate comprehensive sitemap data for all pages
 */
export function generateSitemapData(pages: string[]): SitemapEntry[] {
  return pages
    .map((url) => {
      const config = getSitemapConfig(url);
      return {
        url,
        ...config,
      };
    })
    .filter(validateSitemapEntry)
    .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)
}

/**
 * Pages that should be excluded from sitemap
 */
export const EXCLUDED_PATTERNS = [
  "/api/",
  "/admin/",
  "/_astro/",
  "/temp/",
  "/private/",
  "/.well-known/",
  "/404",
  "/500",
];

/**
 * Check if a URL should be excluded from sitemap
 */
export function shouldExcludeFromSitemap(url: string): boolean {
  return EXCLUDED_PATTERNS.some((pattern) => url.includes(pattern));
}
