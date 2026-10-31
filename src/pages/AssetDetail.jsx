import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, TrendingUp, TrendingDown, ShieldAlert, Target, CheckCircle2, X, Bell, BellRing, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { db, getCurrentUser } from '@/api/userData';
import { sendPushNotification } from '@/api/notifications';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import QueryLimitModal from '@/components/ai/QueryLimitModal';
import CandlestickChart from '@/components/markets/CandlestickChart';
import TrekInstantRead from '@/components/trek/TrekInstantRead';
import AssetNewsSection from '@/components/news/AssetNewsSection';
import { SkeletonPrice } from '@/components/ui/SkeletonLoader';
import { formatPrice, formatPercent, validatePrice, validatePercent, safeRender } from '@/lib/dataValidation';
import { useLoadingState, useLastKnownValue } from '@/hooks/useLoadingState';
import { fetchSingleAsset } from '@/api/marketDataClient';
import { deriveSignal } from '@/api/signalEngine';

// ── Name/sector map for known symbols ────────────────────────────────────────
const ASSET_MAP = {
  AAPL:    { name: 'Apple Inc.',        sector: 'Technology' },
  NVDA:    { name: 'NVIDIA Corp',       sector: 'Technology' },
  MSFT:    { name: 'Microsoft Corp',    sector: 'Technology' },
  TSLA:    { name: 'Tesla Inc.',        sector: 'Automotive' },
  BTC:     { name: 'Bitcoin',           sector: 'Crypto' },
  ETH:     { name: 'Ethereum',          sector: 'Crypto' },
  // Europe
  'MC.PA':   { name: 'LVMH Moët Hennessy',  sector: 'Luxury · Euronext Paris' },
  'SAP.DE':  { name: 'SAP SE',              sector: 'Technology · XETRA' },
  'ASML.AS': { name: 'ASML Holding',        sector: 'Semiconductors · Euronext Amsterdam' },
  // Asia
  '7203.T':  { name: 'Toyota Motor Corp',   sector: 'Automotive · Tokyo Stock Exchange' },
  BABA:      { name: 'Alibaba Group',        sector: 'E-Commerce · NYSE (ADR)' },
  // Forex / Commodities
  EURUSD:    { name: 'Euro / US Dollar',     sector: 'Forex' },
  GBPUSD:    { name: 'British Pound / USD',  sector: 'Forex' },
  XAUUSD:    { name: 'Gold / US Dollar',     sector: 'Commodity' },
  XAGUSD:    { name: 'Silver / US Dollar',   sector: 'Commodity' },
};

// Signal + conviction are derived from live price data only (same engine the
// Markets screen uses). Nothing below is stored per symbol.
function convictionFor(confidence) {
  if (confidence == null) return 'LOW';
  if (confidence >= 80) return 'HIGH';
  if (confidence >= 65) return 'MEDIUM';
  return 'LOW';
}

function colorFor(signal) {
  if (signal === 'BUY') return '#22c55e';
  if (signal === 'SELL' || signal === 'AVOID') return '#ef4444';
  if (signal === 'WATCH') return '#F59E0B';
  return '#6b7280';
}

function TradeModal({ asset, action, onClose }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const isBuy = action === 'BUY';
  const color = isBuy ? '#22c55e' : '#ef4444';

  const shares = amount ? (parseFloat(amount) / asset.price).toFixed(4) : '—';

  const handleConfirm = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    const sharesNum = parseFloat((parseFloat(amount) / asset.price).toFixed(4));
    db.tradeLog.create({
      symbol: asset.symbol,
      name: asset.name || asset.symbol,
      action: isBuy ? 'buy' : 'sell',
      shares: sharesNum,
      price: asset.price,
      total: parseFloat(amount),
      status: 'executed',
    }).catch(() => {});
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.3 }}
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{ background: '#111118', border: `1px solid ${color}30` }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', bounce: 0.4 }}
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${color}20`, border: `2px solid ${color}40` }}>
            <CheckCircle2 className="h-8 w-8" style={{ color }} />
          </motion.div>
          <p className="text-[11px] font-black uppercase tracking-[0.15em] mb-1" style={{ color }}>{t('paperTrading.executed')}</p>
          <p className="text-[22px] font-black text-white/95 mb-1">{action} {asset.symbol}</p>
          <p className="text-[13px] text-white/50 mb-2">{shares} {t('paperTrading.shares')} @ ${asset.price.toLocaleString()}</p>
          <p className="text-[11px] text-white/30 mb-6">{t('paperTrading.addedToPortfolio')}</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-sm text-white/60 border border-white/[0.1] hover:border-white/20 transition-colors">
          {t('common.done')}
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#111118', border: `1px solid ${color}25` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.15em] mb-0.5" style={{ color }}>
              {isBuy ? '🟢' : '🔴'} {action} {asset.symbol}
            </p>
            <p className="text-[12px] text-white/40">{t('paperTrading.noRealMoney')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
            <X className="h-4 w-4 text-white/30" />
          </button>
        </div>

        <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-white/40">{t('asset.currentPrice')}</span>
            <span className="font-mono font-bold text-white/85">${asset.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-white/40">{t('paperTrading.shares')}</span>
            <span className="font-mono font-bold text-white/85">{shares}</span>
          </div>
        </div>

        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 block mb-1.5">{t('paperTrading.amount')}</label>
        <input
          type="number"
          placeholder="e.g. 1000"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm font-mono text-white/90 mb-4 outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          autoFocus
        />

        <button
          onClick={handleConfirm}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:opacity-90 disabled:opacity-30"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: '#0A0A0F' }}>
          {t('paperTrading.confirm')} {action}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function AssetDetail() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { symbol: routeSymbol } = useParams();
  const symbol = (routeSymbol || 'NVDA').toUpperCase();
  const meta = ASSET_MAP[symbol] || { name: symbol, sector: '' };
  const { tier } = useSubscriptionStatus();

  const [user, setUser] = useState(null);
  const [tradeAction, setTradeAction] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [quote, setQuote] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState(null);
  const [watchlistEntry, setWatchlistEntry] = useState(null);
  const [trekAnalysis, setTrekAnalysis] = useState(null);
  const [trekLoading, setTrekLoading] = useState(false);
  const [timeframe, setTimeframe] = useState('1D');
  const [aiConfidence, setAiConfidence] = useState(null);
  const prevPriceRef = useRef(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {});
  }, []);

  // Auto-trigger TREK analysis on mount — gated: free users use localStorage counter
  const FREE_TREK_LIMIT = 5;
  const getTrekUsedToday = () => {
    const today = new Date().toDateString();
    if (localStorage.getItem('trek_asset_date') !== today) {
      localStorage.setItem('trek_asset_date', today);
      localStorage.setItem('trek_asset_count', '0');
      return 0;
    }
    return parseInt(localStorage.getItem('trek_asset_count') || '0', 10);
  };

  useEffect(() => {
    if (tier === 'free') {
      const used = getTrekUsedToday();
      if (used >= FREE_TREK_LIMIT) {
        setShowLimitModal(true);
        return;
      }
      // count this asset view
      const today = new Date().toDateString();
      localStorage.setItem('trek_asset_date', today);
      localStorage.setItem('trek_asset_count', String(used + 1));
    }

    setTrekLoading(true);
    const currentPrice = quote?.price;
    const priceLine = currentPrice ? ` Current price: $${currentPrice}.` : '';
    base44.functions.invoke('trekChat', {
      idToken: localStorage.getItem('firebase_auth_token') || undefined,
      messages: [{
        role: 'user',
        content: `Analyze ${symbol} (${meta.name}).${priceLine} Sector: ${meta.sector || 'unknown'}. Give me a full TREK verdict: signal (BUY/SELL/HOLD/WATCH), confidence %, entry zone, target, stop loss, and the key reason. Be specific with price levels.`,
      }],
      marketContext: null,
    }).then(res => {
      const text = res?.data?.reply || null;
      if (text) {
        setTrekAnalysis(text);
        // Parse confidence % from AI response e.g. "TREK confidence: 82%"
        const confMatch = text.match(/confidence[:\s]+(\d{1,3})%/i);
        if (confMatch) setAiConfidence(parseInt(confMatch[1], 10));
      }
    }).catch(() => {}).finally(() => setTrekLoading(false));
  }, [symbol]);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Load watchlist entry for this symbol (to get alert_price)
  useEffect(() => {
    db.watchlist.filter({ symbol }).then(results => {
      if (results?.length > 0) setWatchlistEntry(results[0]);
    }).catch(() => {});
  }, [symbol]);

  // Live quote for this symbol — the only price source on the page.
  useEffect(() => {
    let cancelled = false;
    setLoadingData(true);
    setQuote(null);
    setAiConfidence(null);
    base44.functions.invoke('stockPrices', { symbols: [symbol] })
      .then(res => {
        const q = res?.data?.prices?.[symbol];
        if (cancelled) return;
        const price = Number(q?.price);
        if (!(price > 0)) { setQuote(null); return; }
        const prevClose = Number(q?.prevClose) > 0 ? Number(q.prevClose) : null;
        setQuote({
          price,
          prevClose,
          high: Number(q?.high) > 0 ? Number(q.high) : null,
          low: Number(q?.low) > 0 ? Number(q.low) : null,
          changePct: prevClose
            ? ((price - prevClose) / prevClose) * 100
            : (Number.isFinite(Number(q?.change)) ? Number(q.change) : null),
        });
      })
      .catch(() => { if (!cancelled) setQuote(null); })
      .finally(() => { if (!cancelled) setLoadingData(false); });
    return () => { cancelled = true; };
  }, [symbol]);

  // Price alert check for a watchlisted symbol.
  useEffect(() => {
    const price = quote?.price;
    const target = watchlistEntry?.alert_price;
    if (!price || !target) return;
    const prev = prevPriceRef.current;
    if (prev !== null) {
      const crossed = (prev < target && price >= target) || (prev > target && price <= target);
      if (crossed) {
        const dir = price >= target ? '🟢 Hit target' : '🔴 Hit stop';
        showToast(`${dir}: ${symbol} reached $${target.toLocaleString()}`, price >= target ? 'success' : 'danger');
      }
    }
    prevPriceRef.current = price;
  }, [quote?.price, watchlistEntry]);

  // Signal derived from live price data — the same engine the Markets screen uses.
  const derived = deriveSignal(
    { symbol, sector: meta.sector },
    { price: quote?.price, prevClose: quote?.prevClose, high24h: quote?.high, low24h: quote?.low },
  );
  const displayConfidence = aiConfidence ?? derived.confidence;
  const conviction = convictionFor(displayConfidence);
  const isForexOrCommodity = /^(EUR|GBP|XAU|XAG|USD|JPY|AUD|CAD|NZD|CHF)[A-Z]{3}$/.test(symbol);
  const pricePrefix = isForexOrCommodity ? '' : '$';

  const asset = {
    symbol,
    name: meta.name,
    sector: meta.sector,
    price: quote?.price ?? null,
    change: quote?.changePct ?? null,
    signal: quote ? derived.signal : 'WATCH',
    confidence: derived.confidence,
    conviction,
    color: colorFor(derived.signal),
    reason: derived.reason,
  };
  const isUp = (asset.change ?? 0) >= 0;
  const cvColor = conviction === 'HIGH' ? '#22c55e' : conviction === 'MEDIUM' ? '#F59E0B' : '#6b7280';

  // Page title follows the symbol.
  useEffect(() => {
    document.title = `${symbol} · TREDIO`;
    return () => { document.title = 'TREDIO'; };
  }, [symbol]);

  // Notify once per session when a watchlisted symbol has a live BUY/SELL read.
  useEffect(() => {
    if (!watchlistEntry || !quote) return;
    if (!['BUY', 'SELL'].includes(asset.signal)) return;
    const key = `trek_notif_${symbol}_${asset.signal}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    showToast(`${asset.signal === 'BUY' ? '⚡' : '⚠️'} TREK ${asset.signal} signal for ${symbol} — ${asset.confidence}% confidence`, asset.signal === 'BUY' ? 'success' : 'danger');
    getCurrentUser().then(u => {
      sendPushNotification({ signal: asset.signal, symbol, confidence: asset.confidence, technicalSummary: asset.reason }, u).catch(() => {});
    }).catch(() => {});
  }, [watchlistEntry, quote, symbol]);

  const handleAddToWatchlist = async () => {
    if (watchlistEntry || !asset.price) return;
    const entry = await db.watchlist.create({ symbol, name: asset.name, alert_price: asset.price });
    setWatchlistEntry(entry);
    showToast(`${symbol} added to watchlist. You'll be alerted at $${asset.price.toLocaleString()}.`, 'success');
  };

  return (
    <div className="p-4 lg:p-6 max-w-[700px] mx-auto pb-24">
      <QueryLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-xl flex items-center gap-2 max-w-xs text-center"
            style={{
              background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : toast.type === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.35)' : toast.type === 'danger' ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)'}`,
              color: toast.type === 'success' ? '#22c55e' : toast.type === 'danger' ? '#ef4444' : '#F59E0B',
              backdropFilter: 'blur(12px)',
            }}>
            <BellRing className="h-4 w-4 flex-shrink-0" />
            {toast.msg}
            <button onClick={() => setToast(null)} className="ml-1 opacity-50 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> {t('common.back')}
        </button>
        <button onClick={handleAddToWatchlist}
          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
          style={{
            background: watchlistEntry ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
            color: watchlistEntry ? '#F59E0B' : 'rgba(255,255,255,0.4)',
            border: `1px solid ${watchlistEntry ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`,
          }}>
          {watchlistEntry ? <BellRing className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
          {watchlistEntry ? t('asset.watching', 'Watching') : t('asset.watch', 'Watch')}
        </button>
      </div>

      {/* TREK Instant Read — contains full analysis inline */}
      <TrekInstantRead
        symbol={symbol}
        signal={asset.signal}
        trekText={trekAnalysis}
        trekLoading={trekLoading}
        aiConfidence={aiConfidence}
        conviction={asset.conviction}
      />

      {/* Header - Premium Loading */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black font-mono text-white/95">{safeRender(asset.symbol)}</h1>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{ color: asset.color, background: `${asset.color}15`, border: `1px solid ${asset.color}30` }}>
                {safeRender(asset.signal, 'WATCH')}
              </span>
            </div>
            <p className="text-[12px] text-white/40">{safeRender(asset.name)} · {safeRender(asset.sector)}</p>
          </div>
          <div className="text-right">
            {loadingData && !quote ? (
              <SkeletonPrice />
            ) : quote ? (
              <>
                <div className="flex items-center justify-end gap-2 mb-1">
                  <div className="text-2xl font-black font-mono text-white/95">
                    {pricePrefix}{formatPrice(asset.price, 2)}
                  </div>
                  {tier === 'free' && (
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      {t('asset.delayed15min', 'Delayed 15min')}
                    </span>
                  )}
                  {(tier === 'pro' || tier === 'elite') && (
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      {t('asset.realtime', 'Real-time')}
                    </span>
                  )}
                </div>
                <div className={`flex items-center justify-end gap-1 text-[13px] font-bold font-mono ${isUp ? 'text-chart-3' : 'text-destructive'}`}>
                  {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {asset.change === null ? '—' : formatPercent(asset.change, 2)}
                </div>
              </>
            ) : (
              <div className="text-[12px] font-bold text-white/30">
                {t('asset.priceUnavailable', 'Price unavailable')}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.07 }}
        className="rounded-xl p-4 mb-4"
        style={{ background: 'rgba(8,16,36,0.55)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1px solid rgba(100,220,255,0.09)' }}>
        {/* Timeframe Selector */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{t('asset.chart', 'Price Chart')}</span>
          <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.06]">
            {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-primary/15 text-primary border border-primary/25'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <CandlestickChart symbol={symbol} timeframe={timeframe} />
      </motion.div>

      {/* BUY / SELL buttons */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="mb-4">
        {user?.alpaca_connected ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button onClick={() => setTradeAction('BUY')}
                className="py-4 rounded-2xl font-black text-sm tracking-wider transition-all hover:scale-[1.02] tap-feedback"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#0A0A0F', boxShadow: '0 4px 20px rgba(34,197,94,0.2)' }}>
                🟢 {t('asset.buy')}
              </button>
              <button onClick={() => setTradeAction('SELL')}
                className="py-4 rounded-2xl font-black text-sm tracking-wider transition-all hover:scale-[1.02] tap-feedback"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', boxShadow: '0 4px 20px rgba(239,68,68,0.2)' }}>
                🔴 {t('asset.sell')}
              </button>
            </div>
            <p className="text-[10px] text-white/30 text-center">{t('asset.viaAlpaca', 'via Alpaca Securities · Live orders')}</p>
          </>
        ) : (
          <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-sm font-bold text-white/60 mb-1">{t('asset.connectAlpacaDesc', 'Connect your Alpaca account to place live trades')}</p>
            <p className="text-[11px] text-white/30 mb-3">{t('asset.alpacaNote', 'Your Alpaca account executes orders. TREDIO never holds funds.')}</p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/alpaca-connect')}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
                {t('asset.connectAlpaca', 'Connect Alpaca →')}
              </button>
              <button
                onClick={() => setTradeAction('BUY')}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-white/[0.1] text-white/50 hover:border-white/20 transition-colors">
                {t('asset.tryPaperTrading', 'Try paper trading →')}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <p className="text-[10px] text-white/20 text-center mb-6">{t('paperTrading.noRealMoney')}</p>

      {/* Key stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: t('trek.signal'), value: asset.signal, color: asset.color },
          { label: t('trek.confidence'), value: `${displayConfidence}%`, color: 'rgba(255,255,255,0.7)' },
          { label: t('trek.conviction'), value: asset.conviction, color: cvColor },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'rgba(8,16,36,0.55)', border: '1px solid rgba(100,220,255,0.09)' }}>
            <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-[13px] font-black font-mono" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Asset-specific news */}
      <AssetNewsSection symbol={symbol} />

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeAction && (
          <TradeModal asset={asset} action={tradeAction} onClose={() => setTradeAction(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}