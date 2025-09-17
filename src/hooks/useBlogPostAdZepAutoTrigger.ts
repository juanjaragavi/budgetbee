/**
 * React Hook for Blog Post AdZep Auto-Trigger
 *
 * This hook provides React components with the ability to programmatically
 * trigger the Reset → Activate sequence for AdZep on blog post pages.
 *
 * Usage:
 * ```tsx
 * import { useBlogPostAdZepAutoTrigger } from './useBlogPostAdZepAutoTrigger';
 *
 * function MyComponent() {
 *   const { triggerResetActivate, isEligibleBlogPost } = useBlogPostAdZepAutoTrigger();
 *
 *   // The hook automatically triggers on mount if it's a blog post with ad units
 *   // You can also manually trigger: triggerResetActivate();
 * }
 * ```
 */

import { useEffect, useCallback, useState } from "react";
import {
  triggerResetThenActivate,
  isBlogPostWithAdUnits,
} from "../lib/blogPostAdZepAutoTrigger";

export interface UseBlogPostAdZepAutoTriggerReturn {
  /** Whether the current page is eligible for auto-trigger (blog post with ad units) */
  isEligibleBlogPost: boolean;
  /** Manually trigger the Reset → Activate sequence */
  triggerResetActivate: () => Promise<void>;
  /** Whether auto-trigger has been attempted on this page load */
  hasAutoTriggered: boolean;
}

/**
 * React hook for managing blog post AdZep auto-trigger functionality
 *
 * @param autoTriggerOnMount - Whether to automatically trigger on component mount (default: true)
 * @param delayMs - Delay in milliseconds before triggering (default: 100)
 */
export function useBlogPostAdZepAutoTrigger(
  autoTriggerOnMount: boolean = true,
  delayMs: number = 100,
): UseBlogPostAdZepAutoTriggerReturn {
  const [isEligibleBlogPost, setIsEligibleBlogPost] = useState(false);
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);

  // Check if current page is eligible for auto-trigger
  useEffect(() => {
    const checkEligibility = () => {
      const eligible = isBlogPostWithAdUnits();
      setIsEligibleBlogPost(eligible);
      return eligible;
    };

    // Initial check
    checkEligibility();

    // Re-check on Astro page transitions
    const handlePageLoad = () => {
      checkEligibility();
      setHasAutoTriggered(false); // Reset for new page
    };

    document.addEventListener("astro:page-load", handlePageLoad);
    document.addEventListener("astro:after-swap", handlePageLoad);

    return () => {
      document.removeEventListener("astro:page-load", handlePageLoad);
      document.removeEventListener("astro:after-swap", handlePageLoad);
    };
  }, []);

  // Manual trigger function
  const triggerResetActivate = useCallback(async (): Promise<void> => {
    if (!isEligibleBlogPost) {
      console.warn(
        "[useBlogPostAdZepAutoTrigger] Not eligible for auto-trigger - not a blog post with ad units",
      );
      return;
    }

    try {
      await triggerResetThenActivate("manual-react-hook");
      setHasAutoTriggered(true);
    } catch (error) {
      console.error(
        "[useBlogPostAdZepAutoTrigger] Error during manual trigger:",
        error,
      );
    }
  }, [isEligibleBlogPost]);

  // Auto-trigger on mount
  useEffect(() => {
    if (!autoTriggerOnMount || !isEligibleBlogPost || hasAutoTriggered) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        await triggerResetThenActivate("auto-react-hook");
        setHasAutoTriggered(true);
      } catch (error) {
        console.error(
          "[useBlogPostAdZepAutoTrigger] Error during auto-trigger:",
          error,
        );
      }
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [autoTriggerOnMount, isEligibleBlogPost, hasAutoTriggered, delayMs]);

  return {
    isEligibleBlogPost,
    triggerResetActivate,
    hasAutoTriggered,
  };
}
