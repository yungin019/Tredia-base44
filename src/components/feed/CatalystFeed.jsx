import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Eye, ChevronRight, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

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
  const timeAgo = getTimeAgo(catalyst.published_at);

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
      {/* Category accent line */}
      <div style={{ height: 2, background: colors.text, opacity: 0.6 }} />

      <div className="px-4 py-3.5 space-y-3">
        {/* Header: Category + Time */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wide"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text
            }}
          >
            {catalyst.category.replace('_', ' ')}
          </span>
          <span className="text-[9px] text-white/40 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo}
          </span>
        </div>

        {/* Signal: Market State */}
        <div>
          <p className="text-sm font-bold text-white leading-tight">
            {catalyst.market_state}
          </p>
        </div>

        {/* Driver + Impact - CONCRETE */}
        <div className="space-y-2 text-[11px]">
          <div className="flex items-start gap-2">
            <span className="text-white/30 font-bold flex-shrink-0">Why:</span>
            <span className="text-white/65">{catalyst.driver || 'Market driver'}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-white/30 font-bold flex-shrink-0">Effect:</span>
            <span className="text-white/65">{catalyst.impact || 'Market impact'}</span>
          </div>
        </div>

        {/* Action Bias + Risk - DECISION CLEAR */}
        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-white/25 uppercase">Bias</span>
            <span
              className="text-xs font-black px-2 py-1 rounded-lg"
              style={{
                background: catalyst.action_bias === 'bullish' ? 'rgba(14,200,220,0.12)' : catalyst.action_bias === 'bearish' ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
                color: catalyst.action_bias === 'bullish' ? '#0ec8dc' : catalyst.action_bias === 'bearish' ? '#ef4444' : 'rgba(255,255,255,0.6)'
              }}
            >
              {catalyst.action_bias === 'bullish' ? '↗ Up' : catalyst.action_bias === 'bearish' ? '↘ Down' : '→ Wait'}
            </span>
          </div>
          <div className="flex items-start gap-1.5 flex-1 min-w-0">
            <span className="text-[9px] text-white/30 flex-shrink-0 mt-0.5">⚠</span>
            <span className="text-[9px] text-white/45">{catalyst.risk || 'Monitor'}</span>
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

        {/* Metadata & Confidence */}
        <div className="space-y-2 pt-2 border-t border-white/[0.05]">
          {/* Source metadata */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-white/25 uppercase tracking-wider">Source: {catalyst.source_name}</span>
          </div>

          {/* Confidence + Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-white/30">Confidence:</span>
              <div className="w-12 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${catalyst.confidence}%`,
                    background: catalyst.confidence > 75 ? '#22c55e' : catalyst.confidence > 50 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <span className="text-[9px] text-white/50">{catalyst.confidence}%</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSeeWhy?.(catalyst)}
                className="text-[9px] px-2.5 py-1.5 rounded-lg font-bold transition-all"
                style={{
                  background: 'rgba(14,200,220,0.1)',
                  border: '1px solid rgba(14,200,220,0.2)',
                  color: '#0ec8dc'
                }}
              >
                <Eye className="h-3 w-3" />
              </button>
              <button
                onClick={handleViewSource}
                className="text-[9px] px-2.5 py-1.5 rounded-lg font-bold transition-all"
                style={{
                  background: 'rgba(100,220,255,0.08)',
                  border: '1px solid rgba(100,220,255,0.15)',
                  color: 'rgba(150,230,255,0.6)'
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CatalystFeed({ activeRegion = 'Global', onSeeWhy }) {
  const [catalysts, setCatalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const loadCatalysts = async () => {
      try {
        setLoading(true);
        console.log('[CatalystFeed] ✓ COMPONENT MOUNTED');
        
        // Fetch ALL catalysts — NO FILTERING
        const allCatalysts = await base44.entities.Catalyst.list();
        console.log(`[CatalystFeed] ✓ FETCHED ${allCatalysts.length} catalysts from DB`);
        console.log('[CatalystFeed] Raw data:', allCatalysts);

        // Debug info
        const regionBreakdown = {};
        allCatalysts.forEach(c => {
          c.regions?.forEach(r => {
            regionBreakdown[r] = (regionBreakdown[r] || 0) + 1;
          });
        });
        console.log('[CatalystFeed] Region breakdown:', regionBreakdown);
        setDebugInfo({
          totalInDb: allCatalysts.length,
          regionBreakdown,
          activeRegion,
          allCatalystsRaw: allCatalysts
        });

        // Region filtering: Global always included, regional prioritized
        let filtered = allCatalysts.filter(c => {
          const isGlobal = c.regions?.includes('Global');
          const isRegional = c.regions?.includes(activeRegion);
          return activeRegion === 'Global' ? isGlobal : (isRegional || isGlobal);
        });
        console.log(`[CatalystFeed] ✓ FILTERED ${filtered.length} catalysts for region: ${activeRegion}`);

        const sorted = filtered.sort((a, b) => 
          new Date(b.published_at) - new Date(a.published_at)
        );
        const final = sorted.slice(0, 10);
        console.log(`[CatalystFeed] ✓ RENDERING ${final.length} catalysts`);
        setCatalysts(final);
      } catch (error) {
        console.error('[CatalystFeed] ✗ ERROR:', error);
        setCatalysts([]);
      } finally {
        setLoading(false);
      }
    };

    loadCatalysts();
    const interval = setInterval(loadCatalysts, 60000);
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

  if (catalysts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-xs text-white/30">No breaking catalysts at the moment.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3" style={{ 
      paddingTop: '16px',
      borderTop: '2px solid rgba(14,200,220,0.2)',
    }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'rgb(14,200,220)' }} />
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Breaking Market Catalysts</h2>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(14,200,220,0.1)', color: 'rgb(100,220,240)', border: '1px solid rgba(14,200,220,0.2)' }}>
          Real-time
        </span>
      </div>
      <AnimatePresence mode="wait">
        <div className="space-y-3">
          {catalysts.map((catalyst, i) => (
            <CatalystCard
              key={catalyst.id}
              catalyst={catalyst}
              index={i}
              onSeeWhy={onSeeWhy}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
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