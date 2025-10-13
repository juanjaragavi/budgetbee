# Quiz Page AdZep Exclusion Fix

## Date: October 13, 2025

## Issue: AdZep Activation Errors on Quiz Page

---

## Problem Description

### Console Errors on Quiz Page

The Quiz page (`/quiz` and `/qz`) was showing multiple console errors related to AdZep activation:

```
Access to fetch at 'https://securepubads.g.doubleclick.net/...' has been blocked by CORS policy
Access to fetch at 'https://secure.omeda.com/...' has been blocked by CORS policy
GET https://securepubads.g.doubleclick.net/... net::ERR_FAILED 400 (Bad Request)
```

### Root Cause

The AdZep bridge (`adzep-page-load-bridge.ts`) was attempting to activate ads on **every page**, including the Quiz page which:

- ❌ **Has NO ad containers** (intentionally ad-free for better UX)
- ❌ **Doesn't need ads** (focused conversion experience)
- ❌ **Causes unnecessary network requests** to ad servers
- ❌ **Generates console errors** that confuse debugging

### Impact

- ⚠️ **Poor Developer Experience**: Console filled with error messages
- ⚠️ **Unnecessary Network Traffic**: Failed requests to ad networks
- ⚠️ **Potential Performance Impact**: Wasted resources trying to load ads
- ⚠️ **User Experience**: Delayed page load from failed network requests

---

## Solution Implemented

### Quiz Page Detection Logic

Added `isQuizPage()` function to both AdZep utilities:

**Files Modified**:

1. `src/lib/adzep-page-load-bridge.ts`
2. `src/lib/adZepUtils.ts`

**Detection Method**:

```typescript
/**
 * Check if the current page is the Quiz page (should not activate ads)
 */
function isQuizPage(): boolean {
  if (typeof window === "undefined") return false;

  // Check URL path
  const path = window.location.pathname;
  if (
    path === "/quiz" ||
    path === "/qz" ||
    path === "/quiz/" ||
    path === "/qz/"
  ) {
    return true;
  }

  // Check for quiz-specific elements
  const hasQuizElements = !!document.querySelector(
    '.quiz-min-footer, [class*="quiz"]',
  );

  return hasQuizElements;
}
```

**Dual Detection Strategy**:

1. ✅ **URL Path Check**: Matches `/quiz`, `/qz`, `/quiz/`, `/qz/`
2. ✅ **DOM Element Check**: Looks for `.quiz-min-footer` or elements with "quiz" in class name
3. ✅ **Fail-Safe**: If either check matches, skip ad activation

### Integration into Ad Detection

Updated `pageHasAdUnits()` function in both files:

```typescript
export function pageHasAdUnits(): boolean {
  if (typeof document === "undefined") return false;

  // Skip ad detection entirely on Quiz pages
  if (isQuizPage()) {
    console.log("[AdZepBridge] Quiz page detected, skipping ad activation");
    return false;
  }

  // ... rest of ad container detection logic
}
```

**Benefits**:

- 🚫 **Early Return**: Exits immediately if Quiz page detected
- 📝 **Clear Logging**: Logs when Quiz page is skipped
- ✅ **No Ad Activation**: `pageHasAdUnits()` returns `false`, preventing activation
- ⚡ **Performance**: Avoids unnecessary DOM queries and network requests

---

## Expected Behavior

### Before Fix

**Quiz Page Console**:

```
[AdZepBridge] Ad unit detection: found 0 ad containers
[AdZep] Starting activation attempt 1...
[AdZep] Calling AdZepActivateAds...
❌ Access to fetch at 'https://securepubads.g.doubleclick.net/...' blocked by CORS
❌ GET https://secure.omeda.com/... net::ERR_FAILED 400
[AdZep] Ads activated successfully  // FALSE SUCCESS
```

### After Fix

**Quiz Page Console**:

```
[AdZepBridge] Quiz page detected, skipping ad activation
✅ (No ad activation attempts)
✅ (No CORS errors)
✅ (No network requests to ad servers)
```

**Other Pages** (with ads):

```
[AdZepBridge] Ad unit detection: found 2 ad containers ["#us_budgetbeepro_1", "#us_budgetbeepro_2"]
[AdZep] Starting activation attempt 1...
[AdZep] Calling AdZepActivateAds...
[AdZep] Ads activated successfully
✅ Ads display correctly
```

---

## Testing Instructions

### Manual Testing

1. **Navigate to Quiz Page**:

   ```
   http://localhost:4321/quiz
   ```

2. **Open Browser Console**:
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Go to "Console" tab

3. **Verify Expected Messages**:

   ```
   ✅ Should see: "[AdZepBridge] Quiz page detected, skipping ad activation"
   ❌ Should NOT see: "Access to fetch at..." errors
   ❌ Should NOT see: "net::ERR_FAILED 400" errors
   ❌ Should NOT see: "[AdZep] Starting activation attempt..."
   ```

4. **Navigate to Recommender Page**:

   ```
   Complete quiz → redirects to /credit-card-recommender-p1
   ```

5. **Verify Ad Activation**:
   ```
   ✅ Should see: "[AdZepBridge] Ad unit detection: found 2 ad containers"
   ✅ Should see: "[AdZep] Ads activated successfully"
   ✅ Ads should display in containers
   ```

### Test Coverage

**Pages to Verify**:

- ✅ `/quiz` - Should skip ad activation
- ✅ `/qz` - Should skip ad activation (alternative URL)
- ✅ `/credit-card-recommender-p1` - Should activate ads
- ✅ `/credit-card-recommender-p2` - Should activate ads
- ✅ `/credit-card-recommender-p3` - Should activate ads
- ✅ `/financial-solutions/*` - Should activate ads

---

## Files Modified

1. **`src/lib/adzep-page-load-bridge.ts`**
   - Added `isQuizPage()` function
   - Updated `pageHasAdUnits()` to check for Quiz page
   - Added console logging for Quiz page detection

2. **`src/lib/adZepUtils.ts`**
   - Added `isQuizPage()` function
   - Updated `pageHasAdUnits()` to check for Quiz page
   - Added console logging for Quiz page detection

---

## Technical Details

### Why Two Detection Methods?

**URL Path Check**:

- ✅ Fast and reliable
- ✅ Works before DOM is fully loaded
- ✅ Handles trailing slashes

**DOM Element Check**:

- ✅ Fallback if URL detection fails
- ✅ Works for dynamically generated routes
- ✅ Catches Quiz page even if URL changes

### Why Modify Both Files?

**`adzep-page-load-bridge.ts`**:

- Main entry point for ad activation
- Listens to Astro view transition events
- Primary location for ad detection

**`adZepUtils.ts`**:

- Utility functions used by other components
- Exported `pageHasAdUnits()` may be called elsewhere
- Ensures consistency across codebase

---

## Related Documentation

- `UTM_ADZEP_REVENUE_FIX.md` - UTM propagation and AdZep activation fixes
- `ADZEP_ACTIVATION_FIX.md` - Previous AdZep improvements
- `CREDIT_CARD_RECOMMENDER_IMPLEMENTATION.md` - Quiz and recommender flow

---

## Notes

### Future Considerations

If more pages need to be excluded from ad activation:

```typescript
function isAdFreeAge(): boolean {
  const adFreePages = [
    "/quiz",
    "/qz",
    "/contact", // Add more as needed
    "/privacy-policy",
  ];

  const path = window.location.pathname;
  return adFreePages.some((page) => path.startsWith(page));
}
```

### Alternative Approach (Not Used)

We could have added a data attribute to QuizLayout:

```html
<body data-no-ads="true"></body>
```

**Why we didn't**:

- ❌ Requires modifying layout files
- ❌ Tightly couples detection to HTML structure
- ✅ URL-based detection is more flexible
- ✅ Works without DOM modifications

---

## Commit Information

**Commit Message**:

```
fix(adzep): exclude Quiz page from ad activation to prevent console errors

- add isQuizPage() detection function to adzep-page-load-bridge.ts
- add isQuizPage() detection function to adZepUtils.ts
- update pageHasAdUnits() to skip Quiz pages (/quiz, /qz)
- use dual detection: URL path check + DOM element check
- add console logging for Quiz page detection
- prevent unnecessary ad network requests on Quiz page
- eliminate CORS and network errors from Quiz page console

Impact:
- cleaner console output on Quiz page
- no wasted network requests to ad servers
- better developer experience during debugging
- improved page load performance on Quiz
- ads still activate correctly on all other pages

Files modified:
- src/lib/adzep-page-load-bridge.ts
- src/lib/adZepUtils.ts
- lib/documents/QUIZ_PAGE_ADZEP_EXCLUSION_FIX.md (documentation)
```

**Branch**: `dev`
**Date**: October 13, 2025
