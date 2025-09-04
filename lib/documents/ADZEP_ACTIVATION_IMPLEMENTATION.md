# AdZep Activation Implementation

## Overview

This implementation ensures that `window.AdZepActivateAds()` is called exactly **once** per page load in the BudgetBee Astro SPA architecture, preventing duplicate calls and ensuring proper ad delivery.

## Implementation Components

### 1. AdZepActivator Component (`src/components/analytics/AdZepActivator.tsx`)

A React component that handles the automatic activation of AdZep ads on page load.

**Features:**

- ✅ Prevents multiple activations from the same component instance
- ✅ Global state management to prevent duplicate calls across components
- ✅ Automatic retry logic with exponential backoff
- ✅ Comprehensive error handling and logging
- ✅ Non-rendering component (returns null)

### 2. AdZep Utilities (`src/lib/adZepUtils.ts`)

Comprehensive utility functions for managing AdZep activation state.

**Features:**

- ✅ Global state management
- ✅ Async activation with timeout and retry logic
- ✅ State inspection and reset capabilities
- ✅ TypeScript support with proper type definitions

**Available Functions:**

- `activateAdZep(options)` - Main activation function
- `resetAdZepState()` - Reset activation state
- `getAdZepState()` - Get current state
- `isAdZepActivated()` - Check activation status

### 3. useAdZep Hook (`src/hooks/useAdZep.ts`)

React hook for components that need to interact with AdZep activation.

**Features:**

- ✅ Auto-activation on mount (configurable)
- ✅ Manual activation controls
- ✅ Real-time state updates
- ✅ Reset functionality
- ✅ TypeScript support

### 4. Standalone Script (`src/lib/adZepStandalone.js`)

Vanilla JavaScript implementation for non-React contexts.

**Features:**

- ✅ Framework-agnostic
- ✅ Self-contained activation logic
- ✅ Global namespace (`window.BudgetBeeAdZep`)
- ✅ Compatible with any HTML page

## Integration

### Automatic Integration (Recommended)

The AdZepActivator is automatically integrated through the AnalyticsWrapper component, which is included in:

- `src/layouts/Base.astro` (line 541)
- `src/layouts/QuizLayout.astro` (line 89)

This ensures activation on **all pages** using these layouts.

### Manual Integration Options

#### Option 1: React Hook

```tsx
import { useAdZep } from "../hooks/useAdZep";

function MyComponent() {
  const { isActivated, activate, reset } = useAdZep();

  return (
    <div>
      <p>AdZep Status: {isActivated ? "Active" : "Inactive"}</p>
      <button onClick={activate}>Activate Manually</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

#### Option 2: Direct Utility Usage

```typescript
import { activateAdZep, isAdZepActivated } from "../lib/adZepUtils";

// Check status
if (!isAdZepActivated()) {
  // Activate with custom options
  await activateAdZep({
    timeout: 10000,
    retryAttempts: 5,
    retryDelay: 1000,
  });
}
```

#### Option 3: Standalone Script

```html
<script src="/src/lib/adZepStandalone.js"></script>
<script>
  // Manual activation
  window.BudgetBeeAdZep.activate();

  // Check state
  console.log(window.BudgetBeeAdZep.activationState);
</script>
```

## Configuration Options

### AdZepActivator Options

- **autoActivate**: Auto-activate on mount (default: true)
- **activationDelay**: Delay before activation (default: 100ms)

### Activation Options

- **force**: Force activation even if already activated
- **timeout**: Max wait time for AdZep script (default: 5000ms)
- **retryAttempts**: Number of retry attempts (default: 3)
- **retryDelay**: Delay between retries (default: 500ms)

## State Management

### Global State Structure

```typescript
interface AdZepState {
  activated: boolean; // Whether AdZep is activated
  activationInProgress: boolean; // Whether activation is currently running
  lastActivation: number | null; // Timestamp of last activation
  activationAttempts: number; // Number of activation attempts
}
```

### State Access

```typescript
// Check if activated
const isActive = isAdZepActivated();

// Get full state
const state = getAdZepState();

// Reset state
resetAdZepState();
```

## Debugging and Monitoring

### Console Logging

All components provide detailed console logging with prefixed messages:

- `[AdZepActivator]` - React component logs
- `[AdZep]` - Utility function logs
- `[BudgetBeeAdZep]` - Standalone script logs
- `[useAdZep]` - Hook logs

### Common Log Messages

- ✅ `"Already activated, skipping..."` - Prevents duplicate activation
- ✅ `"Activating ads..."` - Starting activation process
- ✅ `"Ads activated successfully"` - Successful activation
- ⚠️ `"AdZepActivateAds function not available yet"` - Script still loading
- ❌ `"Error activating ads:"` - Activation failed

## Error Handling

### Automatic Recovery

1. **Script Loading Delays**: Waits up to 5 seconds for AdZep script
2. **Network Issues**: Retries up to 3 times with increasing delays
3. **Concurrent Calls**: Prevents race conditions with state locks
4. **Missing Function**: Graceful degradation with warnings

### Manual Recovery

```typescript
// Force reset and re-activate
resetAdZepState();
await activateAdZep({ force: true });
```

## Testing

### Development Testing

```typescript
// Enable more verbose logging in development
if (import.meta.env.DEV) {
  console.log("AdZep State:", getAdZepState());
}
```

### Production Monitoring

```typescript
// Monitor activation in production
window.addEventListener("load", () => {
  setTimeout(() => {
    if (!isAdZepActivated()) {
      console.warn("AdZep not activated after page load");
      // Send to monitoring service
    }
  }, 10000);
});
```

## Best Practices

1. **Use Automatic Integration**: Let AnalyticsWrapper handle activation
2. **Avoid Manual Calls**: Unless you have specific requirements
3. **Monitor Console**: Check for activation success/failure messages
4. **Test Thoroughly**: Verify activation on different page types
5. **Handle Errors**: Implement fallback ad serving if needed

## Migration from Manual Implementation

If you have existing manual AdZep calls:

1. **Remove Manual Calls**: Delete existing `window.AdZepActivateAds()` calls
2. **Trust Automatic System**: The AnalyticsWrapper will handle activation
3. **Monitor Results**: Check console for successful activation
4. **Verify Ad Delivery**: Ensure ads are still displaying correctly

---

## Ad Slot Components & Auto-Injection (Sep 1, 2025)

To resolve visibility and placement inconsistencies post MD → MDX migration, we introduced a dedicated MDX-safe component for the post-top ad unit and an automatic injection rule in the blog layout.

### Post-Top Ad Unit Component

- File: `src/layouts/shortcodes/AdZoneTop3.tsx`
- Default id: `us_budgetbeepro_3`
- Classes: `ad-reset ad-zone-top` (neutral, non-decorative and spacing-aware)

Usage in MDX:

```mdx
<AdZoneTop3 /> // renders with id="us_budgetbeepro_3"
<AdZoneTop3 id="custom_slot" /> // optional override
```

This mirrors the successful pattern used for unit 4 (mid-article) while keeping markup minimal for the ad stack to target.

### Automatic Injection in Post Layout

- File: `src/layouts/PostSingle.astro`
- Logic: For posts in categories `personal-finance` or `financial-solutions`, a div with `id="us_budgetbeepro_3"` is injected directly below the H1 title.
- Category matching is normalized (`lowercase`, spaces/underscores → hyphens) to avoid mismatches between frontmatter and runtime checks.

Snippet:

```astro
{
  (isFinancialSolution || isPersonalFinance) && (
    <div id="us_budgetbeepro_3" class="ad-reset ad-zone-top" />
  )
}
```

Related CSS improvements in the same file:

- `.content a:not(.btn)` remains brand yellow with underline
- `.content .btn` explicitly not underlined (CTA styling is stable in MDX output)
- Explicit rules ensure `#us_budgetbeepro_3`/`#us_budgetbeepro_4` iframes size naturally (no forced aspect-ratio)

Global/mobile CSS support:

- `src/styles/blog-mobile.css` already accommodates `#us_budgetbeepro_3` and `#us_budgetbeepro_4` iframes
- `src/styles/ad-aware-design.css` provides `ad-reset` and positional helpers used by the new component

### Why both auto-injection and shortcode?

- Auto-injection guarantees presence of the top ad slot across all relevant categories without editing each article.
- The shortcode remains available for per-post control, special placements, or A/B tests.

### Verification Steps

1. Open any Financial Solutions or Personal Finance post.
2. Inspect DOM for `#us_budgetbeepro_3` immediately after the `<h1>`.
3. Check console for AdZep activation (should show “Ads activated successfully”).
4. You may see “Render ended: us_budgetbeepro_3, isEmpty: true” in development; this is normal when there’s no fill in dev or GAM network code is placeholder.

---

## Astro View Transitions Bridge (Sep 4, 2025)

Client-side navigations with Astro’s View Transitions don’t fire traditional `window.load` events, so ads may not re-activate after navigating without a full page refresh. To solve this, we added a small site-wide bridge to listen for Astro client lifecycle events and re-run activation whenever ad units are present.

### Files

- `src/lib/adzep-page-load-bridge.ts`
- Injected site-wide from `src/layouts/Base.astro`:

```astro
<!-- In <head> -->
<script type="module" src="/src/lib/adzep-page-load-bridge.ts"></script>
```

### How it works

- Listens to: `astro:page-load`, `astro:after-swap`, `astro:page-start`, `visibilitychange`, and `popstate`.
- Schedules several delayed checks after each event to catch late DOM mounts.
- Before calling activation, it verifies the page contains ad containers:
  - `#us_budgetbeepro_3`, `#us_budgetbeepro_4`
  - Legacy: `#uk_topfinanzas_3`, `#uk_topfinanzas_4`
  - Any `[id^="us_budgetbeepro_"]`, `[id^="uk_topfinanzas_"]`, or `.ad-zone`
- Calls `activateAdZep({ force: true })` so SPA state never blocks the call.

### Expected console traces (dev)

- `[AdZepBridge] Activation attempted due to: astro:page-load` (or `initial`, `after-swap`, etc.)
- `[AdZep] Ads activated successfully`
- Optional “Render ended: …, isEmpty: true” when there’s no fill in development

### Verification

1. With `pnpm dev` running, navigate across:
   - Home → Blog → Personal Finance Article (contains ad units)
   - Back/forward with the browser
2. Observe the AdZep Debug Panel:
   - Hook State “Activated: ✅” and Attempts increment on relevant pages
3. Check the console for `[AdZepBridge]` messages on transitions and that `window.AdZepActivateAds()` is invoked each time ad zones exist.

This bridge ensures ads are re-activated consistently on SPA-like transitions without double-calling on pages that don’t contain ad units.
