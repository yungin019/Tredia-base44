const BULLISH_KEYWORDS = ['surge', 'rally', 'gain', 'rise', 'growth', 'up', 'profit', 'beat', 'strong', 'record'];
const BEARISH_KEYWORDS = ['crash', 'fall', 'drop', 'loss', 'decline', 'plunge', 'weak', 'miss', 'recession', 'cut'];

const TICKER_MAP = {
  'AAPL': ['AAPL', 'Apple'],
  'TSLA': ['TSLA', 'Tesla'],
  'NVDA': ['NVDA', 'Nvidia'],
  'MSFT': ['MSFT', 'Microsoft'],
  'GOOGL': ['GOOGL', 'Google', 'Alphabet'],
  'AMZN': ['AMZN', 'Amazon'],
  'META': ['META', 'Meta', 'Facebook'],
  'BTC': ['BTC', 'Bitcoin'],
  'ETH': ['ETH', 'Ethereum'],
  'SPX': ['SPX', 'S&P', 'S&P 500'],
  'FED': ['Fed', 'Federal Reserve'],
};

export function analyzeSentiment(headline) {
  const lower = headline.toLowerCase();
  const bullScore = BULLISH_KEYWORDS.filter(k => lower.includes(k)).length;
  const bearScore = BEARISH_KEYWORDS.filter(k => lower.includes(k)).length;
  if (bullScore > bearScore) return 'BULLISH';
  if (bearScore > bullScore) return 'BEARISH';
  return 'NEUTRAL';
}

export function getAffectedTickers(headline) {
  const matched = [];
  for (const [ticker, keywords] of Object.entries(TICKER_MAP)) {
    if (keywords.some(k => headline.includes(k))) {
      matched.push(ticker);
    }
  }
  return matched;
}

export async function fetchMarketNews() {
  const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=finance%20market%20stocks&mode=artlist&maxrecords=10&format=json';
  const res = await fetch(url);
  const data = await res.json();
  return (data.articles || []).map(a => ({
    title: a.title,
    url: a.url,
    domain: a.domain,
    seendate: a.seendate,
    sentiment: analyzeSentiment(a.title || ''),
    tickers: getAffectedTickers(a.title || ''),
  }));
}