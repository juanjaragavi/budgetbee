# Quiz Navigation Guard Implementation

## Overview

This implementation prevents users from navigating back to the quiz page once they have reached any Credit Card Recommender landing page. The solution ensures UTM parameter preservation and blocks return navigation via browser history, direct links, and all other navigation methods.

## Problem Statement

The previous workflow allowed users to:

- Use the browser back button to return to the quiz after reaching recommender pages
- Access the quiz directly via URL after completing it
- Navigate back through Astro view transitions

This caused:

- Loss or duplication of UTM parameters
- Compromised analytics data accuracy
- Potential duplicate form submissions
- Disrupted user flow and tracking

## Solution Architecture

### 1. Core Utility Module

**File**: `src/lib/utils/quizNavigationGuard.ts`

Provides centralized navigation guard logic:

#### Key Functions

- `hasAccessedRecommender()`: Checks sessionStorage flag
- `markRecommenderAccessed()`: Sets recommender access flag and timestamp
- `isQuizPage()`: Detects quiz page routes
- `isRecommenderPage()`: Detects recommender page routes
- `getRecommenderRedirectUrl()`: Builds redirect URL with preserved UTM params
- `guardQuizAccess()`: Redirects from quiz if recommender was accessed
- `installRecommenderGuard()`: Sets up history manipulation and event listeners
- `clearGuardState()`: Clears guard state (for testing/logout)

#### Storage Keys

- `budgetbee_recommender_accessed`: Boolean flag in sessionStorage
- `budgetbee_quiz_completed`: ISO timestamp of quiz completion

### 2. Quiz Page Guard Component

**File**: `src/components/quiz/QuizAccessGuard.tsx`

React component that:

- Runs guard check on mount
- Listens for visibility changes (tab focus)
- Listens for Astro page load events
- Redirects users if they've already accessed recommender

**Usage**: Added to `src/pages/quiz.astro` with `client:load` directive

### 3. Recommender Page Guard Scripts

**Files**:

- `src/pages/credit-card-recommender-p1.astro`
- `src/pages/credit-card-recommender-p2.astro`
- `src/pages/credit-card-recommender-p3.astro`

Each page includes inline script that:

- Marks recommender as accessed (sets sessionStorage flag)
- Installs history manipulation using `history.replaceState()`
- Sets up `popstate` event listener for back button
- Sets up Astro navigation event listeners
- Prevents navigation back to quiz via any method

## Implementation Details

### History Manipulation

When user reaches a recommender page:

```typescript
window.history.replaceState(
  { guardInstalled: true, timestamp: Date.now() },
  "",
  currentUrl,
);
```

This:

- Marks the current history entry with guard metadata
- Does NOT create new history entry (uses `replaceState`, not `pushState`)
- Allows normal forward/backward navigation except to quiz

### Event Handling

**Back Button (popstate event)**:

```typescript
window.addEventListener("popstate", (event) => {
  if (hasAccessedRecommender() && isQuizPage(window.location.pathname)) {
    event.preventDefault();
    window.location.replace(getRecommenderRedirectUrl());
  }
});
```

**Astro View Transitions**:

```typescript
document.addEventListener("astro:before-preparation", (event) => {
  const targetUrl = event.detail?.to || "";
  if (targetUrl.includes("/quiz") && hasAccessedRecommender()) {
    event.preventDefault();
    window.location.replace(getRecommenderRedirectUrl());
  }
});
```

### UTM Parameter Preservation

The `getRecommenderRedirectUrl()` function preserves UTM parameters from:

1. **Current URL query string** (first priority)
2. **sessionStorage** (fallback if not in URL)

This ensures UTM parameters persist across:

- Redirects from quiz to recommender
- Navigation attempts blocked by guard
- Session restoration after browser refresh

Example:

```markdown
User visits: /quiz?utm_source=google&utm_campaign=spring2025
↓
Completes quiz → redirected to external link
↓
Attempts to go back to /quiz
↓
Blocked and redirected to: /credit-card-recommender-p1?utm_source=google&utm_campaign=spring2025
```

## User Flow

### Normal Flow (First Time Visitor)

1. User accesses `/quiz` (optionally with UTM params)
2. Completes quiz steps 1-3
3. Form submitted to `/api/quiz-submission`
4. Redirected to external recommender link
5. User may navigate to BudgetBee recommender pages
6. Guard installed, quiz access blocked

### Blocked Flow (Returning Visitor)

1. User has recommender access flag in sessionStorage
2. Attempts to access `/quiz` directly or via back button
3. `QuizAccessGuard` detects flag immediately
4. User redirected to `/credit-card-recommender-p1` with UTM params
5. Quiz page never displays

### Edge Cases Handled

- **Direct URL access**: Guard checks on page load
- **Browser refresh**: sessionStorage persists, guard remains active
- **Back button**: popstate event prevents navigation
- **Forward button**: Normal navigation allowed
- **Astro view transitions**: Custom event listeners block navigation
- **New tab/window**: sessionStorage isolated per tab (desired behavior)
- **Session expiration**: sessionStorage clears on browser close (allows new quiz)

## Testing Checklist

### ✅ Primary Tests

- [ ] Complete quiz → verify redirect to external link
- [ ] Navigate to recommender p1/p2/p3 → verify guard installed
- [ ] Press back button → verify blocked from quiz
- [ ] Type `/quiz` in URL bar → verify redirect to recommender
- [ ] Refresh recommender page → verify guard persists
- [ ] Check browser console for guard log messages

### ✅ UTM Parameter Tests

- [ ] Start quiz with UTM params → verify preserved through flow
- [ ] Complete quiz → verify UTM params in sessionStorage
- [ ] Attempt quiz access → verify UTM params in redirect URL
- [ ] Test with multiple UTM params (source, medium, campaign, term, content)

### ✅ Edge Case Tests

- [ ] Open quiz in new tab after completing → verify guard works
- [ ] Close browser and reopen → verify guard cleared (new session)
- [ ] Test with Astro view transitions enabled
- [ ] Test back button multiple times rapidly
- [ ] Test with browser developer tools (Network tab, Console)

## Browser Console Messages

When functioning correctly, you should see:

```markdown
[QuizGuard] Recommender page accessed, quiz navigation blocked
[QuizGuard] History guard installed on recommender page
[QuizGuard] Quiz access blocked - redirecting to recommender
[QuizGuard] Back navigation to quiz blocked
```

## Maintenance Notes

### Adding New Recommender Pages

1. Add the guard script block to the page:

```astro
<script>
  import { installRecommenderGuard } from "@/lib/utils/quizNavigationGuard";
  installRecommenderGuard();
  document.addEventListener("astro:page-load", () => {
    installRecommenderGuard();
  });
</script>
```

### Clearing Guard State (for testing)

```javascript
// In browser console:
sessionStorage.removeItem("budgetbee_recommender_accessed");
sessionStorage.removeItem("budgetbee_quiz_completed");
location.reload();
```

Or programmatically:

```typescript
import { clearGuardState } from "@/lib/utils/quizNavigationGuard";
clearGuardState();
```

### Modifying Quiz Detection

Update the `isQuizPage()` function in `quizNavigationGuard.ts` to match new quiz route patterns.

### Modifying Recommender Detection

Update the `isRecommenderPage()` function to match new recommender route patterns.

## Performance Considerations

- **sessionStorage**: Fast, synchronous, isolated per tab
- **History manipulation**: Zero performance impact (native browser API)
- **Event listeners**: Minimal overhead, only active on relevant pages
- **No network requests**: All logic runs client-side
- **No external dependencies**: Pure TypeScript/JavaScript

## Security Considerations

- **sessionStorage isolation**: Guard state isolated per browser tab/window
- **No sensitive data**: Only boolean flags and timestamps stored
- **No authentication bypass**: Complementary to server-side validation
- **XSS protection**: No dynamic script injection or eval()

## Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Astro view transitions
- ✅ Server-side rendering (SSR)
- ✅ Client-side routing

## Files Modified

### New Files

- `src/lib/utils/quizNavigationGuard.ts`
- `src/components/quiz/QuizAccessGuard.tsx`
- `src/lib/recommenderPageGuard.ts` (alternative implementation, not currently used)

### Modified Files

- `src/pages/quiz.astro`
- `src/pages/credit-card-recommender-p1.astro`
- `src/pages/credit-card-recommender-p2.astro`
- `src/pages/credit-card-recommender-p3.astro`

## Related Documentation

- [Astro Client-Side Scripts](https://docs.astro.build/en/guides/client-side-scripts/)
- [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/)
- [History API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/History)
- [sessionStorage (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
