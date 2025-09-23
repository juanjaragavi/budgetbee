{
  /* // src/components/analytics/UtmPersister.tsx */
}
{
  /* Intentionally using .tsx extension for React component */
}
import { useEffect } from "react";
import {
  extractUtmFromCurrentUrl,
  storeUtmParams,
  getStoredUtmParams,
  shouldApplyUtmToPage,
  validateUtmSource,
  UTM_PARAM_KEYS,
} from "@/lib/utils/utmUtils";

export default function UtmPersister() {
  // Effect 1: Store UTM parameters from URL to sessionStorage on initial load or when new UTMs appear
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentUtms = extractUtmFromCurrentUrl();

    // Only store UTM parameters if they exist and are from valid sources
    if (Object.keys(currentUtms).length > 0 && validateUtmSource(currentUtms)) {
      const storedUtms = getStoredUtmParams();

      // Check if current UTMs are different from stored ones
      const isDifferent = UTM_PARAM_KEYS.some(
        (key) => currentUtms[key] !== storedUtms[key],
      );

      if (isDifferent) {
        storeUtmParams(currentUtms);
        // console.log("UTM Persister: Updated sessionStorage with UTMs from URL.", currentUtms);
      }
    }
  }, [typeof window !== "undefined" ? window.location.search : ""]); // Re-run if URL search string changes

  // Effect 2: Conditionally append stored UTM parameters to URL on navigation
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyPersistedUtms = () => {
      const currentPath = window.location.pathname;

      // Check if UTM parameters should be applied to this page
      if (!shouldApplyUtmToPage(currentPath)) {
        return;
      }

      const currentSearchParams = new URLSearchParams(window.location.search);
      const urlAlreadyHasAnyUtm = UTM_PARAM_KEYS.some((param) =>
        currentSearchParams.has(param),
      );

      // If the current URL already has UTM parameters, respect them
      if (urlAlreadyHasAnyUtm) {
        return;
      }

      // For quiz pages, only apply UTM parameters if the user came from a campaign
      if (currentPath.startsWith("/quiz") || currentPath.includes("quiz")) {
        // Special handling for quiz pages - be more conservative
        const storedUtms = getStoredUtmParams();

        // Only apply UTM parameters to quiz if:
        // 1. They exist in storage
        // 2. They're from valid campaign sources
        // 3. The user didn't navigate directly to quiz
        if (
          Object.keys(storedUtms).length === 0 ||
          !validateUtmSource(storedUtms)
        ) {
          return;
        }

        // Check if this is a direct navigation to quiz (no referrer from our domain)
        const referrer = document.referrer;
        const isDirect =
          !referrer ||
          (!referrer.includes(window.location.hostname) &&
            !referrer.includes("budgetbeepro.com"));

        // For direct quiz access, don't apply stored UTM parameters
        if (isDirect) {
          return;
        }
      }

      const storedUtms = getStoredUtmParams();

      if (Object.keys(storedUtms).length > 0 && validateUtmSource(storedUtms)) {
        const newSearchParams = new URLSearchParams(window.location.search);
        let modified = false;

        Object.entries(storedUtms).forEach(([key, value]) => {
          if (value && !newSearchParams.has(key)) {
            newSearchParams.set(key, value);
            modified = true;
          }
        });

        if (modified) {
          const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
          history.replaceState(null, "", newUrl);
          // console.log("UTM Persister: URL updated with stored UTMs", newUrl);
        }
      }
    };

    // Listen for Astro's client-side navigation event
    document.addEventListener("astro:page-load", applyPersistedUtms);

    // Apply on initial load as well, in case astro:page-load isn't triggered for the very first page render.
    applyPersistedUtms();

    return () => {
      document.removeEventListener("astro:page-load", applyPersistedUtms);
    };
  }, []); // Runs once on mount

  return null; // This component does not render anything visible
}
