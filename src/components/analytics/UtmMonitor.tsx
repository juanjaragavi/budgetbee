{
  /* // src/components/analytics/UtmMonitor.tsx */
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

export default function UtmMonitor() {
  useEffect(() => {
    // Only run in browser and in development mode
    if (typeof window === "undefined" || import.meta.env.PROD) {
      return;
    }

    const logUtmStatus = () => {
      console.log("\n===== UTM MONITOR =====");
      console.log(`Page: ${window.location.pathname}${window.location.search}`);

      const urlParams = new URLSearchParams(window.location.search);
      console.log("UTM Parameters in URL:");
      let foundInUrl = false;
      UTM_PARAM_KEYS.forEach((param) => {
        if (urlParams.has(param)) {
          console.log(`- ${param}: ${urlParams.get(param)}`);
          foundInUrl = true;
        }
      });
      if (!foundInUrl) console.log("- None found in URL");

      console.log("UTM Parameters in sessionStorage:");
      let foundInStorage = false;
      UTM_PARAM_KEYS.forEach((param) => {
        const value = sessionStorage.getItem(param);
        if (value !== null) {
          console.log(`- ${param}: ${value}`);
          foundInStorage = true;
        }
      });
      if (!foundInStorage) console.log("- None found in sessionStorage");
      console.log("=======================\n");
    };

    // Log on initial load for the current page
    logUtmStatus();

    // Log on subsequent Astro client-side navigation
    document.addEventListener("astro:page-load", logUtmStatus);

    return () => {
      document.removeEventListener("astro:page-load", logUtmStatus);
    };
  }, []); // Runs once on mount

  return null; // This component doesn't render anything
}
