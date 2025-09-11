/**
 * Article Page Loader + AdZep Bootstrap
 * - Shows a lightweight loading overlay on article pages
 * - Ensures window.AdZepActivateAds() is invoked reliably on initial load and SPA transitions
 */

import { activateAdZep, isAdZepActivated, pageHasAdUnits } from "./adZepUtils";

function ensureOverlay(): HTMLElement | null {
  let el = document.getElementById("article-loading-overlay");
  if (!el) {
    el = document.createElement("div");
    el.id = "article-loading-overlay";
    el.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <div class="spinner"></div>
        <div class="label">Loading article…</div>
      </div>
    `;
    document.body.appendChild(el);
  }
  return el;
}

function showOverlay(): void {
  const el = ensureOverlay();
  if (el) el.classList.add("active");
}

function hideOverlay(): void {
  const el = document.getElementById("article-loading-overlay");
  if (el) el.classList.remove("active");
}

async function activateAdsWithSafety(): Promise<void> {
  // If no ad units on this page, just hide overlay quickly
  if (!pageHasAdUnits()) {
    hideOverlay();
    return;
  }

  // Try to activate with a slightly longer timeout on first load
  await activateAdZep({ timeout: 10000, retryAttempts: 5, retryDelay: 500 });

  // Regardless of success, remove the overlay after a short grace period
  setTimeout(() => hideOverlay(), 150);
}

function containerHasCreative(container: HTMLElement | null): boolean {
  if (!container) return false;
  // Consider an iframe or any non-empty child as a render signal
  if (container.querySelector("iframe")) return true;
  if (container.children.length > 0) return true;
  return false;
}

function retryActivateIfEmpty(maxAttempts = 3): void {
  let attempts = 0;
  const targets = [
    document.getElementById("us_budgetbeepro_3"),
    document.getElementById("us_budgetbeepro_4"),
  ];

  const tick = async () => {
    attempts++;
    const anyEmpty = targets.some(
      (el) => !containerHasCreative(el as HTMLElement),
    );
    if (!anyEmpty) return; // creatives present

    // Force re-activation when empty despite slots present
    await activateAdZep({
      force: true,
      timeout: 5000,
      retryAttempts: 1,
      retryDelay: 300,
    });

    if (attempts < maxAttempts) {
      setTimeout(tick, 1500);
    }
  };

  // schedule first check after initial activation likely completed
  setTimeout(tick, 1200);
}

function schedule(reason: string): void {
  // Show the overlay immediately, then schedule activation attempts as DOM settles
  showOverlay();
  const delays = [0, 150, 350, 750, 1500, 2500, 4000, 6000];
  for (const d of delays) {
    setTimeout(() => {
      // If already activated, we can safely hide overlay
      if (isAdZepActivated()) {
        hideOverlay();
        return;
      }
      activateAdsWithSafety();
      // If activation succeeded but creatives didn't land yet, try forced re-activation a few times
      retryActivateIfEmpty(3);
      // eslint-disable-next-line no-console
      console.debug(
        `[ArticleBootstrap] activation scheduled (${reason}) @ ${d}ms`,
      );
    }, d);
  }
}

function install(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Initial
  queueMicrotask(() => schedule("initial"));

  // Astro client-router events
  addEventListener("astro:page-load", () => schedule("astro:page-load"));
  addEventListener("astro:after-swap", () => schedule("astro:after-swap"));
  addEventListener("astro:page-start", () => schedule("astro:page-start"));

  // Visibility resumes
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") schedule("visibilitychange");
  });

  // History navigation
  window.addEventListener("popstate", () => schedule("popstate"));
}

install();
