# TREDIA: 1-Second Decision Engine Architecture

## Core Principle
NOT a news app. NOT a content feed.  
TREDIA is a **real-time decision engine** that instantly tells users:
- What is happening
- What to do  
- How strong it is

**All in under 1 second.**

---

## 1. FEED IS THE PRODUCT (NON-NEGOTIABLE)

### Above the Fold
1. **HERO SIGNAL** — Highest priority, most actionable signal
2. **1–2 SECONDARY SIGNALS** — Supporting context
3. **YOUR MOVES TODAY** — Execution layer with trade instructions

### Below the Fold
- Supporting content (brief, watchlist, trending)
- Context layers (watch out, market pulse)
- Offers & promotions (at END, not intrusive)

---

## 2. SIGNAL RENDERING SYSTEM

Every signal follows this structure:

```
LINE 1:  [SIGNAL] — [MARKET STATE]
LINE 2:  ⚡ ACTION (max 5 words, UPPERCASE, command-style)
LINE 3:  → Driver
LINE 4:  → Impact
LINE 5:  ⚠ Risk
LINE 6:  [Strength badge]
```

**Rules:**
- Max 6 lines total
- No paragraphs
- No filler
- No news tone
- Action ALWAYS uppercase

Example:
```
BULLISH — Market stabilizing after selloff

⚡ LEAN LONG CONTINUATION

→ Fed signals pause, bond yields falling
→ Tech rebounding from lows

⚠ Risk: Selling resumes on inflation print

[Strength: STRONG]
```

---

## 3. HERO SIGNAL CARD

The hero card is readable **in 1 second WITHOUT scanning**.

### Visual Rules
- Largest typography (headline dominant)
- Strongest glow (based on signal strength)
- Slight scale increase (1.01–1.02)
- Strong border (signal color)
- High contrast

### Implementation
- Component: `HeroSignalCard.jsx`
- Uses signal strength calculations
- Auto-positioned at top of feed
- Rendered BEFORE secondary cards

---

## 4. SIGNAL STRENGTH SYSTEM

Each signal has strength level:

### STRONG (80–100 confidence)
- Strong glow
- Slight pulse animation
- Thicker border
- Full opacity
- Visual dominance

### MODERATE (60–79 confidence)
- Normal glow
- No animation
- Standard border
- 0.85 opacity
- Secondary prominence

### WEAK (<60 confidence)
- Minimal glow
- Reduced opacity (0.6)
- Thinner border
- Fades naturally
- User ignores without effort

**User must FEEL strength without reading numbers.**

Implementation: `lib/signalStrength.js`
- `calculateSignalStrength(signal)` returns visual tokens
- `getSignalColor(direction)` returns hex color
- Applied automatically to all signal cards

---

## 5. AUTO-RANKING SYSTEM (CRITICAL)

The system **automatically ranks signals**. User NEVER chooses.

### Ranking Algorithm
1. **Filter by region** (strict: no cross-contamination)
2. **Sort by importance** (descending)
3. **Secondary sort by timing** (Live > Developing > Follow-up)
4. **Place strongest signal as HERO**
5. **Push weaker signals down**

Implementation: `IntelligenceFeed.jsx`
- `filterAndRank(reactions, region)` function
- Zero network calls
- Pure JS array operations
- Fast, deterministic

---

## 6. YOUR MOVES TODAY (EXECUTION MODE)

Transform signals into trading instructions.

### Format
```
[AAPL] — BULLISH

⚡ WAIT BREAKOUT

Entry → 259
Size → Small
Hold → 1–2w

⚠ Sideways = no trade
```

### Rules
- ACTION in UPPERCASE
- No passive language
- Must feel like trading desk output
- Command-style directives only

Implementation: `components/feed/YourMovesToday.jsx`
- Uppercase action parsing
- Entry/size/hold trade plan grid
- Risk always included

---

## 7. CHAT WIDGET (NON-INTRUSIVE)

- Must NOT overlap feed
- Add bottom spacing to main content (pb-24)
- Reduce size on mobile
- Secondary priority vs signals
- Position bottom-right fixed

Implementation: `components/layout/AppShell.jsx`
- Increased main pb to 24 (mobile) / 8 (desktop)
- TredioAssistant positioned separately
- Never blocks signal content

---

## 8. COGNITIVE VALIDATION SYSTEM

Each card must pass internal tests:

### TEST 1: Direction Clarity
- Can direction be understood instantly? (yes/no)
- Must have direction + marketState

### TEST 2: Action Clarity
- Can action be understood instantly? (yes/no)
- Must have actionBias or action field

### TEST 3: Strength Perception
- Can strength be perceived visually? (yes/no)
- Importance >= 40

If any test FAILS → **automatically simplify**:
- Reduce text
- Shorten lines
- Increase contrast
- No reading required

Implementation:
- `lib/signalStrength.js` — `validateSignalCognition(signal)`
- `components/feed/SignalValidator.jsx` — HOC wrapper + test component
- Applied automatically to all signals

---

## 9. ATTENTION CONTROL SYSTEM

The UI **guides attention** through visual hierarchy:

### Strong Signals → ATTRACT
- Larger glow
- Pulse animation
- Thicker border
- Full opacity
- User naturally focuses

### Weak Signals → FADE
- Minimal glow
- No animation
- Thin border
- Reduced opacity
- User ignores without effort

Implementation: `lib/signalStrength.js`
- Opacity applied via `strength.opacity`
- Glow size via `strength.glowSize`
- Border weight via `strength.borderWidth`
- Pulse animation via `strength.pulse`

---

## 10. FINAL EXPERIENCE GOAL

```
User opens app →

In 1 second knows:
  - Market direction (LINE 1)
  - What to do (LINE 2)
  - Where opportunity is (signal color + glow)

If user needs to read → FAIL
```

### Checklist
- ✅ Hero signal visible at top
- ✅ Direction clear in headline
- ✅ Action in uppercase line 2
- ✅ Strength visible via glow/pulse
- ✅ Weak signals fade naturally
- ✅ Chat doesn't overlap
- ✅ Mobile-first responsive
- ✅ Fast (no async loading blocks)

---

## File Structure

```
components/
  feed/
    HeroSignalCard.jsx         ← Hero card component
    FeedReactionBlock.jsx      ← Secondary signal card (updated)
    YourMovesToday.jsx         ← Execution layer (updated)
    IntelligenceFeed.jsx       ← Auto-ranking feed (updated)
    SignalValidator.jsx        ← Cognitive validation
  layout/
    AppShell.jsx               ← Chat positioning (updated)

lib/
  signalStrength.js            ← Core strength system
  
pages/
  Home.jsx                      ← Reordered (signals first) (updated)

index.css                        ← Signal simplified mode + 1-sec styles (updated)
```

---

## Key Improvements This Update

1. **Signal Strength System** — Visual feedback without numbers
2. **Auto-Ranking** — System decides importance, user never does
3. **Hero Card** — Optimized for 1-second scan
4. **Cognitive Validation** — Automatic text simplification
5. **Attention Control** — Weak signals fade, strong signals pop
6. **Feed Priority** — Signals FIRST, offers LAST
7. **Chat Integration** — Non-intrusive, no overlap
8. **Mobile Optimization** — 1-second scan on mobile too

---

## Performance Targets

- **First render:** <500ms
- **Signal update:** <200ms
- **Region switch:** <400ms
- **Cognitive validation:** <50ms (local)
- **Zero blocking calls**

All implemented via pure JS, no network dependencies.

---

## Next Steps (Optional)

1. **A/B Test Hero Card** — Compare scan times (eye-tracking)
2. **Refine Strength Thresholds** — Adjust STRONG/MODERATE/WEAK cutoffs
3. **Add Gesture Responses** — Swipe to dismiss weak signals
4. **Real-time Updates** — WebSocket integration for live importance changes
5. **User Preferences** — Let power users customize strength display

But the core system is **production-ready now**.