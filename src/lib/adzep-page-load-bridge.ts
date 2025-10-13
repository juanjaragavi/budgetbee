/**
 * AdZep Page-Load Bridge for Astro View Transitions
 *
 * Problem:
 * - With Astro's ClientRouter (View Transitions), client-side navigations don't fire normal
 *   window load events on subsequent pages. That prevented our ad activation from running.
 *
 * Solution:
 * - Listen for Astro's `astro:page-load` (and `astro:after-swap`) events and re-run the
 *   AdZep activation whenever a page containing ad units is navigated to.
 * - We only invoke activation when ad containers are present in the DOM.
 * - We force activation on these navigations to avoid being skipped by carry-over state.
 *
 * References:
 * - https://docs.astro.build/en/guides/view-transitions/#client-events
 */

import { activateAdZep } from "./adZepUtils";

// Extend window for an installation guard and debouncing
declare global {
  interface Window {
    __adzepBridgeInstalled?: boolean;
    __adzepLastActivation?: number;
    __adzepPendingActivation?: number | null;
  }
}

/**
 * Detect whether the current page contains ad units that require AdZep activation.
 * Covers both legacy UK ids and new US ids, plus generic ad-zone containers.
 */
function pageHasAdUnits(): boolean {
  const selector = [
    "#us_budgetbeepro_1",
    "#us_budgetbeepro_2",
    "#us_budgetbeepro_3",
    "#us_budgetbeepro_4",
    "#uk_topfinanzas_3",
    "#uk_topfinanzas_4",
    // Any container that starts with our common id prefixes
    '[id^="us_budgetbeepro_"]',
    '[id^="uk_topfinanzas_"]',
    // Generic containers we use around ads
    ".ad-zone",
  ].join(", ");

  const adElements = document.querySelectorAll(selector);
  const hasAds = adElements.length > 0;

  console.log(
    `[AdZepBridge] Ad unit detection: found ${adElements.length} ad containers`,
    hasAds
      ? Array.from(adElements).map((el) => `#${el.id || el.className}`)
      : [],
  );

  return hasAds;
}

/**
 * Attempt to activate AdZep if ad units are present.
 * Implements cooldown period to prevent rapid-fire activations.
 */
async function activateIfNeeded(reason: string): Promise<void> {
  try {
    // Check cooldown period (minimum 3 seconds between activations)
    const now = Date.now();
    const lastActivation = window.__adzepLastActivation || 0;
    const timeSinceLastActivation = now - lastActivation;
    const cooldownPeriod = 3000; // 3 seconds

    if (timeSinceLastActivation < cooldownPeriod) {
      console.debug(
        `[AdZepBridge] Activation throttled (${timeSinceLastActivation}ms since last, cooldown: ${cooldownPeriod}ms)`,
      );
      return;
    }

    if (!pageHasAdUnits()) {
      // No ad slots on this page; do nothing.
      console.debug(
        "[AdZepBridge] No ad units found on page, skipping activation",
      );
      return;
    }

    // Update last activation timestamp
    window.__adzepLastActivation = now;

    // Force activation on navigations to ensure the global SPA state doesn't skip us.
    await activateAdZep({
      force: true,
      timeout: 5000,
      retryAttempts: 2, // Reduced from 3 to minimize retry storms
      retryDelay: 1000, // Increased from 500ms to spread out retries
    });

    // Helpful console trace for verification (visible in dev tools)
    console.log(`[AdZepBridge] Activation completed due to: ${reason}`);
  } catch (err) {
    console.error("[AdZepBridge] Activation error:", err);
  }
}

/**
 * Debounced activation scheduler to prevent multiple rapid calls.
 * @param reason The reason for activation (for logging)
 * @param delay Delay in ms before attempting activation
 */
function scheduleActivation(reason: string, delay: number = 300): void {
  // Clear any pending activation
  if (window.__adzepPendingActivation) {
    clearTimeout(window.__adzepPendingActivation);
  }

  // Schedule new activation with debounce
  window.__adzepPendingActivation = window.setTimeout(() => {
    window.__adzepPendingActivation = null;
    activateIfNeeded(reason);
  }, delay);
}

/**
 * Install bridge once per session.
 */
function installBridge(): void {
  if (typeof window === "undefined") return;
  if (window.__adzepBridgeInstalled) return;
  window.__adzepBridgeInstalled = true;

  // Initial attempt (first load / hydration) - single attempt with longer delay
  // to allow DOM and external scripts to fully load
  queueMicrotask(() => {
    scheduleActivation("initial", 500);
  });

  // Fire after every client-side navigation completes
  // astro:page-load is the primary event, others are redundant
  addEventListener("astro:page-load", () => {
    scheduleActivation("astro:page-load", 400);
  });

  // Only use after-swap as fallback if page-load doesn't fire
  // This reduces duplicate activation attempts
  let pageLoadFired = false;
  addEventListener("astro:page-load", () => {
    pageLoadFired = true;
  });

  addEventListener("astro:after-swap", () => {
    if (!pageLoadFired) {
      scheduleActivation("astro:after-swap", 400);
    }
    pageLoadFired = false; // Reset for next navigation
  });

  // Remove other event listeners that cause duplicate activations
  // visibilitychange and popstate are handled by astro:page-load
}

// Auto-install
installBridge();
