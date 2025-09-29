/**
 * Utility functions for dynamic UTM parameter handling
 * Ensures UTM parameters are propagated only when they originate from actual campaigns
 */

export const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmParamKey = (typeof UTM_PARAM_KEYS)[number];

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Extracts UTM parameters from a URL search string
 */
export function extractUtmFromUrl(
  searchParams: URLSearchParams | string,
): UtmParams {
  const params =
    typeof searchParams === "string"
      ? new URLSearchParams(searchParams)
      : searchParams;

  const utmParams: UtmParams = {};

  UTM_PARAM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  return utmParams;
}

/**
 * Extracts UTM parameters from current browser URL
 */
export function extractUtmFromCurrentUrl(): UtmParams {
  if (typeof window === "undefined") return {};

  return extractUtmFromUrl(window.location.search);
}

/**
 * Checks if any UTM parameters exist in the current URL
 */
export function hasUtmInCurrentUrl(): boolean {
  if (typeof window === "undefined") return false;

  const currentParams = new URLSearchParams(window.location.search);
  return UTM_PARAM_KEYS.some((key) => currentParams.has(key));
}

/**
 * Gets UTM parameters from sessionStorage
 */
export function getStoredUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};

  const storedParams: UtmParams = {};

  UTM_PARAM_KEYS.forEach((key) => {
    const value = sessionStorage.getItem(key);
    if (value !== null) {
      storedParams[key] = value;
    }
  });

  return storedParams;
}

/**
 * Stores UTM parameters in sessionStorage
 */
export function storeUtmParams(params: UtmParams): void {
  if (typeof window === "undefined") return;

  UTM_PARAM_KEYS.forEach((key) => {
    const value = params[key];
    if (value) {
      sessionStorage.setItem(key, value);
    }
  });
}

/**
 * Clears UTM parameters from sessionStorage
 */
export function clearStoredUtmParams(): void {
  if (typeof window === "undefined") return;

  UTM_PARAM_KEYS.forEach((key) => {
    sessionStorage.removeItem(key);
  });
}

/**
 * Builds a URL with UTM parameters appended
 */
export function buildUrlWithUtm(baseUrl: string, utmParams: UtmParams): string {
  const url = new URL(baseUrl, window.location.origin);

  Object.entries(utmParams).forEach(([key, value]) => {
    if (value && UTM_PARAM_KEYS.includes(key as UtmParamKey)) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

/**
 * Gets the appropriate UTM parameters for a URL
 * Returns current URL UTMs if present, otherwise returns stored UTMs if they exist
 * Returns empty object for direct visits with no stored UTMs
 */
/**
 * Get relevant UTM parameters from sessionStorage
 * Only returns UTM parameters if utm_source is valid
 * If utm_source is invalid, clears all UTM parameters
 */
export function getRelevantUtmParams(): Record<string, string> {
  const utmParams: Record<string, string> = {};

  // Check utm_source first - if invalid, don't include any UTM parameters
  const utmSource = sessionStorage.getItem("utm_source");
  if (!utmSource || !validateUtmSource({ utm_source: utmSource })) {
    // Clear all UTM parameters if source is invalid to prevent partial campaign data
    UTM_PARAM_KEYS.forEach((key) => {
      sessionStorage.removeItem(key);
    });
    return {};
  }

  // Include utm_source and other UTM parameters
  UTM_PARAM_KEYS.forEach((key) => {
    const value = sessionStorage.getItem(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  return utmParams;
}

/**
 * Builds a quiz URL with appropriate UTM parameters
 * Only adds UTM parameters if they are available from actual campaigns
 */
export function buildQuizUrl(baseQuizUrl: string = "/quiz"): string {
  if (typeof window === "undefined") return baseQuizUrl;

  const relevantUtms = getRelevantUtmParams();

  // If no UTM parameters are available, return clean URL
  if (Object.keys(relevantUtms).length === 0) {
    return baseQuizUrl;
  }

  return buildUrlWithUtm(baseQuizUrl, relevantUtms);
}

/**
 * Determines if UTM parameters should be applied to a specific page
 * Some pages (like direct internal navigation) should not inherit UTM parameters
 */
export function shouldApplyUtmToPage(pathname: string): boolean {
  // Don't apply UTM to API routes, admin pages, or static assets
  const excludedPaths = [
    "/api/",
    "/admin/",
    "/images/",
    "/css/",
    "/js/",
    "/_astro/",
  ];

  return !excludedPaths.some((excluded) => pathname.startsWith(excluded));
}

/**
 * Validates if UTM parameters are from a legitimate campaign source
 * Helps prevent injection of arbitrary UTM parameters
 */
export function validateUtmSource(utmParams: UtmParams): boolean {
  if (!utmParams.utm_source) return true; // Allow empty utm_source

  // List of allowed UTM sources for BudgetBee
  const allowedSources = [
    "sendgrid",
    "email",
    "adwords",
    "google",
    "googleads",
    "facebook",
    "instagram",
    "twitter",
    "linkedin",
    "newsletter",
    "organic",
    "direct",
    "referral",
  ];

  return allowedSources.includes(utmParams.utm_source.toLowerCase());
}
