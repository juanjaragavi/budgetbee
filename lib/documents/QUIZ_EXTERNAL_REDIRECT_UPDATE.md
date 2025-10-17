# Quiz External Redirect Implementation

## Overview

Updated the CTA button redirect in the credit card quiz user journey to use an external traffic handler URL instead of an internal page redirect.

## Changes Made

### File Modified

- `src/components/quiz/CreditCardForm.jsx`

### Previous Behavior

- After form submission, users were redirected to internal page: `/credit-card-recommender-p1`
- UTM parameters were preserved during redirect

### New Behavior

- After form submission, users are now redirected to external URL: `https://linkly.link/2ERrA`
- UTM parameters are preserved and appended to the external URL
- Traffic is routed through external traffic handler before reaching final destination

## Technical Implementation

### Redirect URL Construction

```javascript
// Build redirect URL to external recommender page via traffic handler
const redirectUrl = `https://linkly.link/2ERrA${utmParams.toString() ? `?${utmParams.toString()}` : ""}`;
```

### UTM Parameter Preservation

The implementation maintains all existing UTM parameter handling:

- Extracts UTM parameters from current URL query string
- Falls back to sessionStorage if not in URL
- Preserves parameters: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- Appends parameters to external redirect URL

### Example Redirect URLs

**Without UTM parameters:**

```text
https://linkly.link/2ERrA
```

**With UTM parameters:**

```text
https://linkly.link/2ERrA?utm_source=google&utm_medium=cpc&utm_campaign=cc_quiz_2025&utm_content=step3&utm_term=credit_cards
```

## Benefits

1. **External Traffic Handling**: Routes users through professional traffic handler for better tracking and optimization
2. **UTM Preservation**: All marketing attribution data is maintained throughout the user journey
3. **Seamless UX**: Users experience no change in interaction flow
4. **Flexible Routing**: Traffic handler can route to different landing pages based on rules without code changes

## Testing Recommendations

1. **Basic Redirect**: Complete quiz without UTM parameters, verify redirect to `https://linkly.link/2ERrA`
2. **UTM Preservation**: Complete quiz with UTM parameters in URL, verify all parameters are preserved in redirect
3. **SessionStorage UTM**: Start quiz with UTM parameters, navigate away, return, complete quiz, verify UTM parameters still preserved
4. **Multiple UTM Parameters**: Test with all 5 UTM parameter types simultaneously
5. **Special Characters**: Test with special characters in UTM values (spaces, symbols, unicode)

## Rollback Procedure

If needed to revert to internal redirect:

```javascript
// Revert to internal redirect
const redirectUrl = `/credit-card-recommender-p1${utmParams.toString() ? `?${utmParams.toString()}` : ""}`;
```

## Date Implemented

October 17, 2025

## Related Files

- `src/components/quiz/CreditCardForm.jsx` - Main implementation
- `src/components/quiz/steps/Step3.jsx` - Final step before redirect
- `src/lib/utils/timezone.js` - Timestamp utility used in submission

## Notes

- The external traffic handler (`linkly.link`) must be configured to accept and forward UTM parameters
- Ensure the destination landing page is properly set up in the traffic handler configuration
- Monitor redirect success rate and user journey completion in analytics
