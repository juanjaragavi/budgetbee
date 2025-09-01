/**
 * AdZep Activator Component
 * Ensures window.AdZepActivateAds() is called exactly once per page load
 * Designed for Astro SPA architecture to prevent duplicate calls
 */

import React, { useEffect, useRef } from "react";
import { activateAdZep, isAdZepActivated } from "../../lib/adZepUtils";

const AdZepActivator: React.FC = () => {
  const activationAttempted = useRef(false);
  const autosizerInitialized = useRef(false);

  useEffect(() => {
    // Exclude quiz page from ad activation
    if (
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/quiz")
    ) {
      console.log(
        "[AdZepActivator] Quiz page detected, skipping ad activation.",
      );
      return;
    }

    // Prevent multiple activations from the same component instance
    if (activationAttempted.current) {
      return;
    }

    activationAttempted.current = true;

    // Check if already activated
    if (isAdZepActivated()) {
      console.log("[AdZepActivator] Already activated, skipping...");
      return;
    }

    // Lightweight auto-sizer for AdZep ad containers
    const startAutoSizer = () => {
      if (autosizerInitialized.current) return;
      autosizerInitialized.current = true;

      const containersSelector = '[id^="us_budgetbeepro_"], .ad-zone';

      const applySize = (el: Element) => {
        const c = el as HTMLElement;
        if (!c) return;

        // ensure containers don't clip
        c.style.overflow = "visible";
        c.style.height = "auto";

        // measure after layout
        requestAnimationFrame(() => {
          let h = Math.max(c.scrollHeight, c.getBoundingClientRect().height);

          // consider common ad DOM (iframes or first child wrapper)
          const iframes = Array.from(
            c.querySelectorAll("iframe"),
          ) as HTMLIFrameElement[];
          for (const f of iframes) {
            h = Math.max(h, f.offsetHeight);
          }
          const first = c.firstElementChild as HTMLElement | null;
          if (first) {
            h = Math.max(h, first.offsetHeight, first.scrollHeight);
          }

          if (h && h > 0) {
            c.style.minHeight = `${h}px`;
          }
        });
      };

      const seed = () => {
        document.querySelectorAll(containersSelector).forEach(applySize);
      };

      // initial pass
      seed();

      // Watch DOM for changes within ad containers
      const mo = new MutationObserver(() => seed());
      mo.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      // Resize observers on containers
      const ro =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => seed())
          : null;
      document
        .querySelectorAll(containersSelector)
        .forEach((el) => ro?.observe(el));

      // Expose cleanup
      (window as any).__adZepAutoSizerCleanup = () => {
        mo.disconnect();
        ro?.disconnect();
        autosizerInitialized.current = false;
      };
    };

    // Activate AdZep with error handling and retry logic
    const performActivation = async () => {
      try {
        const success = await activateAdZep({
          timeout: 5000,
          retryAttempts: 3,
          retryDelay: 500,
        });

        if (success) {
          console.log("[AdZepActivator] Successfully activated AdZep");
          startAutoSizer();
        } else {
          console.warn(
            "[AdZepActivator] Failed to activate AdZep after all attempts",
          );
        }
      } catch (error) {
        console.error(
          "[AdZepActivator] Unexpected error during activation:",
          error,
        );
      }
    };

    // Small delay to ensure DOM is ready and scripts are loaded
    const timeoutId = setTimeout(() => {
      performActivation();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      (window as any).__adZepAutoSizerCleanup?.();
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default AdZepActivator;
