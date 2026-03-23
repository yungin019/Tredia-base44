# Signal Normalization - Canonical Mapping

## Canonical Signal Set (Production)
```
BUY     - Strong bullish signal, momentum positive
SELL    - Strong bearish signal, momentum negative  
WATCH   - Neutral/consolidation, mixed signals
AVOID   - Bearish but not as strong as SELL, caution advised
```

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

## Removed Old Labels
- ❌ BULLISH
- ❌ BEARISH  
- ❌ HOLD (→ WATCH)
- ❌ LONG (→ BUY)
- ❌ SHORT (→ SELL)

## Signal Flow

```
┌─────────────────────────────────────┐
│  Market Data (price, momentum, RSI) │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  signalEngine.js / trekEngine.js    │
│  Derive: BUY, SELL, WATCH, AVOID    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  API Returns: {signal, confidence}  │
│  CANONICAL SET ONLY                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  UI Components                      │
│  - YourMovesToday (signal colors)   │
│  - NextJumpDetector (direction)     │
│  - Markets (signal badges)          │
│  All use CANONICAL signals          │
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