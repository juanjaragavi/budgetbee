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

/**
 * Schedule the auto-trigger sequence with a 100ms delay after page load
 */
function scheduleAutoTrigger(reason: string): void {
  setTimeout(() => {
    if (isBlogPostWithAdUnits()) {
      triggerResetThenActivate(reason);
    }
  }, 100);
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
  });

  // Astro view transitions - main page load event
  document.addEventListener("astro:page-load", () => {
    scheduleAutoTrigger("astro:page-load");
  });

  // Astro view transitions - after content swap
  document.addEventListener("astro:after-swap", () => {
    scheduleAutoTrigger("astro:after-swap");
  });

  // Additional safety net for history navigation
  window.addEventListener("popstate", () => {
    scheduleAutoTrigger("popstate");
  });
}

// Auto-install the system
installBlogPostAutoTrigger();

export {
  triggerResetThenActivate,
  isBlogPostWithAdUnits,
  installBlogPostAutoTrigger,
};
