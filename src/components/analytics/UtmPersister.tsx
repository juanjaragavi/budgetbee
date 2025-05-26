{
  /* // src/components/analytics/UtmPersister.tsx */
}
{
  /* Intentionally using .tsx extension for React component */
}
import { useEffect } from "react";

const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

export default function UtmPersister() {
  // Effect 1: Store UTM parameters from URL to sessionStorage on initial load or when new UTMs appear
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentSearchParams = new URLSearchParams(window.location.search);
    let newUtmsFoundInUrl = false;

    UTM_PARAM_KEYS.forEach((param) => {
      if (currentSearchParams.has(param)) {
        const valueFromUrl = currentSearchParams.get(param) || "";
        // Store if it's different from session storage or not in session storage,
        // to ensure URL always takes precedence for new UTMs.
        if (sessionStorage.getItem(param) !== valueFromUrl) {
          sessionStorage.setItem(param, valueFromUrl);
          newUtmsFoundInUrl = true;
        }
      }
    });

    // if (newUtmsFoundInUrl) {
    //   console.log("UTM Persister: Updated sessionStorage with UTMs from URL.");
    // }
  }, [typeof window !== "undefined" ? window.location.search : ""]); // Re-run if URL search string changes

  // Effect 2: Append stored UTM parameters to URL on navigation if they are missing
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyPersistedUtms = () => {
      const currentSearchParams = new URLSearchParams(window.location.search);
      const urlAlreadyHasAnyUtm = UTM_PARAM_KEYS.some((param) =>
        currentSearchParams.has(param),
      );

      // If the current URL already has *any* UTM parameter, let it be.
      // The first effect would have updated sessionStorage if these UTMs were new.
      if (urlAlreadyHasAnyUtm) {
        return;
      }

      const storedUtmParams: Record<string, string> = {};
      let hasStoredUtmParams = false;
      UTM_PARAM_KEYS.forEach((param) => {
        const storedValue = sessionStorage.getItem(param);
        if (storedValue !== null) {
          storedUtmParams[param] = storedValue;
          hasStoredUtmParams = true;
        }
      });

      if (hasStoredUtmParams) {
        const newSearchParams = new URLSearchParams(window.location.search); // Base on current params
        let modified = false;
        Object.entries(storedUtmParams).forEach(([key, value]) => {
          // Only add if not already present (though covered by urlAlreadyHasAnyUtm check)
          // This ensures we don't overwrite a non-UTM param with the same name if that edge case existed.
          if (!newSearchParams.has(key)) {
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
