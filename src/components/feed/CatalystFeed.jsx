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

        {/* Driver + Impact (compressed) */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <span className="text-[9px] text-white/20 mt-0.5 flex-shrink-0">→</span>
            <span className="text-[10px] text-white/50">{catalyst.driver}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[9px] text-white/20 mt-0.5 flex-shrink-0">→</span>
            <span className="text-[10px] text-white/50">{catalyst.impact}</span>
          </div>
        </div>

        {/* Action Bias + Risk */}
        <div className="flex items-start gap-3 pt-1">
          <div className="flex items-start gap-2">
            <span
              className="text-xs font-black px-2 py-1 rounded"
              style={{
                background: catalyst.action_bias === 'bullish' ? 'rgba(14,200,220,0.12)' : 'rgba(239,68,68,0.12)',
                color: catalyst.action_bias === 'bullish' ? '#0ec8dc' : '#ef4444'
              }}
            >
              {catalyst.action_bias.toUpperCase()}
            </span>
          </div>
          <div className="flex items-start gap-2 flex-1">
            <span className="text-[9px] text-white/20 flex-shrink-0">⚠</span>
            <span className="text-[10px] text-white/50">{catalyst.risk}</span>
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

        {/* Confidence + Source Links */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
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
    </motion.div>
  );
}

export default function CatalystFeed({ activeRegion = 'Global', onSeeWhy }) {
  const [catalysts, setCatalysts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalysts = async () => {
      try {
        setLoading(true);
        
        // Fetch catalysts from database
        let query = { stage: 'confirmed_catalyst' };
        
        // Filter by region if not global
        if (activeRegion !== 'Global') {
          const allCatalysts = await base44.entities.Catalyst.list();
          const filtered = allCatalysts.filter(c => 
            c.regions && c.regions.includes(activeRegion)
          );
          setCatalysts(filtered.sort((a, b) => 
            new Date(b.published_at) - new Date(a.published_at)
          ).slice(0, 4));
        } else {
          const all = await base44.entities.Catalyst.list();
          setCatalysts(all.sort((a, b) => 
            new Date(b.published_at) - new Date(a.published_at)
          ).slice(0, 4));
        }
      } catch (error) {
        console.error('Error loading catalysts:', error);
        setCatalysts([]);
      } finally {
        setLoading(false);
      }
    };

    loadCatalysts();
    const interval = setInterval(loadCatalysts, 300000); // refresh every 5 min
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
      <div className="text-center py-8 text-xs text-white/30">
        No catalysts at the moment. Check back soon.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'rgb(14,200,220)' }} />
        <h2 className="text-sm font-bold text-white/80">Catalyst Feed</h2>
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