/**
 * Paper book maths — everything shown on Paper Trading is derived from the
 * user's real trade log. No sample positions, no placeholder stats.
 *
 * A trade row is { symbol, action: 'buy'|'sell', shares, price, created_date }.
 */

export function buildPaperBook(trades = []) {
  const rows = [...trades]
    .filter(t => t && t.symbol && Number(t.shares) > 0 && Number(t.price) > 0)
    .sort((a, b) => String(a.created_date || '').localeCompare(String(b.created_date || '')));

  const open = new Map(); // symbol -> { shares, avgCost }
  const closed = [];      // realized results of each sell, in order

  for (const t of rows) {
    const symbol = String(t.symbol).toUpperCase();
    const qty = Number(t.shares);
    const price = Number(t.price);
    const pos = open.get(symbol) || { shares: 0, avgCost: 0 };

    if (String(t.action).toLowerCase() === 'buy') {
      const newShares = pos.shares + qty;
      const newCost = (pos.shares * pos.avgCost + qty * price) / newShares;
      open.set(symbol, { shares: newShares, avgCost: newCost });
    } else {
      const soldQty = Math.min(qty, pos.shares);
      if (soldQty > 0) {
        closed.push({ symbol, pnl: (price - pos.avgCost) * soldQty, qty: soldQty });
      }
      const remaining = pos.shares - qty;
      if (remaining > 0) open.set(symbol, { shares: remaining, avgCost: pos.avgCost });
      else open.delete(symbol);
    }
  }

  const wins = closed.filter(c => c.pnl > 0);
  const losses = closed.filter(c => c.pnl < 0);
  const realizedPnl = closed.reduce((sum, c) => sum + c.pnl, 0);
  const bestTrade = closed.length > 0 ? Math.max(...closed.map(c => c.pnl)) : null;

  // Current win run, counting back from the most recent closed trade.
  let streak = 0;
  for (let i = closed.length - 1; i >= 0; i--) {
    if (closed[i].pnl > 0) streak += 1;
    else break;
  }

  return {
    positions: [...open.entries()].map(([symbol, pos]) => ({ symbol, ...pos })),
    tradeCount: rows.length,
    closedCount: closed.length,
    wins: wins.length,
    losses: losses.length,
    winRate: closed.length > 0 ? (wins.length / closed.length) * 100 : null,
    realizedPnl,
    bestTrade,
    streak,
  };
}

/** Live-price enrichment for the open positions. */
export function valuePositions(positions = [], quotes = {}) {
  let marketValue = 0;
  let costValue = 0;
  const rows = positions.map(p => {
    const quote = quotes[p.symbol];
    const livePrice = Number(quote?.price) > 0 ? Number(quote.price) : null;
    const cost = p.shares * p.avgCost;
    const value = livePrice !== null ? p.shares * livePrice : null;
    costValue += cost;
    if (value !== null) marketValue += value;
    return {
      ...p,
      livePrice,
      cost,
      value,
      pnl: value !== null ? value - cost : null,
      pnlPct: value !== null && cost > 0 ? ((value - cost) / cost) * 100 : null,
    };
  });
  return { rows, marketValue, costValue };
}

export const TRADER_LEVELS = [
  { level: 1, minWin: 0, nameKey: 'paperTrading.rookieLevel', fallback: 'Rookie', color: '#6b7280' },
  { level: 2, minWin: 50, nameKey: 'paperTrading.analystLevel', fallback: 'Analyst', color: '#60a5fa' },
  { level: 3, minWin: 60, nameKey: 'paperTrading.traderLevel', fallback: 'Trader', color: '#22c55e' },
  { level: 4, minWin: 70, nameKey: 'paperTrading.proTraderLevel', fallback: 'Pro Trader', color: '#F59E0B' },
  { level: 5, minWin: 80, nameKey: 'paperTrading.eliteTraderLevel', fallback: 'Elite Trader', color: '#a78bfa' },
];

export function levelFor(winRate) {
  if (winRate === null || winRate === undefined) return { current: null, next: null, progress: 0 };
  const current = [...TRADER_LEVELS].reverse().find(l => winRate >= l.minWin) || TRADER_LEVELS[0];
  const next = TRADER_LEVELS.find(l => l.minWin > winRate) || null;
  const progress = next ? ((winRate - current.minWin) / (next.minWin - current.minWin)) * 100 : 100;
  return { current, next, progress };
}