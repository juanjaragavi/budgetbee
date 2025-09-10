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

// Extend window for an installation guard
declare global {
  interface Window {
    __adzepBridgeInstalled?: boolean;
  }
}

/**
 * Detect whether the current page contains ad units that require AdZep activation.
 * Covers both legacy UK ids and new US ids, plus generic ad-zone containers.
 */
function pageHasAdUnits(): boolean {
  const selector = [
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

  return !!document.querySelector(selector);
}

/**
 * Attempt to activate AdZep if ad units are present.
 */
async function activateIfNeeded(reason: string): Promise<void> {
  try {
    if (!pageHasAdUnits()) {
      // No ad slots on this page; do nothing.
      return;
    }

    // Force activation on navigations to ensure the global SPA state doesn't skip us.
    await activateAdZep({
      force: true,
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 500,
    });

    // Helpful console trace for verification (visible in dev tools)
    // eslint-disable-next-line no-console
    console.debug(`[AdZepBridge] Activation attempted due to: ${reason}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[AdZepBridge] Activation error:", err);
  }
}

/**
 * Install bridge once per session.
 */
function installBridge(): void {
  if (typeof window === "undefined") return;
  if (window.__adzepBridgeInstalled) return;
  window.__adzepBridgeInstalled = true;

  // Helper: schedule multiple checks as content settles after navigation
  const scheduleActivation = (reason: string) => {
    const delays = [0, 150, 350, 750, 1500];
    for (const d of delays) {
      setTimeout(() => activateIfNeeded(reason), d);
    }
  };

  // Initial attempt (first load / hydration)
  queueMicrotask(() => {
    scheduleActivation("initial");
  });

  // Fire after every client-side navigation completes
  addEventListener("astro:page-load", () => {
    scheduleActivation("astro:page-load");
  });

  // Defensive: also listen to after-swap in case some pages mount content later
  addEventListener("astro:after-swap", () => {
    scheduleActivation("astro:after-swap");
  });

  // Extra safety nets for unusual navigation flows
  addEventListener("astro:page-start", () => {
    // page-start occurs before the swap; schedule follow-up checks
    scheduleActivation("astro:page-start");
  });

  // When tab becomes visible again after backgrounding
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      scheduleActivation("visibilitychange");
    }
  });

  // History navigations (back/forward)
  window.addEventListener("popstate", () => {
    scheduleActivation("popstate");
  });
}

// Auto-install
installBridge();
