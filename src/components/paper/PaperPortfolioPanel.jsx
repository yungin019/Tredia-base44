import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownRight, Star, Trophy, ShieldCheck, Target, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '@/api/userData';
import { invokeFunction } from '@/api/functionsClient';
import { buildPaperBook, valuePositions, levelFor } from '@/lib/paperPortfolio';

const money = (v) => `${v >= 0 ? '+' : '-'}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Paper trading dashboard — stats, level and open positions from the user's own
// simulated trades, valued with live quotes. No invented figures.
export default function PaperPortfolioPanel() {
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState({});

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['tradelog'],
    queryFn: () => db.tradeLog.list('-created_date', 200),
  });

  const book = buildPaperBook(Array.isArray(trades) ? trades : []);
  const { rows: positionRows, marketValue, costValue } = valuePositions(book.positions, quotes);
  const level = levelFor(book.winRate);

  const symbolsKey = book.positions.map(p => p.symbol).sort().join(',');
  useEffect(() => {
    if (!symbolsKey) { setQuotes({}); return; }
    let cancelled = false;
    invokeFunction('stockPrices', { symbols: symbolsKey.split(',') })
      .then(res => { if (!cancelled) setQuotes(res?.prices || {}); })
      .catch(() => { if (!cancelled) setQuotes({}); });
    return () => { cancelled = true; };
  }, [symbolsKey]);

  const openPnL = positionRows.reduce((sum, p) => sum + (p.pnl ?? 0), 0);
  const priced = positionRows.filter(p => p.value !== null);

  const statCards = [
    { label: t('paperTrading.trades', 'Trades'), value: String(book.tradeCount), color: '#60a5fa', icon: ShieldCheck },
    { label: t('paperTrading.winRate', 'Win Rate'), value: book.winRate === null ? '—' : `${book.winRate.toFixed(1)}%`, color: '#22c55e', icon: Target },
    { label: t('paperTrading.bestTrade', 'Best Trade'), value: book.bestTrade === null ? '—' : money(book.bestTrade), color: '#F59E0B', icon: Trophy },
    { label: t('paperTrading.streak', 'Streak'), value: book.streak > 0 ? `${book.streak}W` : '—', color: '#a78bfa', icon: Star },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-[86px] rounded-xl border border-white/[0.07] bg-[#111118] animate-pulse" />
        ))}
      </div>
    );
  }

  if (book.tradeCount === 0) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-10 text-center">
        <ClipboardList className="h-10 w-10 text-white/10 mx-auto mb-3" />
        <p className="text-[13px] font-bold text-white/45">{t('paperTrading.emptyTitle', 'No paper trades yet')}</p>
        <p className="text-[11px] text-white/25 mt-1">
          {t('paperTrading.emptyHint', 'Your positions, P&L and win rate appear here after your first simulated trade above.')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="rounded-xl border border-white/[0.07] bg-[#111118] p-4" style={{ borderColor: `${s.color}25` }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="h-3 w-3" style={{ color: s.color }} />
              <div className="text-[9px] text-white/30 font-medium uppercase tracking-[0.1em]">{s.label}</div>
            </div>
            <div className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {level.current && (
        <div className="rounded-xl p-4 flex items-center gap-4 flex-wrap" style={{ background: '#111118', border: `1px solid ${level.current.color}40` }}>
          <div className="flex flex-col items-center justify-center rounded-xl" style={{ width: 48, height: 48, background: `${level.current.color}15`, border: `2px solid ${level.current.color}40` }}>
            <Star style={{ width: 16, height: 16, color: level.current.color }} />
            <span style={{ fontSize: 8, fontWeight: 900, color: level.current.color }}>{t('paperTrading.lvl', 'LVL')} {level.current.level}</span>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div style={{ fontSize: 15, fontWeight: 900, color: 'rgba(255,255,255,0.92)' }}>{t(level.current.nameKey, level.current.fallback)}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
              {level.next
                ? t('paperTrading.winRateToReach', 'Win {{value}}% more to reach {{level}}', { value: (level.next.minWin - book.winRate).toFixed(1), level: t(level.next.nameKey, level.next.fallback) })
                : t('paperTrading.maxLevelReached', 'Max level reached')}
            </div>
            <div style={{ width: '100%', maxWidth: 200, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(0, Math.min(100, level.progress))}%`, height: '100%', background: level.current.color, borderRadius: 99 }} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-white/30 uppercase tracking-wider">{t('paperTrading.realized', 'Realized')}</div>
            <div className="text-[14px] font-black font-mono" style={{ color: book.realizedPnl >= 0 ? '#22c55e' : '#ef4444' }}>{money(book.realizedPnl)}</div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white/80">{t('portfolio.holdings', 'Open Positions')} ({positionRows.length})</h3>
          {priced.length > 0 && (
            <span className="text-[11px] font-mono font-bold" style={{ color: openPnL >= 0 ? '#22c55e' : '#ef4444' }}>
              {money(openPnL)} · {marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} {t('paperTrading.value', 'value')}
            </span>
          )}
        </div>
        {positionRows.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[12px] text-white/25">{t('paperTrading.noOpenPositions', 'No open positions')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {[t('markets.symbol', 'Symbol'), t('paperTrading.shares', 'Shares'), t('portfolio.avgCost', 'Avg Cost'), t('portfolio.currentPrice', 'Price'), t('paperTrading.pnlDollars', 'P&L'), t('paperTrading.pnlPercent', '%')].map((h, i) => (
                    <th key={h} className={`${i === 0 ? 'text-left px-5' : 'text-right px-4'} py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positionRows.map(p => (
                  <tr key={p.symbol} className="border-b border-white/[0.04]">
                    <td className="px-5 py-3 font-mono font-bold text-white/85">{p.symbol}</td>
                    <td className="px-4 py-3 text-right font-mono text-white/60">{p.shares}</td>
                    <td className="px-4 py-3 text-right font-mono text-white/60">${p.avgCost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white/85">
                      {p.livePrice === null ? <span className="text-white/25">—</span> : `$${p.livePrice.toFixed(2)}`}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${p.pnl === null ? 'text-white/25' : p.pnl >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                      {p.pnl === null ? '—' : (
                        <span className="inline-flex items-center gap-0.5">
                          {p.pnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          ${Math.abs(p.pnl).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono text-xs font-bold ${p.pnlPct === null ? 'text-white/25' : p.pnlPct >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                      {p.pnlPct === null ? '—' : `${p.pnlPct >= 0 ? '+' : ''}${p.pnlPct.toFixed(2)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[10px] text-white/20 text-center">
        {t('paperTrading.derivedNote', 'All figures are calculated from your own paper trades and live quotes. Cost basis:')} ${costValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}