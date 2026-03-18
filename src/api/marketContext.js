const AV_KEY = import.meta.env.VITE_ALPHAVANTAGE_API_KEY || import.meta.env.ALPHAVANTAGE_API_KEY;

export async function fetchStockRSI(symbol) {
  try {
    const url = `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${AV_KEY}`;
    const data = await fetch(url).then(r => r.json());
    const analysis = data?.['Technical Analysis: RSI'];
    if (!analysis) return 55;
    const latestDate = Object.keys(analysis)[0];
    return parseFloat(analysis[latestDate]?.RSI ?? 55);
  } catch {
    return 55;
  }
}

export async function fetchStockPrice(symbol) {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_KEY}`;
    const data = await fetch(url).then(r => r.json());
    const quote = data?.['Global Quote'];
    if (!quote) return null;
    return {
      price: parseFloat(quote['05. price']),
      change24h: parseFloat(quote['10. change percent']?.replace('%', '')),
      volume: parseInt(quote['06. volume']),
    };
  } catch {
    return null;
  }
}

export async function buildMarketContext(userPortfolio = null) {
  try {
    const [fngRes, cryptoRes] = await Promise.allSettled([
      fetch('https://api.alternative.me/fng/').then(r => r.json()),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true').then(r => r.json()),
    ]);

    const fng = fngRes.status === 'fulfilled' ? fngRes.value?.data?.[0] : null;
    const crypto = cryptoRes.status === 'fulfilled' ? cryptoRes.value : null;

    return {
      fng_value: fng ? parseInt(fng.value) : null,
      fng_label: fng ? fng.value_classification : null,
      btc_price: crypto?.bitcoin?.usd ?? null,
      btc_change_24h: crypto?.bitcoin?.usd_24h_change ?? null,
      eth_price: crypto?.ethereum?.usd ?? null,
      eth_change_24h: crypto?.ethereum?.usd_24h_change ?? null,
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
      portfolio: userPortfolio,
      timestamp: new Date().toISOString(),
    };
  }
}