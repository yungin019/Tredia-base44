import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CACHE_KEY = 'trek_daily_insight';
const CACHE_DATE_KEY = 'trek_daily_insight_date';

export default function TrekDailyInsight() {
  const [insight, setInsight] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const loadInsight = async (force = false) => {
    setLoading(true);
    setError(false);

    // Check cache first
    if (!force) {
      const cachedDate = localStorage.getItem(CACHE_DATE_KEY);
      const cached = localStorage.getItem(CACHE_KEY);
      if (cachedDate === todayStr && cached) {
        try {
          setInsight(JSON.parse(cached));
          setLoading(false);
          return;
        } catch { /* regenerate */ }
      }
    }

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are TREK, an elite AI trading mentor. Generate a concise daily market insight for ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.

Return JSON with:
- summary: A 1-2 sentence executive summary (max 120 chars). Start with the market state. E.g. "Markets opened cautious today. VIX elevated at 28."
- full_brief: A 3-4 paragraph detailed market brief covering: overall market conditions, key movers, one opportunity, one risk to watch. Be specific and actionable.
- mood: one of "bullish" | "bearish" | "cautious" | "volatile"
- key_opportunity: Ticker + one-line reason (e.g. "GOLD — showing accumulation, safe haven demand rising")
- key_risk: One-line risk statement`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            full_brief: { type: 'string' },
            mood: { type: 'string' },
            key_opportunity: { type: 'string' },
            key_risk: { type: 'string' },
          }
        }
      });

      const data = res || {};
      setInsight(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_DATE_KEY, todayStr);
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => { loadInsight(); }, []);

  const moodColor = {
    bullish: '#22c55e',
    bearish: '#ef4444',
    cautious: '#F59E0B',
    volatile: '#8b5cf6',
  };

  if (loading) {
    return (
      <div className="rounded-xl p-4 animate-pulse" style={{ background: 'rgba(8,16,36,0.7)', border: '1px solid rgba(14,200,220,0.12)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3.5 w-3.5 bg-primary/20 rounded" />
          <div className="h-3 bg-white/10 rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-white/[0.07] rounded w-full" />
          <div className="h-3 bg-white/[0.05] rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (error || !insight) return null;

  const color = moodColor[insight.mood] || '#0ec8dc';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(8,16,36,0.75)', border: `1px solid ${color}25`, borderLeft: `3px solid ${color}` }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5" style={{ color }} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color }}>TREK Daily Insight</span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
              Updated today
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => loadInsight(true)} className="text-white/20 hover:text-white/40 transition-colors">
              <RefreshCw className="h-3 w-3" />
            </button>
            <button onClick={() => setExpanded(v => !v)} className="text-white/30 hover:text-white/60 transition-colors">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <p className="text-[12px] text-white/80 leading-relaxed font-medium">{insight.summary}</p>

        {/* Quick pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {insight.key_opportunity && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
              ⚡ {insight.key_opportunity}
            </div>
          )}
          {insight.key_risk && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>
              ⚠ {insight.key_risk}
            </div>
          )}
        </div>
      </div>

      {/* Expanded full brief */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-4 pt-0 border-t border-white/[0.05]">
              <p className="text-[11px] text-white/60 leading-relaxed pt-3 whitespace-pre-line">{insight.full_brief}</p>
              <p className="text-[9px] text-white/20 mt-3 uppercase tracking-wider">
                Generated by TREK AI · {new Date().toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <button onClick={() => setExpanded(true)}
          className="w-full py-2 text-[10px] font-bold border-t border-white/[0.05] transition-colors hover:bg-white/[0.02]"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          Read full TREK brief ↓
        </button>
      )}
    </motion.div>
  );
}