/**
 * UTM Link Appender for Credit Card Recommender Pages
 *
 * Purpose:
 * - Automatically appends UTM parameters to all internal links on recommender pages
 * - Ensures UTM tracking persists through the user journey: Quiz → Recommender → Product Page
 * - Reads UTMs from URL params and sessionStorage for maximum persistence
 *
 * Usage:
 * - This script should be loaded on credit-card-recommender-p1, p2, and p3 pages
 * - Runs automatically on page load and after Astro view transitions
 */

declare global {
  interface Window {
    __utmLinksInitialized?: boolean;
  }
}

/**
 * Extract UTM parameters from current URL and sessionStorage
 */
function getUTMParameters(): URLSearchParams {
  const utmParams = new URLSearchParams();

  // UTM keys to preserve
  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];

  // First, try to get from URL
  const currentParams = new URLSearchParams(window.location.search);

  utmKeys.forEach((key) => {
    // Priority: URL params > sessionStorage
    let value = currentParams.get(key);

    if (!value) {
      // Fallback to sessionStorage if not in URL
      value = sessionStorage.getItem(key);
    }

    if (value) {
      utmParams.set(key, value);
      // Save to sessionStorage for persistence across navigations
      sessionStorage.setItem(key, value);
    }
  });

  return utmParams;
}

/**
 * Append UTM parameters to a link's href
 */
function appendUTMsToLink(
  link: HTMLAnchorElement,
  utmParams: URLSearchParams,
): void {
  try {
    // Skip external links
    if (link.hostname && link.hostname !== window.location.hostname) {
      return;
    }

    // Skip if already processed
    if (link.dataset.utmProcessed === "true") {
      return;
    }

    // Skip anchor links and javascript: links
    if (
      !link.href ||
      link.href.startsWith("#") ||
      link.href.startsWith("javascript:")
    ) {
      return;
    }

    // Parse the current link URL
    const url = new URL(link.href, window.location.origin);

    // Check if this is an internal link (same domain)
    if (url.hostname !== window.location.hostname) {
      return;
    }

    // Append UTM parameters (don't override existing ones)
    utmParams.forEach((value, key) => {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    });

    // Update the link href
    link.href = url.toString();

    // Mark as processed
    link.dataset.utmProcessed = "true";

    console.debug(`[UTM Link Appender] Updated link: ${link.href}`);
  } catch (error) {
    console.error("[UTM Link Appender] Error processing link:", error);
  }
}

/**
 * Process all links on the page
 */
function processAllLinks(): void {
  const utmParams = getUTMParameters();

  // If no UTM parameters, nothing to append
  if (utmParams.toString() === "") {
    console.debug("[UTM Link Appender] No UTM parameters found, skipping");
    return;
  }

  console.log(
    `[UTM Link Appender] Processing links with UTMs: ${utmParams.toString()}`,
  );

  // Get all links on the page
  const links = document.querySelectorAll("a[href]");

  links.forEach((link) => {
    appendUTMsToLink(link as HTMLAnchorElement, utmParams);
  });

  console.log(`[UTM Link Appender] Processed ${links.length} links on page`);
}

/**
 * Initialize the UTM link appender
 */
function initUTMLinkAppender(): void {
  if (typeof window === "undefined") return;

  // Prevent multiple initializations
  if (window.__utmLinksInitialized) {
    console.debug("[UTM Link Appender] Already initialized, skipping");
    return;
  }

  window.__utmLinksInitialized = true;

  console.log("[UTM Link Appender] Initializing...");

  // Process links on initial load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", processAllLinks);
  } else {
    processAllLinks();
  }

  // Re-process links after Astro view transitions
  document.addEventListener("astro:page-load", () => {
    console.log(
      "[UTM Link Appender] Astro page-load event, re-processing links",
    );
    processAllLinks();
  });

  // Also handle after-swap for immediate feedback
  document.addEventListener("astro:after-swap", () => {
    console.log(
      "[UTM Link Appender] Astro after-swap event, re-processing links",
    );
    processAllLinks();
  });

  // Observer for dynamically added links
  const observer = new MutationObserver((mutations) => {
    let hasNewLinks = false;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.tagName === "A" || element.querySelector("a[href]")) {
            hasNewLinks = true;
          }
        }
      });
    });

    if (hasNewLinks) {
      console.debug("[UTM Link Appender] New links detected, re-processing");
      processAllLinks();
    }
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("[UTM Link Appender] Initialization complete");
}

// Auto-initialize
initUTMLinkAppender();

export { initUTMLinkAppender, processAllLinks, getUTMParameters };
