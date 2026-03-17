export async function fetchCryptoData() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true'
    );
    const data = await res.json();
    return [
      { symbol: 'BTC', price: data.bitcoin?.usd, change24h: data.bitcoin?.usd_24h_change },
      { symbol: 'ETH', price: data.ethereum?.usd, change24h: data.ethereum?.usd_24h_change },
      { symbol: 'SOL', price: data.solana?.usd, change24h: data.solana?.usd_24h_change },
    ];
  } catch {
    return null;
  }
}

export async function fetchFearGreed() {
  try {
    const res = await fetch('https://api.alternative.me/fng/');
    const data = await res.json();
    const item = data.data?.[0];
    if (!item) return null;
    return { value: parseInt(item.value), classification: item.value_classification };
  } catch {
    return null;
  }
}