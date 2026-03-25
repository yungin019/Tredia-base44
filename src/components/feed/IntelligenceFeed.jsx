import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FeedReactionBlock from './FeedReactionBlock';

// ── VALIDATION: reject vague signals ─────────────────────────────────────────
const BANNED = ['sentiment', 'narrative', 'uncertain'];
function isValid(r) {
  const t = [r.market_state, r.driver, r.impact, r.risk].join(' ').toLowerCase();
  return !BANNED.some(p => t.includes(p)) && /\d/.test(t);
}

// ── NORMALIZE: map Catalyst entity fields to FeedReactionBlock shape ─────────
function normalizeCatalyst(c) {
  return {
    id: c.id,
    marketState: c.market_state,
    driver: c.driver,
    impactText: c.impact,
    riskInvalidation: c.risk,
    watch_next: c.watch_next,
    relatedAssets: (c.related_assets || []).map(s => ({ symbol: s, direction: 'up' })),
    regions: c.regions || ['Global'],
    timing: c.stage === 'early_warning' ? 'Live' : c.stage === 'confirmed_catalyst' ? 'Developing' : 'Follow-up',
    source_name: c.source_name || 'Market Intelligence',
    published_at: c.published_at || c.created_date,
    direction: c.action_bias,
    importance: c.confidence ? Math.round(c.confidence / 10) : 5,
    sectors: c.category ? [c.category] : [],
    action_bias: c.action_bias,
    confidence: c.confidence,
    risk: c.risk,
    related_assets: c.related_assets || [],
    headline: c.headline,
    source_url: c.source_url,
    trade_setup: c.trade_setup,
  };
}

// ── NORMALIZE: map structure signal to FeedReactionBlock shape ───────────────
function normalizeStructure(s) {
  return {
    ...s,
    id: s.id || `struct-${Date.now()}`,
    marketState: s.market_state || s.marketState,
    impactText: s.impact || s.impactText,
    riskInvalidation: s.risk || s.riskInvalidation,
    timing: s.timing || 'Live',
    source_name: s.source_name || 'Market Structure',
    published_at: s.published_at || new Date().toISOString(),
    importance: s.confidence ? Math.round(s.confidence / 10) : 6,
    direction: s.action_bias,
    type: 'structure',
  };
}

// ── RANKING ───────────────────────────────────────────────────────────────────
function filterAndRank(items, region) {
  return items
    .filter(r => r.regions?.includes(region) || r.regions?.includes('Global'))
    .sort((a, b) => {
      if (b.importance !== a.importance) return b.importance - a.importance;
      const timingScore = { 'Live': 3, 'Developing': 2, 'Follow-up': 1 };
      return (timingScore[b.timing] || 0) - (timingScore[a.timing] || 0);
    });
}

// ── WATCH ROW ────────────────────────────────────────────────────────────────
function WatchRow({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-2.5"
    >
      <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${item.urgency === 'high' ? 'bg-gold animate-pulse' : 'bg-white/20'}`} />
      <span className="text-xs text-white/60">{item.label}</span>
      {item.urgency === 'high' && (
        <span className="text-[9px] font-bold text-gold/70 bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded-full ml-auto">Watch</span>
      )}
    </motion.div>
  );
}

// ── SEPARATOR ────────────────────────────────────────────────────────────────
function FeedSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-white/[0.05]" />
      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.12em] px-2">{label}</span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
function EmptyState({ region }) {
  return (
    <div className="rounded-xl px-5 py-8 text-center" style={{ background: 'rgba(8,16,36,0.55)', border: '1px solid rgba(100,220,255,0.07)' }}>
      <p className="text-white/30 text-sm font-medium">No signals for {region} right now</p>
      <p className="text-white/15 text-xs mt-1">TREK is monitoring — check back soon</p>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function IntelligenceFeed({ activeRegion }) {
  const [reactions, setReactions] = useState([]);
  const [watchItems, setWatchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async (region) => {
    setLoading(true);
    setError(null);

    // Fetch Catalyst entity records for this region
    const regionFilter = region === 'Global'
      ? {} // Global: fetch all, then filter
      : {};

    const [catalysts, structureRes] = await Promise.allSettled([
      base44.entities.Catalyst.list('-published_at', 30),
      base44.functions.invoke('generateStructureSignals', { region }),
    ]);

    const rawCatalysts = catalysts.status === 'fulfilled' ? catalysts.value : [];
    const structureSignals = structureRes.status === 'fulfilled'
      ? (structureRes.value?.data?.signals || structureRes.value?.signals || [])
      : [];

    // Normalize + validate
    const normalizedCatalysts = rawCatalysts
      .map(normalizeCatalyst)
      .filter(isValid);

    const normalizedStructure = structureSignals
      .map(normalizeStructure)
      .filter(isValid);

    const combined = [...normalizedStructure, ...normalizedCatalysts];
    const ranked = filterAndRank(combined, region).slice(0, 5);

    // Build watch items from top signals' watch_next fields
    const watchSet = [];
    ranked.slice(0, 3).forEach(r => {
      if (r.watch_next) {
        // Split watch_next by period/comma into individual items
        const parts = r.watch_next.split(/[.,]/).map(s => s.trim()).filter(Boolean).slice(0, 2);
        parts.forEach(p => {
          if (p.length > 5 && watchSet.length < 4) {
            watchSet.push({ label: p, urgency: watchSet.length === 0 ? 'high' : 'medium' });
          }
        });
      }
    });

    setReactions(ranked);
    setWatchItems(watchSet.slice(0, 3));
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    load(activeRegion);
    const interval = setInterval(() => load(activeRegion), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeRegion]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!loading && reactions.length === 0) {
    return <EmptyState region={activeRegion} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeRegion}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="space-y-3"
      >
        {/* ── HEADER ROW ──────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Live Signals · {activeRegion}</span>
          </div>
          {lastUpdated && (
            <span className="text-[9px] text-white/20 flex items-center gap-1">
              <RefreshCw className="h-2.5 w-2.5" />
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* ── TOP REACTIONS ────────────────────────────────────── */}
        {reactions.slice(0, 2).map((r, i) => (
          <FeedReactionBlock key={r.id} reaction={r} index={i} />
        ))}

        {/* ── WATCH LAYER (only if we have items) ──────────────── */}
        {watchItems.length > 0 && (
          <>
            <FeedSeparator label="Trek is watching" />
            <div className="rounded-xl px-4 py-3.5 space-y-2.5" style={{
              background: 'rgba(3, 7, 18, 0.82)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(100,220,255,0.07)',
            }}>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-3.5 w-3.5 text-primary/50" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">On the radar</span>
              </div>
              {watchItems.map((item, i) => (
                <WatchRow key={i} item={item} index={i} />
              ))}
            </div>
          </>
        )}

        {/* ── REMAINING REACTIONS ──────────────────────────────── */}
        {reactions.slice(2).length > 0 && <FeedSeparator label="More context" />}
        {reactions.slice(2).map((r, i) => (
          <FeedReactionBlock key={r.id} reaction={r} index={i + 2} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}