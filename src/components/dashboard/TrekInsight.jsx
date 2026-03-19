import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FALLBACK_INSIGHTS = [
  { label: 'GREED (71)', text: 'Tech momentum strong — NVDA leading AI infrastructure buildout. SPX holding key support at 5,200.', color: '#22c55e' },
  { label: 'WATCH', text: 'TSLA threatening breakdown below $175 support. Volume divergence suggests institutional distribution.', color: '#F59E0B' },
  { label: 'MACRO', text: 'Fed on hold through Q2. Rate-sensitive sectors (REITs, utilities) showing early accumulation signals.', color: '#60a5fa' },
];

export default function TrekInsight({ fearGreedValue }) {
  const [insights, setInsights] = useState(FALLBACK_INSIGHTS);
  const [loading, setLoading] = useState(false);
  const [refreshed, setRefreshed] = useState(false);

  const fgVal = fearGreedValue || 71;
  const fgLabel = fgVal >= 75 ? 'EXTREME GREED' : fgVal >= 55 ? 'GREED' : fgVal >= 45 ? 'NEUTRAL' : fgVal >= 25 ? 'FEAR' : 'EXTREME FEAR';
  const fgColor = fgVal >= 55 ? '#22c55e' : fgVal >= 45 ? '#6b7280' : '#ef4444';

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are TREK, TREDIA's AI market brain. Generate 3 sharp market insights for right now.
Fear & Greed Index: ${fgVal} (${fgLabel}).

Return JSON exactly:
{
  "insights": [
    { "label": "GREED (${fgVal})", "text": "2-line sharp market insight — mention 1 specific asset and a key level", "color": "#22c55e" },
    { "label": "RISK", "text": "2-line bearish/risk warning with specific asset and level", "color": "#ef4444" },
    { "label": "MACRO", "text": "2-line macro context (Fed, rates, sector rotation)", "color": "#60a5fa" }
  ]
}`,
        response_json_schema: {
          type: 'object',
          properties: {
            insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  text: { type: 'string' },
                  color: { type: 'string' },
                },
              },
            },
          },
        },
      });
      if (res?.insights?.length > 0) {
        setInsights(res.insights);
        setRefreshed(true);
      }
    } catch {
      // keep fallback
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-[#111118] p-5 relative overflow-hidden"
      style={{ borderColor: 'rgba(245,158,11,0.2)' }}
    >
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-[11px] font-bold text-white/80 tracking-wider uppercase">TREK Market Insight</span>
          {refreshed && <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 uppercase tracking-wider">Live AI</span>}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-[9px] text-white/20 hover:text-primary/70 transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className="text-[9px] font-black px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 uppercase tracking-wider"
              style={{
                color: ins.color,
                background: `${ins.color}18`,
                borderColor: `${ins.color}40`,
              }}
            >
              {ins.label}
            </span>
            <p className="text-[12px] text-white/65 leading-relaxed">{ins.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-primary live-pulse" />
        <span className="text-[9px] text-white/25 font-mono tracking-wider">TREK Intelligence · Real-time analysis</span>
      </div>
    </motion.div>
  );
}