// Decorative sparkline only — no prices, no numbers.
// Every real quote in the app comes from the stockPrices/marketData pipeline.
export function generateMiniChart(points = 20) {
  let val = 50;
  return Array.from({ length: points }, () => {
    val += (Math.random() - 0.47) * 4;
    return { v: +val.toFixed(2) };
  });
}