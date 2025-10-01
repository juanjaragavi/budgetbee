/**
 * Recommender Page Guard Script
 *
 * Inline script that runs immediately on recommender pages to:
 * 1. Mark that user has accessed recommender
 * 2. Install history manipulation to prevent back navigation to quiz
 * 3. Set up event listeners for navigation attempts
 */

import { installRecommenderGuard } from "@/lib/utils/quizNavigationGuard";

// Install guard immediately
installRecommenderGuard();

// Re-install on Astro page transitions
document.addEventListener("astro:page-load", () => {
  installRecommenderGuard();
});

// Re-install after view transitions
document.addEventListener("astro:after-swap", () => {
  installRecommenderGuard();
});

console.log("[QuizGuard] Recommender guard script loaded");
