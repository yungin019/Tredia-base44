# Tier Integration Guide

## How to Use the Three-Tier System

### In Home Page (Tier 1)

```javascript
import { fetchTier1Core } from '@/api/marketDataTiers';

export default function Home() {
  const [coreAssets, setCoreAssets] = useState([]);

  useEffect(() => {
    // Fetch Tier 1 on mount
    const load = async () => {
      const data = await fetchTier1Core();
      setCoreAssets(data);
    };
    load();

    // Auto-refresh every 15s
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return <CoreAssetDisplay assets={coreAssets} />;
}
```

---

### In Asset Detail Page (Tier 3)

```javascript
import { fetchTier3OnDemand } from '@/api/marketDataTiers';

export default function AssetDetail() {
  const { symbol } = useParams();
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchTier3OnDemand(symbol);
      setAsset(data);
    };
    load();
  }, [symbol]);

  return <div>{asset?.price}</div>;
}
```

---

### In Watchlist (Tier 2)

```javascript
import { fetchTier2Priority } from '@/api/marketDataTiers';

export default function Portfolio() {
  const [watchlist, setWatchlist] = useState([]);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    // Fetch watchlist data with Tier 2 priority (30s refresh)
    const symbols = watchlist.map(w => w.symbol);
    
    const load = async () => {
      const data = await fetchTier2Priority(symbols);
      const map = {};
      data.forEach(item => map[item.symbol] = item);
      setPrices(map);
    };

    load();
    const interval = setInterval(load, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, [watchlist]);

  return <WatchlistTable prices={prices} />;
}
```

---

### In Markets / Search (Tier 3)

```javascript
import { fetchTier3Batch } from '@/api/marketDataTiers';
import { searchSymbols, autocompleteSymbol } from '@/api/symbolSearch';

export default function Markets() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [prices, setPrices] = useState({});

  // Typeahead (no API calls)
  const handleInputChange = (value) => {
    setQuery(value);
    const results = autocompleteSymbol(value, 15);
    setSearchResults(results);
  };

  // On Enter / Search button
  const handleSearch = async (query) => {
    const results = searchSymbols(query, 15);
    setSearchResults(results);

    // Fetch prices for results (batch with cache)
    const symbols = results.map(r => r.symbol);
    const prices = await fetchTier3Batch(symbols);
    
    const map = {};
    prices.forEach(p => map[p.symbol] = p);
    setPrices(map);
  };

  return (
    <div>
      <input onChange={(e) => handleInputChange(e.target.value)} />
      <div>
        {searchResults.map(r => (
          <div key={r.symbol}>
            {r.symbol} - ${prices[r.symbol]?.price || 'Loading...'}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### In Global Search Modal (Tier 3 + Tier 1)

```javascript
import { getPopularAssets, getTrendingAssets } from '@/api/symbolSearch';
import { fetchTier1Core, fetchTier3OnDemand } from '@/api/marketDataTiers';

export default function GlobalAssetSearch() {
  const [tab, setTab] = useState('popular');
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const load = async () => {
      if (tab === 'popular') {
        // Popular = Tier 1 (always fresh)
        const data = await fetchTier1Core();
        const map = {};
        data.forEach(d => map[d.symbol] = d);
        setPrices(map);
      } else if (tab === 'trending') {
        // Trending = mix of Tier 1 + Tier 3
        const trending = getTrendingAssets();
        const symbols = trending.map(t => t.symbol);
        
        const data = await Promise.all(
          symbols.map(s => fetchTier3OnDemand(s))
        );
        
        const map = {};
        data.forEach(d => {
          if (d) map[d.symbol] = d;
        });
        setPrices(map);
      }
    };
    load();
  }, [tab]);

  return (
    <div>
      {tab === 'popular' && (
        getPopularAssets().map(asset => (
          <div key={asset.symbol}>
            {asset.name}
            <Price symbol={asset.symbol} data={prices[asset.symbol]} />
          </div>
        ))
      )}
    </div>
  );
}
```

---

### Symbol Validation

```javascript
import { isValidSymbol, getAssetMetadata } from '@/api/marketDataTiers';

// Before fetching
if (!isValidSymbol("AAPL")) {
  return <div>Symbol not found</div>;
}

// Get asset info
const metadata = getAssetMetadata("COIN");
// Returns: {
//   symbol: "COIN",
//   name: "Coinbase",
//   type: "stock",
//   sector: "Crypto",
//   providers: ["fallback"],
//   isTier1: false
// }
```

---

## Migration Checklist

### Phase 1: Update Core Components
- [ ] Home page: Use `fetchTier1Core()` instead of direct API calls
- [ ] CoreAssetDisplay: Show cache status (yellow dot for cached)
- [ ] Update `marketDataClient.js` to use new tier functions

### Phase 2: Add Search Integration
- [ ] GlobalAssetSearch: Use `searchSymbols()` + `autocompleteSymbol()`
- [ ] Markets page: Add Tier 3 batch fetch for expanded views
- [ ] Asset detail page: Use `fetchTier3OnDemand()`

### Phase 3: Watchlist as Tier 2
- [ ] Portfolio page: Track watchlist additions
- [ ] Use `fetchTier2Priority()` for watchlist refresh
- [ ] Show Tier 2 refresh rate (30s) in UI

### Phase 4: Remove Old Patterns
- [ ] Delete old `marketDataClient.js` functions (keep exports as facades)
- [ ] Remove hardcoded fallback prices from `stockPrices.js` (now in `assetUniverse.js`)
- [ ] Archive old polling logic

---

## Expected Results

### Before (Old System)
- Only 8 core assets visible
- No search beyond core 8
- Hardcoded fallback list in function
- Unclear asset coverage

### After (New System)
- 8 core always-live
- 64 searchable assets (37 stocks + 15 ETFs + 12 crypto)
- Dynamic symbol universe
- Clear Tier 1/2/3 separation
- User watchlist gets priority refresh
- No mass preload

---

## API Call Budget Example

### Scenario: User with 5-asset watchlist

| Action | API Calls | Frequency | Total |
|--------|-----------|-----------|-------|
| Tier 1 (Home) | 1 call/8 symbols | Every 15s | 4/min |
| Tier 2 (Watchlist, open) | 1 call/5 symbols | Every 30s | 2/min |
| Tier 3 (Search "META") | 1 call/1 symbol | On demand | 1 call |
| **Total** | — | — | **6–10/min** |

**Contrast:** Old polling-all approach = 72+ calls/min = **unscalable**

---

## Future Enhancements

### Short Term
1. Add real-time WebSocket for Tier 1 (live price tickers)
2. Add Stripe integration to show price near support/resistance
3. Alert system for Tier 2 watchlist price changes

### Medium Term
1. Add 100+ more stocks to Tier 3 universe
2. Add Forex pairs (new asset class, separate provider)
3. Add options data (new provider needed)

### Long Term
1. User-defined custom tiers (VIP watchlist)
2. ML-driven asset recommendations
3. Cross-asset correlation analysis