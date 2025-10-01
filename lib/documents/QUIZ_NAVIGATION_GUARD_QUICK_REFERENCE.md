# Quiz Navigation Guard - Quick Reference

## 🎯 What It Does

Prevents users from navigating back to the Quiz page after they reach any Credit Card Recommender page, while preserving all UTM parameters throughout the journey.

## 🔧 How It Works

1. **Quiz Completion** → User redirects to `/credit-card-recommender-p1` (internal)
2. **Guard Activates** → sessionStorage flag set: `budgetbee_recommender_accessed = true`
3. **Navigation Blocked** → Any attempt to return to `/quiz` is intercepted and redirected

## 📋 Quick Test (Browser Console)

```javascript
// Run all automated tests
testQuizGuard.runAllTests();

// Check current guard status
sessionStorage.getItem("budgetbee_recommender_accessed");
// Returns: "true" if guard is active

// Check UTM parameters
["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(
  (key) => {
    console.log(`${key}: ${sessionStorage.getItem(key)}`);
  },
);

// Manually activate guard (testing)
testQuizGuard.manualActivateGuard();

// Manually deactivate guard (testing)
testQuizGuard.manualDeactivateGuard();
```

## 🚨 Console Messages to Expect

### Normal Operation

```plaintext
✅ [Quiz] Redirecting to internal recommender page: /credit-card-recommender-p1?utm_source=google
✅ [QuizGuard] Recommender page accessed, quiz navigation blocked
✅ [QuizGuard] History guard installed on recommender page
```

### Blocked Navigation

```plaintext
🚫 [QuizGuard] Quiz access blocked - redirecting to recommender
🚫 [QuizGuard] Back navigation to quiz blocked
```

## 📂 Key Files

| File                                         | Purpose                          |
| -------------------------------------------- | -------------------------------- |
| `src/lib/utils/quizNavigationGuard.ts`       | Core guard logic                 |
| `src/components/quiz/QuizAccessGuard.tsx`    | Quiz page guard component        |
| `src/components/quiz/CreditCardForm.jsx`     | Quiz form with internal redirect |
| `src/pages/credit-card-recommender-p*.astro` | Recommender pages with guards    |
| `scripts/test-quiz-navigation-guard.js`      | Testing utilities                |

## 🐛 Troubleshooting

### Issue: Guard Not Working

**Check**:

```javascript
// 1. Is guard installed?
console.log(sessionStorage.getItem("budgetbee_recommender_accessed"));

// 2. Check for errors
// Open DevTools Console → Look for red errors

// 3. Verify page detection
console.log("Current path:", window.location.pathname);
```

### Issue: UTM Parameters Lost

**Check**:

```javascript
// 1. Check sessionStorage
Object.keys(sessionStorage)
  .filter((key) => key.startsWith("utm_"))
  .forEach((key) => console.log(`${key}: ${sessionStorage.getItem(key)}`));

// 2. Check current URL
console.log("Current URL:", window.location.href);
```

### Issue: Can Still Access Quiz

**Solution**:

```javascript
// Clear and reload
sessionStorage.clear();
location.reload();

// Then try again - guard should activate on recommender page
```

## 🧪 Testing Checklist

- [ ] Complete quiz → redirects to internal recommender
- [ ] Press back button → blocked from quiz
- [ ] Type `/quiz` in URL → redirected to recommender
- [ ] Refresh page → guard still active
- [ ] UTM parameters preserved in URL
- [ ] Console shows guard messages

## 🔄 User Flow

```
1. User visits /quiz?utm_source=google
   ↓
2. Completes quiz
   ↓
3. Redirects to /credit-card-recommender-p1?utm_source=google
   ↓
4. Guard activates (sessionStorage set)
   ↓
5. Try to go back to quiz
   ↓
6. BLOCKED → Redirected to recommender with UTM params
```

## 💾 Storage Keys

```javascript
budgetbee_recommender_accessed; // "true" when guard active
budgetbee_quiz_completed; // ISO timestamp
utm_source; // UTM parameter
utm_medium; // UTM parameter
utm_campaign; // UTM parameter
utm_term; // UTM parameter
utm_content; // UTM parameter
```

## 🚀 Manual Testing Steps

### Test 1: Complete Quiz Flow

1. Go to `/quiz?utm_source=test&utm_campaign=demo`
2. Complete all quiz steps
3. Verify redirect to `/credit-card-recommender-p1?utm_source=test&utm_campaign=demo`
4. Check console for success messages

### Test 2: Back Button Protection

1. After completing Test 1
2. Click browser back button
3. Should be redirected back to recommender (NOT quiz)
4. Check console for block message

### Test 3: Direct URL Access

1. After completing Test 1
2. Type `/quiz` in URL bar
3. Should be redirected to recommender
4. Check console for block message

### Test 4: New Tab Test

1. Complete quiz in Tab A
2. Open new tab (Tab B)
3. In Tab B, go to `/quiz`
4. Should be able to access quiz (separate session)

### Test 5: Browser Refresh

1. After completing quiz
2. On recommender page, refresh browser
3. Try to go back to quiz
4. Should still be blocked (guard persists)

## 📱 Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## 📊 Success Indicators

| Indicator                | Expected |
| ------------------------ | -------- |
| UTM Preservation Rate    | >95%     |
| Guard Activation Success | >99%     |
| Back Navigation Blocks   | 100%     |
| Console Errors           | 0        |

## 🆘 Emergency Disable

If you need to temporarily disable the guard:

```javascript
// In browser console
sessionStorage.removeItem("budgetbee_recommender_accessed");
sessionStorage.removeItem("budgetbee_quiz_completed");
location.reload();
```

Or programmatically:

```typescript
import { clearGuardState } from "@/lib/utils/quizNavigationGuard";
clearGuardState();
```

## 📖 Full Documentation

For complete implementation details, see:

- `lib/documents/QUIZ_NAVIGATION_GUARD.md` - Detailed technical documentation
- `lib/documents/QUIZ_NAVIGATION_GUARD_IMPLEMENTATION_SUMMARY.md` - Complete implementation guide

## 🎓 Training Resources

### For Developers

1. Read `QUIZ_NAVIGATION_GUARD.md`
2. Review `src/lib/utils/quizNavigationGuard.ts`
3. Test using `scripts/test-quiz-navigation-guard.js`
4. Practice manual testing scenarios above

### For QA/Testing

1. Use this quick reference guide
2. Run automated tests in browser console
3. Follow manual testing steps
4. Report any issues with console logs

## 📞 Support

**Issue**: Guard not working  
**Action**: Check console logs, verify sessionStorage, review troubleshooting section

**Issue**: UTM parameters missing  
**Action**: Check sessionStorage for UTM keys, verify URL construction

**Issue**: Need to add new recommender page  
**Action**: Copy guard script from existing recommender page, update page detection if needed

---

**Last Updated**: October 1, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready
