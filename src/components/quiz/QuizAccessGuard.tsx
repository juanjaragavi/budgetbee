/**
 * Quiz Access Guard Component
 *
 * Client-side component that prevents access to quiz pages after user
 * has completed the quiz and accessed recommender pages.
 */

import { useEffect } from "react";
import { guardQuizAccess } from "@/lib/utils/quizNavigationGuard";

export default function QuizAccessGuard() {
  useEffect(() => {
    // Run guard check immediately on mount
    guardQuizAccess();

    // Also check on page visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        guardQuizAccess();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for Astro page load events
    const handlePageLoad = () => {
      guardQuizAccess();
    };

    document.addEventListener("astro:page-load", handlePageLoad);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("astro:page-load", handlePageLoad);
    };
  }, []);

  return null; // This component doesn't render anything
}
