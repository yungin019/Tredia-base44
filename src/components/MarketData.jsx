// Simulated real-time market data generator
const STOCKS = {
  AAPL: { name: "Apple Inc.", sector: "Technology", base: 189.50 },
  MSFT: { name: "Microsoft Corp.", sector: "Technology", base: 415.20 },
  GOOGL: { name: "Alphabet Inc.", sector: "Technology", base: 141.80 },
  AMZN: { name: "Amazon.com Inc.", sector: "Consumer Cyclical", base: 178.25 },
  NVDA: { name: "NVIDIA Corp.", sector: "Technology", base: 875.40 },
  TSLA: { name: "Tesla Inc.", sector: "Automotive", base: 175.60 },
  META: { name: "Meta Platforms", sector: "Technology", base: 505.75 },
  JPM: { name: "JPMorgan Chase", sector: "Financial", base: 198.30 },
  V: { name: "Visa Inc.", sector: "Financial", base: 282.15 },
  JNJ: { name: "Johnson & Johnson", sector: "Healthcare", base: 156.90 },
  UNH: { name: "UnitedHealth Group", sector: "Healthcare", base: 527.40 },
  XOM: { name: "Exxon Mobil", sector: "Energy", base: 104.80 },
  WMT: { name: "Walmart Inc.", sector: "Consumer Defensive", base: 168.50 },
  PG: { name: "Procter & Gamble", sector: "Consumer Defensive", base: 162.30 },
  MA: { name: "Mastercard Inc.", sector: "Financial", base: 468.90 },
};

const INDICES = {
  SPX: { name: "S&P 500", base: 5234.18 },
  DJI: { name: "Dow Jones", base: 39512.84 },
  IXIC: { name: "NASDAQ", base: 16399.52 },
  RUT: { name: "Russell 2000", base: 2075.63 },
  VIX: { name: "VIX", base: 14.32 },
};

const CRYPTO = {
  BTC: { name: "Bitcoin", base: 68420.50 },
  ETH: { name: "Ethereum", base: 3542.80 },
  SOL: { name: "Solana", base: 142.35 },
};

function randomFluctuation(base, volatility = 0.02) {
  const change = (Math.random() - 0.48) * volatility * base;
  return +(base + change).toFixed(2);
}

function generateChangePercent() {
  return +((Math.random() - 0.45) * 5).toFixed(2);
}

export function getStockPrice(symbol) {
  const stock = STOCKS[symbol];
  if (!stock) return null;
  const price = randomFluctuation(stock.base);
  const change = generateChangePercent();
  return {
    symbol,
    name: stock.name,
    sector: stock.sector,
    price,
    change,
    changeAmount: +(price * change / 100).toFixed(2),
    volume: Math.floor(Math.random() * 50000000) + 1000000,
    high: +(price * 1.015).toFixed(2),
    low: +(price * 0.985).toFixed(2),
    open: +(price * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2),
    marketCap: `${(price * (Math.random() * 5 + 1)).toFixed(0)}B`,
  };
}

export function getAllStocks() {
  return Object.keys(STOCKS).map(getStockPrice);
}

export function getIndices() {
  return Object.entries(INDICES).map(([symbol, data]) => {
    const price = randomFluctuation(data.base, 0.005);
    const change = generateChangePercent();
    return {
      symbol,
      name: data.name,
      price,
      change,
      changeAmount: +(price * change / 100).toFixed(2),
    };
  });
}

export function getCrypto() {
  return Object.entries(CRYPTO).map(([symbol, data]) => {
    const price = randomFluctuation(data.base, 0.03);
    const change = generateChangePercent();
    return {
      symbol,
      name: data.name,
      price,
      change,
      changeAmount: +(price * change / 100).toFixed(2),
    };
  });
}

export function generateChartData(days = 30) {
  let price = 100;
  return Array.from({ length: days }, (_, i) => {
    price = price + (Math.random() - 0.47) * 3;
    return {
      date: new Date(Date.now() - (days - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: +price.toFixed(2),
      volume: Math.floor(Math.random() * 100000000),
    };
  });
}

export function generateMiniChart(points = 20) {
  let val = 50;
  return Array.from({ length: points }, () => {
    val += (Math.random() - 0.47) * 4;
    return { v: +val.toFixed(2) };
  });
}

export { STOCKS, INDICES, CRYPTO };