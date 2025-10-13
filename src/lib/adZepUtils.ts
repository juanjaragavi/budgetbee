/**
 * AdZep Activation Utilities
 * Provides utilities for managing AdZep activation in Astro SPA
 */

/**
 * Global activation state management
 */
export interface AdZepState {
  activated: boolean;
  activationInProgress: boolean;
  lastActivation: number | null;
  activationAttempts: number;
  lastError: string | null;
}

// Initialize global state
if (typeof window !== "undefined") {
  window.__adZepState = window.__adZepState || {
    activated: false,
    activationInProgress: false,
    lastActivation: null,
    activationAttempts: 0,
    lastError: null,
  };
}

/**
 * Safely activate AdZep ads with comprehensive protection against duplicate calls
 * @param options Configuration options for activation
 * @returns Promise<boolean> indicating success/failure
 */
export async function activateAdZep(
  options: {
    force?: boolean;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
  } = {},
): Promise<boolean> {
  const {
    force = false,
    timeout = 5000,
    retryAttempts = 2,
    retryDelay = 1000,
  } = options;

  // Only run in browser environment
  if (typeof window === "undefined") {
    console.warn("[AdZep] Cannot activate in non-browser environment");
    return false;
  }

  const state = window.__adZepState;
  const now = Date.now();

  // Implement cooldown period to prevent rapid successive calls
  const cooldownPeriod = 2000; // 2 seconds minimum between activations
  if (state.lastActivation && !force) {
    const timeSinceLastActivation = now - state.lastActivation;
    if (timeSinceLastActivation < cooldownPeriod) {
      console.log(
        `[AdZep] Activation throttled (${timeSinceLastActivation}ms since last, cooldown: ${cooldownPeriod}ms)`,
      );
      return state.activated;
    }
  }

  // Check if already activated (unless forced)
  if (!force && state.activated) {
    console.log("[AdZep] Already activated, skipping...");
    return true;
  }

  // Check if activation is in progress
  if (state.activationInProgress) {
    console.log("[AdZep] Activation already in progress, waiting...");

    // Wait for current activation to complete with timeout
    const maxWaitTime = 8000; // 8 seconds max wait
    const startWait = Date.now();

    return new Promise((resolve) => {
      const checkCompletion = () => {
        const waitedTime = Date.now() - startWait;

        if (!state.activationInProgress) {
          console.log(
            `[AdZep] Activation completed after ${waitedTime}ms wait`,
          );
          resolve(state.activated);
        } else if (waitedTime >= maxWaitTime) {
          console.warn(`[AdZep] Activation wait timeout after ${waitedTime}ms`);
          // Reset the flag to allow retry
          state.activationInProgress = false;
          resolve(false);
        } else {
          setTimeout(checkCompletion, 200);
        }
      };
      setTimeout(checkCompletion, 200);
    });
  }

  // Set activation in progress
  state.activationInProgress = true;
  state.activationAttempts++;

  console.log(
    `[AdZep] Starting activation attempt ${state.activationAttempts}...`,
  );

  try {
    // Wait for AdZepActivateAds function to be available
    const adZepFunction = await waitForAdZepFunction(timeout);

    if (!adZepFunction) {
      const errorMsg = "AdZepActivateAds function not available within timeout";
      state.lastError = errorMsg;
      throw new Error(errorMsg);
    }

    // Activate the ads with error suppression for external ad networks
    console.log("[AdZep] Calling AdZepActivateAds...");
    await safelyActivateAdZep(adZepFunction);

    // Mark as successfully activated
    state.activated = true;
    state.lastActivation = now;
    state.lastError = null;

    console.log("[AdZep] Ads activated successfully");
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    state.lastError = errorMessage;
    console.error("[AdZep] Error during activation:", error);

    // Retry logic - but only if we haven't exceeded retry attempts
    if (state.activationAttempts < retryAttempts) {
      console.log(
        `[AdZep] Retrying activation in ${retryDelay}ms... (attempt ${state.activationAttempts + 1}/${retryAttempts})`,
      );

      // Clear the in-progress flag before retry
      state.activationInProgress = false;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(activateAdZep({ ...options, force: true }));
        }, retryDelay);
      });
    }

    console.error(
      `[AdZep] All activation attempts exhausted (${state.activationAttempts}/${retryAttempts})`,
    );
    return false;
  } finally {
    // Always clear the in-progress flag
    state.activationInProgress = false;
  }
}

/**
 * Wait for AdZepActivateAds function to become available
 * @param timeout Maximum time to wait in milliseconds
 * @returns Promise that resolves to the function or null if timeout
 */
function waitForAdZepFunction(timeout: number): Promise<(() => void) | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkFunction = () => {
      if (typeof window.AdZepActivateAds === "function") {
        resolve(window.AdZepActivateAds);
        return;
      }

      if (Date.now() - startTime >= timeout) {
        console.warn(
          "[AdZep] Timeout waiting for AdZepActivateAds function. This may be due to ad blockers or script loading issues.",
        );
        resolve(null);
        return;
      }

      // Check again after a short delay
      setTimeout(checkFunction, 100);
    };

    checkFunction();
  });
}

/**
 * Wrap AdZep activation with error boundary to gracefully handle external ad network failures
 * @param activateFunction The AdZepActivateAds function to call
 */
async function safelyActivateAdZep(
  activateFunction: () => void,
): Promise<void> {
  try {
    // Suppress expected CORS and network errors from external ad services
    const originalFetch = window.fetch;
    const suppressedDomains = [
      "secure.omeda.com",
      "securepubads.g.doubleclick.net",
    ];

    // Temporarily wrap fetch to catch and suppress expected errors
    window.fetch = async function (...args) {
      try {
        return await originalFetch.apply(this, args);
      } catch (error) {
        const url = args[0]?.toString() || "";
        const isSuppressed = suppressedDomains.some((domain) =>
          url.includes(domain),
        );

        if (isSuppressed) {
          // Suppress expected ad network errors (ad blockers, CORS, etc.)
          console.debug(
            `[AdZep] External ad request failed (expected): ${url}`,
          );
          // Return a dummy response to prevent breaking the page
          return new Response(null, { status: 204 });
        }

        // Re-throw other errors
        throw error;
      }
    };

    // Call the activation function
    activateFunction();

    // Restore original fetch after a short delay
    setTimeout(() => {
      window.fetch = originalFetch;
    }, 2000);
  } catch (error) {
    console.error("[AdZep] Activation execution error:", error);
    throw error;
  }
}

/**
 * Reset activation state (useful for testing or forced re-activation)
 * This clears both our internal tracking AND AdZep's external state
 */
export function resetAdZepState(): void {
  if (typeof window !== "undefined") {
    // Reset our internal state
    if (window.__adZepState) {
      window.__adZepState.activated = false;
      window.__adZepState.activationInProgress = false;
      window.__adZepState.lastActivation = null;
      window.__adZepState.activationAttempts = 0;
      window.__adZepState.lastError = null;
      console.log("[AdZep] Internal state reset");
    }

    // Reset AdZep's external state by clearing relevant localStorage/sessionStorage
    try {
      // Clear AdZep's state tracking in localStorage
      const adZepKeys = Object.keys(localStorage).filter(
        (key) =>
          key.includes("AdZep") ||
          key.includes("adzep") ||
          key.includes("offerwall") ||
          key.includes("rewarded"),
      );
      adZepKeys.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`[AdZep] Cleared localStorage key: ${key}`);
      });

      // Clear AdZep's state tracking in sessionStorage
      const adZepSessionKeys = Object.keys(sessionStorage).filter(
        (key) =>
          key.includes("AdZep") ||
          key.includes("adzep") ||
          key.includes("offerwall") ||
          key.includes("rewarded"),
      );
      adZepSessionKeys.forEach((key) => {
        sessionStorage.removeItem(key);
        console.log(`[AdZep] Cleared sessionStorage key: ${key}`);
      });

      // If AdZep exposes a reset function, call it
      if (typeof (window as any).AdZepReset === "function") {
        (window as any).AdZepReset();
        console.log("[AdZep] Called AdZepReset()");
      }

      // Clear any AdZep-related window properties that might hold state
      const adZepWindowProps = Object.keys(window).filter(
        (key) =>
          (key.includes("AdZep") || key.includes("adzep")) &&
          !key.includes("AdZepActivateAds") && // Keep the activation function
          !key.includes("__adZepState"), // Keep our state object
      );
      adZepWindowProps.forEach((key) => {
        try {
          delete (window as any)[key];
          console.log(`[AdZep] Cleared window property: ${key}`);
        } catch (e) {
          // Some properties might be read-only
        }
      });

      console.log("[AdZep] External AdZep state cleared");
    } catch (error) {
      console.warn("[AdZep] Error clearing external AdZep state:", error);
    }
  }
}

/**
 * Get current activation state
 */
export function getAdZepState(): AdZepState | null {
  if (typeof window !== "undefined" && window.__adZepState) {
    return { ...window.__adZepState };
  }
  return null;
}

/**
 * Check if AdZep is activated
 */
export function isAdZepActivated(): boolean {
  const state = getAdZepState();
  return state?.activated || false;
}

/**
 * Check if the current page is the Quiz page (should not activate ads)
 * Uses strict detection to avoid false positives
 */
function isQuizPage(): boolean {
  if (typeof window === "undefined") return false;

  // Check URL path - most reliable method
  const path = window.location.pathname;
  if (
    path === "/quiz" ||
    path === "/qz" ||
    path === "/quiz/" ||
    path === "/qz/"
  ) {
    return true;
  }

  // Check for quiz-specific footer element (more specific than before)
  const hasQuizFooter = !!document.querySelector(".quiz-min-footer");

  // Check for quiz step containers (very specific to Quiz page)
  const hasQuizSteps = !!document.querySelector(
    '.quiz-step-1, .quiz-step-2, [id^="quiz-step-"]',
  );

  return hasQuizFooter || hasQuizSteps;
}

/**
 * Detect whether current page contains AdZep ad units
 */
export function pageHasAdUnits(): boolean {
  if (typeof document === "undefined") return false;

  // Skip ad detection entirely on Quiz pages
  if (isQuizPage()) {
    console.log("[AdZep Utils] Quiz page detected, skipping ad activation");
    return false;
  }

  const selector = [
    "#us_budgetbeepro_1",
    "#us_budgetbeepro_2",
    "#us_budgetbeepro_3",
    "#us_budgetbeepro_4",
    "#uk_topfinanzas_3",
    "#uk_topfinanzas_4",
    '[id^="us_budgetbeepro_"]',
    '[id^="uk_topfinanzas_"]',
    ".ad-zone",
  ].join(", ");

  const adElements = document.querySelectorAll(selector);
  const hasAds = adElements.length > 0;

  console.log(
    `[AdZep Utils] Ad unit detection: found ${adElements.length} ad containers`,
    hasAds
      ? Array.from(adElements).map((el) => `#${el.id || el.className}`)
      : [],
  );

  return hasAds;
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    AdZepActivateAds?: () => void;
    __adZepState: AdZepState;
  }
}
