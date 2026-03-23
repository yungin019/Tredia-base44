import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, TrendingUp, Zap, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PREMIUM_FEATURES = [
  {
    title: 'Trade Plans',
    description: 'Complete entry, risk, exit strategies with confidence scores',
    example: 'NVDA: $870 entry → $900 target (2 weeks) | Risk: $850',
    locked: true,
    impact: '+34% more signal wins',
  },
  {
    title: 'Geo-Aware Intelligence',
    description: 'Events + signals ranked by YOUR region & portfolio',
    example: 'Sweden user: Stockholm rally impacts SEK trades first',
    locked: true,
    impact: 'Stay ahead of local moves',
  },
  {
    title: 'TREK Mentor Mode',
    description: 'Real-time mentoring: "What I'd do" + "Watch for"',
    example: 'Fed decision → "I\'d add to defensives. Watch credit spreads."',
    locked: true,
    impact: 'Mentor-level reasoning',
  },
  {
    title: 'Global Asset Coverage',
    description: 'US, EU, Asia, Forex, Commodities, Crypto (real-time)',
    example: 'Trade Stockholm → Tokyo → New York in one interface',
    locked: true,
    impact: 'Truly global edge',
  },
  {
    title: 'Advanced Sector Heat',
    description: 'Deep movers + drivers, risk alerts, daily rotation calls',
    example: 'Energy → Tech rotation: Which names to buy/sell (ranked)',
    locked: true,
    impact: 'Sector rotation edge',
  },
  {
    title: 'Morning Briefing',
    description: 'Every morning: What matters today + trades to watch',
    example: 'Fed decision at 2pm + NVDA earnings => JPM stock outlook',
    locked: true,
    impact: 'Never miss a move',
  },
  {
    title: 'Evening Recap',
    description: 'What mattered today + what to prepare for tomorrow',
    example: 'Energy rally => Watch oil tomorrow, Financials under pressure',
    locked: true,
    impact: 'Plan ahead daily',
  },
  {
    title: 'Smart Alerts (Geo + Interest)',
    description: 'Only HIGH signal events for YOUR assets in YOUR region',
    example: 'NVDA breakout alert (if you follow tech), skip unrelated noise',
    locked: true,
    impact: 'Signal > Noise 100x',
  },
];

const FREE_VS_ELITE = [
  { feature: 'Market News', free: '✓', elite: '✓' },
  { feature: 'Basic Price Alerts', free: '✓', elite: '✓' },
  { feature: 'Fear & Greed Score', free: '✓', elite: '✓' },
  { feature: 'Trade Plans & Entry Zones', free: '✗', elite: '✓' },
  { feature: 'Geo-Aware Signals', free: '✗', elite: '✓' },
  { feature: 'TREK Mentor Reasoning', free: '✗', elite: '✓' },
  { feature: 'Global Asset Coverage', free: 'Limited (US)', elite: '✓ All' },
  { feature: 'Morning & Evening Briefings', free: '✗', elite: '✓' },
  { feature: 'Advanced Sector Rotation', free: 'Basic', elite: 'Deep' },
  { feature: 'Smart Geo-Filtered Alerts', free: '✗', elite: '✓' },
];

export default function ElitePremiumShowcase() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('features');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary">ELITE MEMBERSHIP</span>
        </div>
        <h2 className="text-2xl font-black text-foreground">Upgrade to TREK Elite</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Stop checking 5 apps. TREK Elite gives you the global edge in ONE place.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-center mb-6">
        {[
          { id: 'features', label: 'What You Get' },
          { id: 'comparison', label: 'Free vs Elite' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/5 text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feature Grid */}
      {activeTab === 'features' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid gap-3"
        >
          {PREMIUM_FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative group"
            >
              {/* Locked Badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-warning/15 border border-warning/25">
                <Lock className="h-3 w-3 text-warning" />
                <span className="text-[10px] font-bold text-warning uppercase">Elite Only</span>
              </div>

              {/* Card */}
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-primary/25 transition-all cursor-pointer group-hover:scale-[1.01]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>

                {/* Example */}
                <div className="ml-11 p-2 rounded-lg bg-success/5 border border-success/10 mb-2">
                  <p className="text-xs text-success font-mono">{feature.example}</p>
                </div>

                {/* Impact */}
                <div className="ml-11 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                  <span className="text-primary font-semibold">{feature.impact}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Comparison Table */}
      {activeTab === 'comparison' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-2 overflow-x-auto"
        >
          <div className="min-w-full">
            {FREE_VS_ELITE.map((row, idx) => (
              <div
                key={row.feature}
                className="grid grid-cols-3 gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors"
              >
                <div className="font-semibold text-sm text-foreground">{row.feature}</div>
                <div className={`text-center text-sm ${row.free === '✓' ? 'text-success' : 'text-muted-foreground'}`}>
                  {row.free}
                </div>
                <div className="text-center text-sm font-bold text-primary">{row.elite}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/Upgrade')}
        className="w-full py-4 rounded-2xl font-bold text-white transition-all relative group overflow-hidden mt-6"
        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
      >
        {/* Glow Background */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.3), transparent 70%)' }}
        />

        <div className="relative flex items-center justify-center gap-2">
          <span className="text-lg">Unlock Elite Access</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </motion.button>

      {/* Social Proof */}
      <div className="text-center space-y-2 text-xs text-muted-foreground">
        <p>🔒 Secure payment • 7-day free trial • Cancel anytime</p>
        <p>Join 15,000+ traders using TREK Elite</p>
      </div>
    </div>
  );
}