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
}

// Initialize global state
if (typeof window !== "undefined") {
  window.__adZepState = window.__adZepState || {
    activated: false,
    activationInProgress: false,
    lastActivation: null,
    activationAttempts: 0,
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
    retryAttempts = 3,
    retryDelay = 500,
  } = options;

  // Only run in browser environment
  if (typeof window === "undefined") {
    console.warn("[AdZep] Cannot activate in non-browser environment");
    return false;
  }

  const state = window.__adZepState;

  // Check if already activated (unless forced)
  if (!force && state.activated) {
    console.log("[AdZep] Already activated, skipping...");
    return true;
  }

  // Check if activation is in progress
  if (state.activationInProgress) {
    console.log("[AdZep] Activation already in progress, waiting...");

    // Wait for current activation to complete
    return new Promise((resolve) => {
      const checkCompletion = () => {
        if (!state.activationInProgress) {
          resolve(state.activated);
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      setTimeout(checkCompletion, 100);
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
      throw new Error("AdZepActivateAds function not available within timeout");
    }

    // Activate the ads
    console.log("[AdZep] Calling AdZepActivateAds...");
    adZepFunction();

    // Mark as successfully activated
    state.activated = true;
    state.lastActivation = Date.now();

    console.log("[AdZep] Ads activated successfully");
    return true;
  } catch (error) {
    console.error("[AdZep] Error during activation:", error);

    // Retry logic
    if (state.activationAttempts < retryAttempts) {
      console.log(`[AdZep] Retrying activation in ${retryDelay}ms...`);

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(activateAdZep({ ...options, force: true }));
        }, retryDelay);
      });
    }

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
 * Reset activation state (useful for testing or forced re-activation)
 */
export function resetAdZepState(): void {
  if (typeof window !== "undefined" && window.__adZepState) {
    window.__adZepState.activated = false;
    window.__adZepState.activationInProgress = false;
    window.__adZepState.lastActivation = null;
    window.__adZepState.activationAttempts = 0;
    console.log("[AdZep] State reset");
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
 * Detect whether current page contains AdZep ad units
 */
export function pageHasAdUnits(): boolean {
  if (typeof document === "undefined") return false;

  const selector = [
    "#us_budgetbeepro_3",
    "#us_budgetbeepro_4",
    "#uk_topfinanzas_3",
    "#uk_topfinanzas_4",
    '[id^="us_budgetbeepro_"]',
    '[id^="uk_topfinanzas_"]',
    ".ad-zone",
  ].join(", ");

  return !!document.querySelector(selector);
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    AdZepActivateAds?: () => void;
    __adZepState: AdZepState;
  }
}
