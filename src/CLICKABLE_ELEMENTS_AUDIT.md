# TREDIO Market Signals - Clickable Elements Audit
**Date:** 2026-03-24  
**Component:** CatalystFeed (Market Signals)  
**Status:** ✅ ALL DEAD CLICKS ELIMINATED

---

## IMPLEMENTATION SUMMARY

### "See Why" Button
**Status:** ✅ **FULLY FUNCTIONAL**

**Behavior:**
- Clicking "See Why" opens `SignalExplanationModal`
- Modal displays full TREK interpretation of the signal
- Works for both news-based and structure-based signals

**Content Delivered:**
1. ✅ Market context (why this matters)
2. ✅ What is driving it (driver)
3. ✅ What assets/sectors affected (related_assets + regions)
4. ✅ What TREK is watching (impact)
5. ✅ Risk/invalidation (risk field)

**For News Signals:**
- ✅ Source headline displayed
- ✅ Source name + link included
- ✅ [View Original] button functional

**For Structure Signals:**
- ✅ Market behavior explanation (price action, sentiment, volatility)
- ✅ ⚡ "Live Structure" badge visible
- ✅ Clarification footer explaining signal origin

---

## AUDIT: ALL CLICKABLE ELEMENTS IN MARKET SIGNALS

### 1. **See Why Button**
- **Location:** Bottom-left of each signal card
- **Implementation:** `onClick={() => { setSelectedSignal(catalyst); setModalOpen(true); }}`
- **Status:** ✅ WORKING
- **Behavior:** Opens modal with full explanation
- **Modal Content:** Full TREK interpretation

### 2. **View Source Button** (News-Only)
- **Location:** Bottom-right of news signal cards
- **Condition:** Only shows if `catalyst.source_url` exists
- **Implementation:** `onClick={handleViewSource}` → `window.open(catalyst.source_url, '_blank')`
- **Status:** ✅ WORKING
- **Behavior:** Opens original news article in new tab

### 3. **Signal Cards (Clickable Area)**
- **Location:** Entire card surface
- **Current:** Card shows content but card itself not clickable
- **Alternative:** Full card is readable without click
- **Status:** ⚠️ OPTIONAL - Cards display all critical info in plain view

### 4. **Asset Pills / Symbols**
- **Location:** Signal card → "Affected Assets" section
- **Current:** Display-only (show ticker symbols)
- **Status:** ⚠️ OPTIONAL - Could link to /Asset/:symbol detail page
- **Implementation:** Not added (user didn't request)

### 5. **Region Filter Tabs**
- **Location:** Sticky header at top
- **Components:** RegionSwitcher (Global, US, Europe, Asia, Africa, LatAm)
- **Status:** ✅ WORKING
- **Behavior:** Filters CatalystFeed by region
- **Implementation:** `onClick={() => handleRegionChange(region)}`

### 6. **Signal Modal - View Original Link**
- **Location:** Inside modal header (News signals only)
- **Status:** ✅ WORKING
- **Behavior:** Opens source article in new tab
- **Implementation:** `<a href={signal.source_url} target="_blank" rel="noopener noreferrer">`

### 7. **Modal Close Button (X)**
- **Location:** Top-right of modal
- **Status:** ✅ WORKING
- **Behavior:** Closes modal, clears selected signal
- **Implementation:** `onClick={() => { setModalOpen(false); setSelectedSignal(null); }}`

### 8. **Modal Backdrop**
- **Location:** Dark overlay behind modal
- **Status:** ✅ WORKING
- **Behavior:** Click outside modal closes it
- **Implementation:** `onClick={onClose}` on backdrop

---

## VERIFICATION CHECKLIST

- [x] "See Why" button is clickable
- [x] Clicking "See Why" opens modal
- [x] Modal displays all 5 required content sections
- [x] Modal shows real data (not placeholders)
- [x] "View Source" button works for news signals
- [x] Modal closes when clicking X button
- [x] Modal closes when clicking backdrop
- [x] Region tabs filter signals correctly
- [x] Structure signals show ⚡ badge + explanation
- [x] News signals show source + link
- [x] No dead clicks remain in Market Signals section
- [x] All interactive elements have hover feedback
- [x] Modal animations are smooth

---

## NO FAKE AFFORDANCES

✅ Every clickable element in Market Signals has real behavior.  
✅ No placeholder text or lorem ipsum.  
✅ No static demo content.  
✅ All content generated from actual signal data.  

---

## FUTURE ENHANCEMENTS (NOT IMPLEMENTED - USER DIDN'T REQUEST)

- [ ] Make asset pills clickable → navigate to /Asset/:symbol
- [ ] Make full signal card clickable → open modal
- [ ] Add "Copy to clipboard" for signal analysis
- [ ] Add "Share signal" button
- [ ] Add "Archive/bookmark" signal feature