import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IntelligenceTicker } from '@/components/ai/IntelligenceTicker';
import { NextJumpDetector } from '@/components/ai/NextJumpDetector';
import { TrekIntelligenceCard } from '@/components/ai/TrekIntelligenceCard';
import { AlertRow } from '@/components/ai/AlertRow';
import { NewsFeed } from '@/components/ai/NewsFeed';
import PullToRefresh from '@/components/ui/PullToRefresh';

export default function HomeNew() {
  const navigate = useNavigate();
  const [nextJump] = useState({
    asset: 'NVDA',
    direction: 'LONG',
    confidence: 87,
    quote: 'AI infrastructure spending accelerating. Smart money accumulation detected across all timeframes.',
  });

  const [regime] = useState('RISK-ON');
  const [action] = useState('Focus on tech momentum plays with tight stops. Market structure supports dip-buying.');

  const [alerts] = useState([
    { type: 'green', title: 'BTC breaking key resistance at $68,500 - momentum confirmed', timestamp: '2m ago' },
    { type: 'red', title: 'META earnings whisper numbers declining - options skew bearish', timestamp: '12m ago' },
    { type: 'yellow', title: 'Fed speakers scheduled this week - volatility expected', timestamp: '1h ago' },
  ]);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="w-full min-h-screen" style={{ background: '#080B12' }}>
        <div className="sticky top-0 z-50 backdrop-blur-lg border-b" style={{ background: 'rgba(8,11,18,0.9)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">TREDIO</h1>
              <Badge className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white border-0 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                ELITE
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/search')}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => navigate('/Notifications')}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B3B] rounded-full" />
              </button>
            </div>
          </div>
        </div>

        <IntelligenceTicker />

        <div className="p-4 space-y-6 pb-24 max-w-[900px] mx-auto">
          <NextJumpDetector
            signal={nextJump}
            onSeeWhy={() => navigate('/AIInsights')}
          />

          <TrekIntelligenceCard
            regime={regime}
            action={action}
          />

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white" style={{ marginBottom: '16px' }}>
              Active Alerts
            </h2>
            {alerts.map((alert, i) => (
              <AlertRow
                key={i}
                type={alert.type}
                title={alert.title}
                timestamp={alert.timestamp}
                onClick={() => navigate('/AIInsights')}
              />
            ))}
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-4">
              Market News
            </h2>
            <NewsFeed />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white" style={{ marginBottom: '16px' }}>
              Risk Warnings
            </h2>
            <AlertRow
              type="red"
              title="TSLA delivery miss risk - bearish divergence on daily chart"
              onClick={() => navigate('/Asset/TSLA')}
            />
            <AlertRow
              type="yellow"
              title="Tech sector volatility elevated - reduce position sizing"
              onClick={() => navigate('/Markets')}
            />
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}
