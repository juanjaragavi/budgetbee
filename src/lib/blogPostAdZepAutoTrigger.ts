/**
 * Blog Post AdZep Auto-Reset-Activate Utility
 *
 * Implements a mechanism to programmatically trigger the "Reset" then "Activate"
 * sequence on blog post pages after they load, emulating the AdZep Debug Panel buttons.
 *
 * This is specifically designed for Financial Solutions and Personal Finance blog posts
 * that contain ad units (us_budgetbeepro_3, us_budgetbeepro_4) and need reliable
 * ad activation.
 */

import { resetAdZepState, activateAdZep } from "./adZepUtils";

declare global {
  interface Window {
    __blogPostAdZepAutoTriggerInstalled?: boolean;
    __blogPostAdZepDirectTimer?: number;
    AdZepActivateAds?: () => void;
  }
}

/**
 * Detect if the current page is a blog post page with Financial Solutions or Personal Finance content
 */
function isBlogPostWithAdUnits(): boolean {
  // Check for ad units specific to blog posts
  const hasAdUnits = !!(
    document.querySelector("#us_budgetbeepro_3") ||
    document.querySelector("#us_budgetbeepro_4")
  );

  // Check if URL matches blog post patterns
  const isFinancialSolutionPost = window.location.pathname.includes(
    "/financial-solutions/",
  );
  const isPersonalFinancePost =
    window.location.pathname.includes("/personal-finance/");

  return hasAdUnits && (isFinancialSolutionPost || isPersonalFinancePost);
}

/**
 * Programmatically trigger the Reset → Activate sequence
 * This emulates clicking the Reset button followed by the Activate button
 * in the AdZep Debug Panel
 */
async function triggerResetThenActivate(reason: string): Promise<void> {
  try {
    console.log(
      `[BlogPostAdZep] Starting Reset → Activate sequence due to: ${reason}`,
    );

    // Step 1: Reset (equivalent to clicking the Reset button)
    resetAdZepState();
    console.log(`[BlogPostAdZep] Reset completed`);

    // Step 2: Small delay to ensure reset has taken effect
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Step 3: Activate (equivalent to clicking the Activate button)
    const success = await activateAdZep({
      force: true,
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 500,
    });

    if (success) {
      console.log(
        `[BlogPostAdZep] Reset → Activate sequence completed successfully`,
      );
    } else {
      console.warn(
        `[BlogPostAdZep] Reset → Activate sequence failed to activate ads`,
      );
    }
  } catch (error) {
    console.error(
      `[BlogPostAdZep] Error during Reset → Activate sequence:`,
      error,
    );
  }
}

const MAX_DIRECT_ACTIVATION_ATTEMPTS = 5;

function invokeWindowAdZepActivateAds(reason: string, attempt = 1): void {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.AdZepActivateAds === "function") {
      window.AdZepActivateAds();
      console.log(
        `[BlogPostAdZep] window.AdZepActivateAds() executed (${reason}, attempt ${attempt})`,
      );
    } else if (attempt < MAX_DIRECT_ACTIVATION_ATTEMPTS) {
      window.__blogPostAdZepDirectTimer = window.setTimeout(() => {
        invokeWindowAdZepActivateAds(reason, attempt + 1);
      }, 100);
    } else {
      console.warn(
        `[BlogPostAdZep] window.AdZepActivateAds() unavailable after ${attempt} attempts (${reason})`,
      );
    }
  } catch (error) {
    console.error(
      `[BlogPostAdZep] Error executing window.AdZepActivateAds() (${reason}, attempt ${attempt}):`,
      error,
    );
  }
}

/**
 * Schedule the auto-trigger sequence with a 100ms delay after page load
 */
function scheduleAutoTrigger(reason: string): void {
  setTimeout(() => {
    if (isBlogPostWithAdUnits()) {
      if (typeof window !== "undefined" && window.__blogPostAdZepDirectTimer) {
        clearTimeout(window.__blogPostAdZepDirectTimer);
      }
      invokeWindowAdZepActivateAds(reason);
      triggerResetThenActivate(reason);
    }
  }, 100);
}

/**
 * Check if ad units are actually displaying content (not just present in DOM)
 */
function areAdUnitsDisplayingContent(): boolean {
  const adUnits = document.querySelectorAll(
    "#us_budgetbeepro_3, #us_budgetbeepro_4",
  );

  for (const adUnit of adUnits) {
    // Check if the ad unit has content (iframe, images, or significant text content)
    const hasIframe = adUnit.querySelector("iframe");
    const hasImages = adUnit.querySelector("img");
    const hasContent =
      adUnit.textContent && adUnit.textContent.trim().length > 50;

    if (hasIframe || hasImages || hasContent) {
      return true;
    }
  }

  return false;
}

/**
 * Schedule a reloader that retries the Reset → Activate sequence after 1 second
 * This handles cases where interstitial ads prevent initial activation
 */
function scheduleReloader(reason: string): void {
  setTimeout(() => {
    if (isBlogPostWithAdUnits()) {
      console.log(
        `[BlogPostAdZep] Reloader triggering Reset → Activate sequence due to: ${reason}`,
      );
      triggerResetThenActivate(`${reason}-reloader`);
    }
  }, 1000);
}

/**
 * Schedule an intelligent reloader that checks if ads are displaying and retries if not
 * This provides an additional safety net for interstitial ad scenarios
 */
function scheduleIntelligentReloader(reason: string): void {
  setTimeout(() => {
    if (isBlogPostWithAdUnits() && !areAdUnitsDisplayingContent()) {
      console.log(
        `[BlogPostAdZep] Intelligent reloader detected empty ad units, triggering Reset → Activate sequence due to: ${reason}`,
      );
      triggerResetThenActivate(`${reason}-intelligent-reloader`);
    }
  }, 2000);
}

/**
 * Install the blog post auto-trigger system
 * This runs once per session and listens for page load events
 */
function installBlogPostAutoTrigger(): void {
  if (typeof window === "undefined") return;
  if (window.__blogPostAdZepAutoTriggerInstalled) return;
  window.__blogPostAdZepAutoTriggerInstalled = true;

  console.log("[BlogPostAdZep] Auto-trigger system installed");

  // Initial page load / hydration
  queueMicrotask(() => {
    scheduleAutoTrigger("initial-load");
    // Add reloader for interstitial ad scenarios
    scheduleReloader("initial-load");
    // Add intelligent reloader as additional safety net
    scheduleIntelligentReloader("initial-load");
  });

  // Astro view transitions - main page load event
  document.addEventListener("astro:page-load", () => {
    scheduleAutoTrigger("astro:page-load");
    // Add reloader for interstitial ad scenarios
    scheduleReloader("astro:page-load");
    // Add intelligent reloader as additional safety net
    scheduleIntelligentReloader("astro:page-load");
  });

  // Astro view transitions - after content swap
  document.addEventListener("astro:after-swap", () => {
    scheduleAutoTrigger("astro:after-swap");
    // Add reloader for interstitial ad scenarios
    scheduleReloader("astro:after-swap");
    // Add intelligent reloader as additional safety net
    scheduleIntelligentReloader("astro:after-swap");
  });

  // Additional safety net for history navigation
  window.addEventListener("popstate", () => {
    scheduleAutoTrigger("popstate");
    // Add reloader for interstitial ad scenarios
    scheduleReloader("popstate");
    // Add intelligent reloader as additional safety net
    scheduleIntelligentReloader("popstate");
  });

  // Listen for visibility changes (when user returns to tab after interstitial)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      scheduleReloader("visibility-change");
    }
  });

  // Listen for focus events (when user interacts with page after interstitial)
  window.addEventListener("focus", () => {
    scheduleReloader("window-focus");
  });

  // Listen for click events that might indicate interstitial dismissal
  document.addEventListener(
    "click",
    () => {
      // Only trigger once per page load to avoid excessive calls
      if (!document.body.hasAttribute("data-interstitial-click-handled")) {
        document.body.setAttribute("data-interstitial-click-handled", "true");
        setTimeout(() => {
          scheduleReloader("user-interaction");
        }, 500);
      }
    },
    { once: true },
  );
}

// Auto-install the system
installBlogPostAutoTrigger();

export {
  triggerResetThenActivate,
  isBlogPostWithAdUnits,
  installBlogPostAutoTrigger,
};
