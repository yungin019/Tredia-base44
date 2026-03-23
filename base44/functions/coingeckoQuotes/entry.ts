import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * COINGECKO CRYPTO QUOTES - Separate provider for crypto
 * 
 * Crypto provider (separate from stocks)
 * No API key required (free tier works but has rate limits)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { symbols } = body;

    if (!symbols || symbols.length === 0) {
      return Response.json({ error: 'Missing symbols' }, { status: 400 });
    }

    // Map symbols to CoinGecko IDs
    const COIN_MAP = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'DOT': 'polkadot',
      'ATOM': 'cosmos'
    };

    const validSymbols = symbols.filter(s => COIN_MAP[s]);
    if (validSymbols.length === 0) {
      return Response.json({ error: 'No valid crypto symbols' }, { status: 400 });
    }

    const results = {};
    const TIMEOUT = 2500;

    try {
      const ids = validSymbols.map(s => COIN_MAP[s]).join(',');
      
      console.log(`[CoinGecko] Fetching: ${ids}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=false`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (res.status === 429) {
        console.error('[CoinGecko] Rate limited (429)');
        validSymbols.forEach(s => {
          results[s] = { status: 'unavailable', error: 'Rate limited' };
        });
        return Response.json({
          quotes: results,
          timestamp: Date.now(),
          provider: 'coingecko'
        });
      }

      if (res.status !== 200) {
        console.error(`[CoinGecko] Error ${res.status}`);
        validSymbols.forEach(s => {
          results[s] = { status: 'unavailable', error: `HTTP ${res.status}` };
        });
        return Response.json({
          quotes: results,
          timestamp: Date.now(),
          provider: 'coingecko'
        });
      }

      const data = await res.json();

      // Transform results
      validSymbols.forEach(symbol => {
        const coinId = COIN_MAP[symbol];
        const coinData = data[coinId];

        if (!coinData || !coinData.usd) {
          results[symbol] = { status: 'unavailable', error: 'No price data' };
          return;
        }

        const price = coinData.usd;
        const change24h = coinData.usd_24h_change || 0;
        const prevPrice = price / (1 + change24h / 100);

        results[symbol] = {
          status: 'live',
          symbol,
          price: parseFloat(price.toFixed(2)),
          change: parseFloat((price - prevPrice).toFixed(2)),
          changePercent: parseFloat(change24h.toFixed(2)),
          prevClose: parseFloat(prevPrice.toFixed(2)),
          timestamp: Date.now(),
          provider: 'coingecko',
          rawResponse: coinData
        };

        console.log(`[CoinGecko] ✓ ${symbol}: $${results[symbol].price}`);
      });
    } catch (error) {
      console.error('[CoinGecko] Error:', error.message);
      validSymbols.forEach(s => {
        results[s] = { status: 'unavailable', error: error.message };
      });
    }

    return Response.json({
      quotes: results,
      timestamp: Date.now(),
      provider: 'coingecko'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});