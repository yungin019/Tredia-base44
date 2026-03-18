import { base44 } from '@/api/base44Client';

export async function fetchStockRSI(symbol) {
  try {
    const res = await base44.functions.invoke('marketData', { type: 'rsi', symbol });
    return res.data?.rsi ?? 55;
  } catch {
    return 55;
  }
}

export async function fetchStockPrice(symbol) {
  try {
    const res = await base44.functions.invoke('marketData', { type: 'quote', symbol });
    return res.data?.quote ?? null;
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