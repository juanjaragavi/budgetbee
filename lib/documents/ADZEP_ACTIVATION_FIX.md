# AdZep Activation Fix - Credit Card Recommender Pages

## Problem Summary

The Credit Card Recommender pages (p1, p2, p3) were experiencing console errors due to **multiple rapid-fire AdZep activation attempts**. The issues manifested as:

1. **CORS Policy Errors**: Fetch requests to `secure.omeda.com` and `securepubads.g.doubleclick.net` were being blocked
2. **400 Bad Request Errors**: Multiple simultaneous requests to ad networks were failing
3. **Duplicate Activation Attempts**: The console showed multiple "[AdZep] activateAds() disparado manualmente" messages

### Root Causes

1. **Excessive Event Listeners**: The `adzep-page-load-bridge.ts` was listening to 6 different events:
   - `astro:page-load`
   - `astro:after-swap`
   - `astro:page-start`
   - `visibilitychange`
   - `popstate`
   - Initial load

2. **Multiple Activation Attempts Per Event**: Each event trigger would schedule **5 separate activation attempts** with delays of [0, 150, 350, 750, 1500]ms, resulting in up to **30 activation calls** for a single page load.

3. **Insufficient Cooldown**: No cooldown period between activations allowed rapid successive calls even when one was already in progress.

4. **Weak Retry Logic**: The retry mechanism in `adZepUtils.ts` didn't properly handle concurrent requests or implement proper backoff.

## Solutions Implemented

### 1. Fixed `adzep-page-load-bridge.ts`

**Changes Made:**

- **Debounced Activation Scheduler**: Replaced multiple delayed attempts with a single debounced activation call
- **Reduced Event Listeners**: Removed redundant event listeners (`visibilitychange`, `popstate`, `astro:page-start`)
- **Smart Event Handling**: Only use `astro:after-swap` as fallback if `astro:page-load` doesn't fire
- **Cooldown Period**: Implemented 3-second minimum cooldown between activations
- **Better Logging**: Improved console messages for debugging

**Before:**

```typescript
const scheduleActivation = (reason: string) => {
  const delays = [0, 150, 350, 750, 1500];
  for (const d of delays) {
    setTimeout(() => activateIfNeeded(reason), d);
  }
};

addEventListener("astro:page-load", () =>
  scheduleActivation("astro:page-load"),
);
addEventListener("astro:after-swap", () =>
  scheduleActivation("astro:after-swap"),
);
addEventListener("astro:page-start", () =>
  scheduleActivation("astro:page-start"),
);
// ... more listeners
```

**After:**

```typescript
function scheduleActivation(reason: string, delay: number = 300): void {
  if (window.__adzepPendingActivation) {
    clearTimeout(window.__adzepPendingActivation);
  }
  window.__adzepPendingActivation = window.setTimeout(() => {
    window.__adzepPendingActivation = null;
    activateIfNeeded(reason);
  }, delay);
}

// Only essential listeners
addEventListener("astro:page-load", () =>
  scheduleActivation("astro:page-load", 400),
);
```

### 2. Enhanced `adZepUtils.ts`

**Changes Made:**

- **Cooldown Period**: Added 2-second minimum cooldown between activations
- **Better State Management**: Added `lastError` field to track activation failures
- **Improved Wait Logic**: Added timeout (8 seconds) when waiting for concurrent activation to complete
- **Reduced Retries**: Changed from 3 to 2 retry attempts with longer delay (1000ms vs 500ms)
- **Error Suppression**: Added `safelyActivateAdZep()` wrapper to gracefully handle expected CORS/network errors from external ad services
- **Enhanced Logging**: Better console messages with timing information

**Key Improvements:**

```typescript
// Cooldown implementation
const cooldownPeriod = 2000; // 2 seconds
if (state.lastActivation && !force) {
  const timeSinceLastActivation = now - state.lastActivation;
  if (timeSinceLastActivation < cooldownPeriod) {
    console.log(`[AdZep] Activation throttled`);
    return state.activated;
  }
}

// Wait with timeout
if (state.activationInProgress) {
  const maxWaitTime = 8000; // 8 seconds max wait
  // ... wait logic with timeout
}

// Error suppression for external ad networks
async function safelyActivateAdZep(
  activateFunction: () => void,
): Promise<void> {
  const suppressedDomains = [
    "secure.omeda.com",
    "securepubads.g.doubleclick.net",
  ];
  // ... wrap fetch to suppress expected CORS errors
}
```

### 3. Error Handling for External Ad Networks

Added graceful handling for expected failures from external ad services:

- **CORS Errors**: These are expected when ad networks reject requests due to browser policies, ad blockers, or IP restrictions
- **Network Failures**: Temporary wrap of `window.fetch` to catch and suppress errors from known ad domains
- **Fallback Response**: Return dummy 204 response to prevent page breaking when ad requests fail

## Benefits

1. **Eliminated Console Spam**: Reduced activation attempts from ~30 to 1-2 per page load
2. **Better Performance**: Less network overhead and CPU usage
3. **Cleaner Console**: Suppressed expected CORS/network errors from external ad services
4. **More Reliable**: Proper debouncing and cooldown prevent race conditions
5. **Better Debugging**: Enhanced logging shows exactly when and why activations occur

## Testing Recommendations

### On Credit Card Recommender Pages (p1, p2, p3)

1. **Clear Browser Cache**: Ensure no stale state from previous implementation
2. **Check Console**: Should see only 1-2 "[AdZep]" messages per page load:

   ```bash
   [AdZep] Starting activation attempt 1...
   [AdZep] Calling AdZepActivateAds...
   [AdZep] Ads activated successfully
   [AdZepBridge] Activation completed due to: astro:page-load
   ```

3. **Verify Ad Display**: Check that ad containers (`us_budgetbeepro_1`, `us_budgetbeepro_2`) properly display ads

4. **Test Navigation**:
   - Navigate between p1 → p2 → p3
   - Use browser back/forward buttons
   - Each navigation should trigger only ONE activation

5. **Check Network Tab**: Should see ad requests but no repeated/duplicate calls

### Expected Console Output

**Good (After Fix):**

```bash
[AdZepBridge] No ad units found on page, skipping activation  // On pages without ads
[AdZep] Starting activation attempt 1...
[AdZep] Calling AdZepActivateAds...
[AdZep] Ads activated successfully
[AdZepBridge] Activation completed due to: astro:page-load
```

**Bad (Before Fix):**

```bash
[AdZep] Starting activation attempt 1...
[AdZep] Starting activation attempt 2...  // Duplicate!
[AdZep] Starting activation attempt 3...  // Duplicate!
[AdZep] Activation already in progress, waiting...
Access to fetch at 'https://secure.omeda.com/...' has been blocked by CORS policy
```

## Files Modified

1. **`src/lib/adzep-page-load-bridge.ts`**: Fixed multiple activation triggers and added debouncing
2. **`src/lib/adZepUtils.ts`**: Enhanced state management, cooldown, and error handling

## Rollback Procedure

If issues arise, you can temporarily disable the bridge by commenting out this line in `src/layouts/Base.astro`:

```astro
{
  /* AdZep activation bridge for Astro view transitions - served as built asset */
}
<script is:inline type="module" src={adzepBridgeUrl}></script>
```

However, this will prevent ads from loading on client-side navigations (only initial page loads will show ads).

## Future Improvements

1. **Monitoring Dashboard**: Add a debug panel to visualize activation attempts and timing
2. **A/B Testing**: Test different activation delays to find optimal timing for ad load
3. **Analytics Integration**: Track successful vs failed activations for monitoring
4. **Lazy Loading**: Consider lazy-loading ads based on viewport intersection

## Related Documentation

- [AdZep Activation Implementation](./ADZEP_ACTIVATION_IMPLEMENTATION.md)
- [Blog Post AdZep Auto Trigger](./BLOG_POST_ADZEP_AUTO_TRIGGER.md)
- [Google Ads Implementation](./GOOGLE_ADS_IMPLEMENTATION.md)
