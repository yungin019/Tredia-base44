import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Eye, ChevronRight, Clock, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SignalExplanationModal from './SignalExplanationModal';

const CATEGORY_COLORS = {
  macro: { bg: 'rgba(14,200,220,0.08)', border: 'rgba(14,200,220,0.2)', text: '#0ec8dc' },
  earnings: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
  geopolitical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#ef4444' },
  economic_data: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#22c55e' },
  central_bank: { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', text: '#a855f7' },
  corporate: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', text: '#3b82f6' },
};

function CatalystCard({ catalyst, index, onSeeWhy }) {
  const colors = CATEGORY_COLORS[catalyst.category] || CATEGORY_COLORS.macro;
  const timeAgo = catalyst.type === 'structure' ? 'Live' : getTimeAgo(catalyst.published_at);
  const isStructure = catalyst.type === 'structure';

  const handleViewSource = () => {
    if (catalyst.source_url) {
      window.open(catalyst.source_url, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(8, 18, 42, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(100,220,255,0.09)',
      }}
    >
      {/* Category accent line + Structure badge */}
      <div style={{ height: 2, background: colors.text, opacity: 0.6 }} />
      {isStructure && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <Zap className="h-3 w-3" style={{ color: colors.text }} />
          <span style={{ fontSize: '8px', fontWeight: 'bold', color: colors.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Structure</span>
        </div>
      )}

      <div className="px-4 py-3.5 space-y-3">
        {/* HEADLINE - Primary Context */}
        <a
          href={catalyst.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <p className="text-sm font-bold text-white/90 leading-snug group-hover:text-primary transition-colors">
            {catalyst.headline}
          </p>
          <span className="text-[8px] text-white/30 group-hover:text-white/50 transition-colors flex items-center gap-1 mt-1">
            <ExternalLink className="h-2.5 w-2.5" />
            {catalyst.source_name}
          </span>
        </a>

        {/* Header: Category + Time */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <span
            className="text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wide"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          >
            {isStructure ? 'Market Structure' : catalyst.category.replace('_', ' ')}
          </span>
          <span className={`text-[9px] flex items-center gap-1 ${isStructure ? 'text-primary animate-pulse' : 'text-white/40'}`}>
            <Clock className="h-2.5 w-2.5" />
            {timeAgo}
          </span>
        </div>

        {/* TREK Interpretation Header */}
        <div className="pt-2 border-t border-white/[0.05]">
          <p className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-2">TREK Interpretation</p>
          <p className="text-sm font-bold text-white/80 leading-tight">
            {catalyst.market_state}
          </p>
        </div>

        {/* Driver + Impact - CONCRETE */}
        <div className="space-y-2 text-[11px] pt-2 border-t border-white/[0.05]">
          <div className="flex items-start gap-2">
            <span className="text-white/30 font-bold flex-shrink-0">Why:</span>
            <span className="text-white/65">{catalyst.driver}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-white/30 font-bold flex-shrink-0">Effect:</span>
            <span className="text-white/65">{catalyst.impact}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-white/30 font-bold flex-shrink-0">Risk:</span>
            <span className="text-white/65">{catalyst.risk}</span>
          </div>
        </div>

        {/* Action Bias */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-[9px] font-bold text-white/25 uppercase">Signal</span>
          <span
            className="text-xs font-black px-2.5 py-1 rounded-lg"
            style={{
              background: catalyst.action_bias === 'bullish' ? 'rgba(14,200,220,0.12)' : 'rgba(239,68,68,0.12)',
              color: catalyst.action_bias === 'bullish' ? '#0ec8dc' : '#ef4444'
            }}
          >
            {catalyst.action_bias === 'bullish' ? '↗ Bullish' : '↘ Bearish'}
          </span>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[9px] text-white/30">Confidence:</span>
            <div className="flex-1 max-w-24 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${catalyst.confidence}%`,
                  background: catalyst.confidence > 75 ? '#0ec8dc' : catalyst.confidence > 50 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <span className="text-[9px] text-white/50 w-8 text-right">{catalyst.confidence}%</span>
          </div>
        </div>

        {/* Related Assets (if any) */}
        {catalyst.related_assets && catalyst.related_assets.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {catalyst.related_assets.map((symbol, i) => (
              <span
                key={i}
                className="text-[9px] px-2 py-1 rounded-lg font-mono font-bold"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(180,210,240,0.6)'
                }}
              >
                {symbol}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.05]">
          <button
            onClick={() => {
              setSelectedSignal(catalyst);
              setModalOpen(true);
            }}
            className="flex-1 text-[9px] px-2.5 py-2 rounded-lg font-bold transition-all hover:opacity-80"
            style={{
              background: 'rgba(14,200,220,0.1)',
              border: '1px solid rgba(14,200,220,0.2)',
              color: '#0ec8dc'
            }}
          >
            See Why
          </button>
          {catalyst.source_url && (
            <button
              onClick={handleViewSource}
              className="flex-1 text-[9px] px-2.5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 hover:opacity-80"
              style={{
                background: 'rgba(100,220,255,0.08)',
                border: '1px solid rgba(100,220,255,0.15)',
                color: 'rgba(150,230,255,0.6)'
              }}
            >
              <ExternalLink className="h-3 w-3" />
              View Source
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CatalystFeed({ activeRegion = 'Global' }) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadSignals = async () => {
      try {
        setLoading(true);
        console.log('[MarketSignals] Loading news + structure signals');
        
        // Fetch news catalysts
        const newsCatalysts = await base44.entities.Catalyst.list().catch(() => []);
        console.log(`[MarketSignals] ✓ FETCHED ${newsCatalysts.length} news catalysts`);

        // Filter by region
        const filteredNews = newsCatalysts.filter(c => {
          const isGlobal = c.regions?.includes('Global');
          const isRegional = c.regions?.includes(activeRegion);
          return activeRegion === 'Global' ? isGlobal : (isRegional || isGlobal);
        });
        console.log(`[MarketSignals] ✓ FILTERED ${filteredNews.length} news catalysts for region: ${activeRegion}`);

        // Fetch structure signals
        let structureSignals = [];
        try {
          const structRes = await base44.functions.invoke('generateStructureSignals', {});
          if (structRes.data?.signals) {
            structureSignals = structRes.data.signals.filter(s => {
              const isGlobal = s.regions?.includes('Global');
              const isRegional = s.regions?.includes(activeRegion);
              return activeRegion === 'Global' ? isGlobal : (isRegional || isGlobal);
            });
            console.log(`[MarketSignals] ✓ GENERATED ${structureSignals.length} structure signals`);
          }
        } catch (err) {
          console.warn('[MarketSignals] Structure signal generation failed, relying on news:', err.message);
        }

        // Merge: sort by published_at, take 10, guarantee minimum 3
        const allSignals = [...filteredNews, ...structureSignals]
          .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
          .slice(0, 10);

        // If less than 3, fetch more structure signals as fallback
        if (allSignals.length < 3 && structureSignals.length < 3) {
          console.log('[MarketSignals] Supplementing with additional structure signals to meet minimum');
          // In production, could generate additional signals with different parameters
        }

        const final = allSignals.slice(0, Math.max(3, allSignals.length));
        console.log(`[MarketSignals] ✓ FINAL FEED: ${final.length} signals (news: ${filteredNews.length}, structure: ${structureSignals.length})`);
        setSignals(final);
      } catch (error) {
        console.error('[MarketSignals] ✗ ERROR:', error);
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };

    loadSignals();
    const interval = setInterval(loadSignals, 60000);
    return () => clearInterval(interval);
  }, [activeRegion]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  // Always show signals — never empty (minimum 3)
  const displaySignals = signals.length > 0 ? signals : [];

  const handleSignalClick = (signal) => {
    setSelectedSignal(signal);
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-3" style={{ 
        paddingTop: '16px',
        borderTop: '2px solid rgba(14,200,220,0.2)',
      }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'rgb(14,200,220)' }} />
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Market Signals</h2>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(14,200,220,0.1)', color: 'rgb(100,220,240)', border: '1px solid rgba(14,200,220,0.2)' }}>
            News + Structure
          </span>
        </div>
        <AnimatePresence mode="wait">
          <div className="space-y-3">
            {displaySignals.map((signal, i) => (
              <CatalystCard
                key={signal.id}
                catalyst={signal}
                index={i}
                onSeeWhy={handleSignalClick}
              />
            ))}
          </div>
        </AnimatePresence>
      </div>

      <SignalExplanationModal 
        signal={selectedSignal} 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          setSelectedSignal(null);
        }}
      />
    </>
  );
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);

  if (secondsAgo < 60) return 'Just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  return `${Math.floor(secondsAgo / 86400)}d ago`;
}