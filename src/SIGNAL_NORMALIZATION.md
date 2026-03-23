# Signal Normalization - Canonical Mapping

## Canonical Signal Set (User-Facing)
**These are the ONLY labels users see in UI:**
```
BUY     - Action: Enter position
SELL    - Action: Exit position
WATCH   - Action: Monitor, no entry yet
AVOID   - Action: Stay out, high risk
```

## Internal Analysis States (Hidden from Users)
**Used internally for reasoning and bias, NOT as visible action labels:**
- BULLISH - Positive momentum, uptrend bias
- BEARISH - Negative momentum, downtrend bias
- LONG - Potential buy setup
- SHORT - Potential sell setup

These appear only in:
- Reason/reasoning text (descriptive)
- System prompts for AI analysis
- Internal logic comments
- Never in action badges or main CTA

## Source-Level Normalization (FIXED ✅)

### api/signalEngine.js
- **Before:** BUY, HOLD, SELL
- **After:** BUY, WATCH, SELL (HOLD → WATCH)
- **Status:** ✅ NORMALIZED

### api/trekEngine.js  
- **Before:** BUY, HOLD, SELL
- **After:** BUY, WATCH, SELL (HOLD → WATCH)
- **Status:** ✅ NORMALIZED

### pages/Home.jsx
- **Before:** Uses LONG/SHORT for NextJumpDetector
- **After:** Uses BUY/SELL for NextJumpDetector
- **Status:** ✅ NORMALIZED

### components/ai/NextJumpDetector.jsx
- **Before:** Accepted LONG/SHORT
- **After:** Expects BUY/SELL/WATCH/AVOID
- **Status:** ✅ NORMALIZED

### components/feed/YourMovesToday.jsx
- **Signals Used:** BUY, AVOID, WATCH, SELL
- **Fallback:** WATCH (for unknown values)
- **Status:** ✅ PROTECTED

## What Changed

### Removed as ACTION Labels (no longer shown to users)
- ❌ BULLISH (now: internal analysis state only)
- ❌ BEARISH (now: internal analysis state only)
- ❌ HOLD (→ WATCH)
- ❌ LONG (→ BUY in action labels)
- ❌ SHORT (→ SELL in action labels)

### Kept as Internal Analysis States (hidden, for reasoning)
- ✅ bullish/bearish (in reason text, prompts, comments)
- ✅ long/short (in system prompts, internal logic)
- Used ONLY for explanation, never as visible action badges

## Signal Flow

```
┌─────────────────────────────────────┐
│  Market Data (price, momentum, RSI) │
└────────────┬────────────────────────┘
             │
             ├─→ Internal: "momentum is bullish" (reasoning)
             ├─→ Internal: "bias is long" (analysis state)
             │
             ▼
┌─────────────────────────────────────┐
│  signalEngine.js / trekEngine.js    │
│  Calculate: momentum, volatility    │
│  Derive ACTION: BUY, SELL, WATCH    │
│  Reasoning: use bullish/bearish for │
│  explanation, NOT as action label   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  API Returns:                       │
│  {                                  │
│    signal: "BUY",           ← CANONICAL
│    reason: "bullish momentum...",   ← Can mention bullish
│    confidence: 75                   │
│  }                                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  UI Components                      │
│  Display:                           │
│  Badge: "BUY" ← Only canonical      │
│  Text: "bullish momentum" ← OK, in reason
│                                     │
│  User sees: Action + Reasoning      │
└─────────────────────────────────────┘
```

## Components Audited ✅

| Component | Signals Used | Status |
|-----------|-------------|--------|
| YourMovesToday | BUY, AVOID, WATCH, SELL | ✅ CANONICAL |
| NextJumpDetector | BUY, SELL, WATCH | ✅ CANONICAL |
| ExpandedAssetList | BUY, SELL, WATCH | ✅ CANONICAL |
| Home.jsx | Passes canonical signals | ✅ CANONICAL |

## No More Signal Normalization in UI
- ~~YourMovesToday fallback~~ (still there as safety net)
- All upstream signals are CANONICAL before reaching components
- Components can rely on exact signal values

## Summary
✅ **All signal sources normalized to canonical set**  
✅ **No more HOLD, LONG, SHORT, BULLISH, BEARISH**  
✅ **UI components receive clean, consistent signals**  
✅ **Fallback protection still in place for safety**