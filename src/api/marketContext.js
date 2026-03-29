import { base44 } from '@/api/base44Client';

export async function fetchStockRSI(symbol) {
  try {
    const res = await base44.functions.invoke('marketAggregator', { type: 'rsi', symbol });
    return res.data?.rsi ?? 55;
  } catch {
    return 55;
  }
}

export async function fetchStockPrice(symbol) {
  try {
    const res = await base44.functions.invoke('marketAggregator', { symbol });
    return res.data?.quote ?? null;
  } catch {
    return null;
  }
}

async function fetchCommonStockPrices() {
  try {
    const symbols = ['SPY', 'AAPL', 'NVDA', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];
    const results = {};

    await Promise.allSettled(
      symbols.map(async (symbol) => {
        try {
          const res = await base44.functions.invoke('marketAggregator', { symbol });
          const quote = res.data?.quote;
          if (quote) {
            results[symbol] = {
              price: quote.price,
              change: quote.change24h
            };
          }
        } catch (e) {
          // Silently fail for individual symbols
        }
      })
    );

    return results;
  } catch {
    return {};
  }
}

async function fetchCommodityPrices() {
  try {
    // Fetch gold, silver, oil via CoinGecko's commodities or fallback
    const cryptoIds = 'bitcoin,ethereum,solana,cardano,dogecoin,polkadot';
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd&include_24hr_change=true`
    );
    if (!res.ok) return {};
    const data = await res.json();

    const results = {};
    const mapping = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'cardano': 'ADA',
      'dogecoin': 'DOGE',
      'polkadot': 'DOT'
    };

    Object.entries(mapping).forEach(([id, symbol]) => {
      if (data[id]) {
        results[symbol] = {
          price: data[id].usd,
          change: data[id].usd_24h_change
        };
      }
    });

    return results;
  } catch {
    return {};
  }
}

export async function buildMarketContext(userPortfolio = null) {
  try {
    const [fngRes, stocksData, cryptoData] = await Promise.allSettled([
      fetch('https://api.alternative.me/fng/').then(r => r.json()),
      fetchCommonStockPrices(),
      fetchCommodityPrices(),
    ]);

    const fng = fngRes.status === 'fulfilled' ? fngRes.value?.data?.[0] : null;
    const stocks = stocksData.status === 'fulfilled' ? stocksData.value : {};
    const crypto = cryptoData.status === 'fulfilled' ? cryptoData.value : {};

    return {
      fng_value: fng ? parseInt(fng.value) : null,
      fng_label: fng ? fng.value_classification : null,
      btc_price: crypto.BTC?.price ?? null,
      btc_change_24h: crypto.BTC?.change ?? null,
      eth_price: crypto.ETH?.price ?? null,
      eth_change_24h: crypto.ETH?.change ?? null,
      spy_price: stocks.SPY?.price ?? null,
      spy_change: stocks.SPY?.change ?? null,
      aapl_price: stocks.AAPL?.price ?? null,
      aapl_change: stocks.AAPL?.change ?? null,
      nvda_price: stocks.NVDA?.price ?? null,
      nvda_change: stocks.NVDA?.change ?? null,
      tsla_price: stocks.TSLA?.price ?? null,
      tsla_change: stocks.TSLA?.change ?? null,
      all_stocks: stocks,
      all_crypto: crypto,
      portfolio: userPortfolio,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return {
      fng_value: null,
      fng_label: null,
      btc_price: null,
      btc_change_24h: null,
      eth_price: null,
      eth_change_24h: null,
      spy_price: null,
      spy_change: null,
      all_stocks: {},
      all_crypto: {},
      portfolio: userPortfolio,
      timestamp: new Date().toISOString(),
    };
  }
}