/**
 * AdZep Activator Component
 * Ensures window.AdZepActivateAds() is called exactly once per page load
 * Designed for Astro SPA architecture to prevent duplicate calls
 */

import React, { useEffect, useRef } from "react";
import { activateAdZep, isAdZepActivated } from "../../lib/adZepUtils";

const AdZepActivator: React.FC = () => {
  const activationAttempted = useRef(false);

  useEffect(() => {
    // Exclude quiz page from ad activation
    if (
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/quiz")
    ) {
      console.log("[AdZepActivator] Quiz page detected, skipping ad activation.");
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
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default AdZepActivator;
