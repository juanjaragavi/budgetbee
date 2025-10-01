/**
 * Quiz Navigation Guard
 *
 * Prevents users from navigating back to the quiz page once they've reached
 * the credit card recommender pages. This ensures UTM parameter integrity
 * and prevents duplicate submissions or tracking issues.
 */

const STORAGE_KEY = "budgetbee_recommender_accessed";
const QUIZ_COMPLETED_KEY = "budgetbee_quiz_completed";

/**
 * Check if user has accessed a recommender page
 */
export function hasAccessedRecommender(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

/**
 * Mark that user has accessed a recommender page
 */
export function markRecommenderAccessed(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, "true");
  sessionStorage.setItem(QUIZ_COMPLETED_KEY, new Date().toISOString());
  console.log("[QuizGuard] Recommender page accessed, quiz navigation blocked");
}

/**
 * Check if current page is a quiz page
 */
export function isQuizPage(pathname?: string): boolean {
  if (typeof window === "undefined") return false;
  const path = pathname || window.location.pathname;
  return path === "/quiz" || path.startsWith("/quiz/");
}

/**
 * Check if current page is a recommender page
 */
export function isRecommenderPage(pathname?: string): boolean {
  if (typeof window === "undefined") return false;
  const path = pathname || window.location.pathname;
  return path.includes("/credit-card-recommender-");
}

/**
 * Get redirect URL with preserved UTM parameters
 */
export function getRecommenderRedirectUrl(): string {
  if (typeof window === "undefined") return "/credit-card-recommender-p1";

  const params = new URLSearchParams(window.location.search);
  const utmParams = new URLSearchParams();

  // Preserve UTM parameters
  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  utmKeys.forEach((key) => {
    const value = params.get(key) || sessionStorage.getItem(key);
    if (value) {
      utmParams.set(key, value);
    }
  });

  const queryString = utmParams.toString();
  return `/credit-card-recommender-p1${queryString ? `?${queryString}` : ""}`;
}

/**
 * Redirect user away from quiz page if they've already accessed recommender
 */
export function guardQuizAccess(): void {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;

  // If user is on quiz page and has already accessed recommender, redirect
  if (isQuizPage(currentPath) && hasAccessedRecommender()) {
    console.log("[QuizGuard] Quiz access blocked - redirecting to recommender");
    const redirectUrl = getRecommenderRedirectUrl();
    window.location.replace(redirectUrl); // Use replace to avoid adding to history
  }
}

/**
 * Install navigation guard on recommender pages
 * This prevents back button navigation to quiz
 */
export function installRecommenderGuard(): void {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;

  // Only run on recommender pages
  if (!isRecommenderPage(currentPath)) {
    return;
  }

  // Mark that user has accessed recommender
  markRecommenderAccessed();

  // Replace the current history entry to prevent back navigation
  // This makes the back button skip the quiz page
  if (window.history.state === null || !window.history.state.guardInstalled) {
    const currentUrl = window.location.href;
    const urlWithoutQuiz = currentUrl;

    // Push a duplicate entry first, then replace it
    // This effectively removes quiz from history stack
    window.history.replaceState(
      { guardInstalled: true, timestamp: Date.now() },
      "",
      urlWithoutQuiz,
    );

    console.log("[QuizGuard] History guard installed on recommender page");
  }

  // Listen for popstate (back button) events
  window.addEventListener("popstate", handleBackNavigation);

  // Also listen for Astro navigation events
  document.addEventListener("astro:before-preparation", handleAstroNavigation);

  // Add beforeunload listener to maintain guard state
  window.addEventListener("beforeunload", maintainGuardState);

  // Additional hashchange protection for hash-based routing
  window.addEventListener("hashchange", handleHashChange);
}

/**
 * Handle back button navigation attempts
 */
function handleBackNavigation(event: PopStateEvent): void {
  // If user tries to go back and quiz is in history, redirect forward
  if (hasAccessedRecommender()) {
    const currentPath = window.location.pathname;

    if (isQuizPage(currentPath)) {
      event.preventDefault();
      console.log("[QuizGuard] Back navigation to quiz blocked");
      const redirectUrl = getRecommenderRedirectUrl();
      window.location.replace(redirectUrl);
    }
  }
}

/**
 * Handle Astro view transition navigation
 */
function handleAstroNavigation(event: Event): void {
  if (typeof window === "undefined") return;

  // Check if navigation target is quiz page
  const customEvent = event as CustomEvent;
  const targetUrl = customEvent.detail?.to || "";

  if (targetUrl.includes("/quiz") && hasAccessedRecommender()) {
    event.preventDefault();
    console.log("[QuizGuard] Astro navigation to quiz blocked");
    const redirectUrl = getRecommenderRedirectUrl();
    window.location.replace(redirectUrl);
  }
}

/**
 * Maintain guard state on page unload
 */
function maintainGuardState(): void {
  // Ensure guard state is preserved in sessionStorage
  // This is mostly for safety as sessionStorage persists by default
  if (hasAccessedRecommender()) {
    sessionStorage.setItem(STORAGE_KEY, "true");
    console.log("[QuizGuard] Guard state maintained on unload");
  }
}

/**
 * Handle hash change events (for hash-based routing)
 */
function handleHashChange(event: HashChangeEvent): void {
  if (typeof window === "undefined") return;

  // Extract path from hash if it's a hash-based route
  const newUrl = event.newURL || "";

  if (newUrl.includes("/quiz") && hasAccessedRecommender()) {
    console.log("[QuizGuard] Hash navigation to quiz blocked");
    const redirectUrl = getRecommenderRedirectUrl();
    window.location.replace(redirectUrl);
  }
}

/**
 * Clear guard state (for testing or logout)
 */
export function clearGuardState(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(QUIZ_COMPLETED_KEY);
  console.log("[QuizGuard] Guard state cleared");
}
