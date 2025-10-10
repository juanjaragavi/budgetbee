{
  /* // src/components/analytics/UtmMonitor.tsx */
}
{
  /* Intentionally using .tsx extension for React component */
}
import { useEffect } from "react";
import {
  extractUtmFromCurrentUrl,
  getStoredUtmParams,
} from "@/lib/utils/utmUtils";

export default function UtmMonitor() {
  useEffect(() => {
    // Only run in browser and in development mode
    if (typeof window === "undefined" || import.meta.env.PROD) {
      return;
    }

    const logUtmStatus = () => {
      console.log("\n===== UTM MONITOR =====");
      console.log(`Page: ${window.location.pathname}${window.location.search}`);

      const currentUtms = extractUtmFromCurrentUrl();
      console.log("UTM Parameters in URL:");
      if (Object.keys(currentUtms).length > 0) {
        Object.entries(currentUtms).forEach(([key, value]) => {
          console.log(`- ${key}: ${value}`);
        });
      } else {
        console.log("- None found in URL");
      }

      const storedUtms = getStoredUtmParams();
      console.log("UTM Parameters in sessionStorage:");
      if (Object.keys(storedUtms).length > 0) {
        Object.entries(storedUtms).forEach(([key, value]) => {
          console.log(`- ${key}: ${value}`);
        });
      } else {
        console.log("- None found in sessionStorage");
      }

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
