import { Card } from '@/components/ui/card';
import { Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TrekIntelligenceCard({ sentiment, regime }) {
  const navigate = useNavigate();

  const getRegimeData = () => {
    if (sentiment < 25) return {
      level: 'EXTREME FEAR',
      score: sentiment,
      why: 'Fed hawkish stance + tech selloff driving institutional exit. VIX spiking.',
      atRisk: 'Tech, Growth, Crypto',
      trekSays: 'Reduce exposure, hold cash, watch for reversal signals.'
    };
    if (sentiment < 40) return {
      level: 'FEAR',
      score: sentiment,
      why: 'Market uncertainty elevated. Defensive rotation in progress.',
      atRisk: 'High-beta tech, Small caps',
      trekSays: 'Focus on quality. Reduce leverage. Build watchlists.'
    };
    if (sentiment < 60) return {
      level: 'NEUTRAL',
      score: sentiment,
      why: 'Mixed signals. Sector rotation ongoing. Range-bound action.',
      atRisk: 'Over-leveraged positions',
      trekSays: 'Stay selective. Focus on earnings catalysts.'
    };
    if (sentiment < 75) return {
      level: 'GREED',
      score: sentiment,
      why: 'Risk appetite returning. Momentum building in growth sectors.',
      atRisk: 'Late cyclicals, Value traps',
      trekSays: 'Add selective exposure. Trail stops on winners.'
    };
    return {
      level: 'EXTREME GREED',
      score: sentiment,
      why: 'Euphoric conditions. Speculative activity elevated. Overextension risk.',
      atRisk: 'Everything (correction risk)',
      trekSays: 'Take profits. Tighten stops. Prepare for pullback.'
    };
  };

  const data = getRegimeData();

  return (
    <Card
      className="bg-[#0D1117] overflow-hidden transition-all hover:scale-[1.01] cursor-pointer"
      style={{
        border: '1px solid rgba(245, 158, 11, 0.3)',
        boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)'
      }}
      onClick={() => navigate('/AIInsights')}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="text-sm font-bold text-white tracking-wide">⚡ TREK INTELLIGENCE</h3>
          </div>
          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
            LIVE
          </span>
        </div>

        <div>
          <p className="text-base font-bold text-white mb-1">
            {data.level} territory <span className="text-[#F59E0B]">({data.score}/100)</span>
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="text-white/80">
            <span className="font-bold text-white">Why:</span> {data.why}
          </p>
          <p className="text-white/80">
            <span className="font-bold text-white">At Risk:</span> {data.atRisk}
          </p>
        </div>

        <div
          className="p-3 rounded-lg"
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}
        >
          <p className="text-sm text-white/90 leading-relaxed">
            <span className="font-bold text-[#F59E0B]">TREK says:</span> {data.trekSays}
          </p>
        </div>

        <button
          onClick={() => navigate('/AIInsights')}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-[#F59E0B] hover:text-[#F59E0B]/80 transition-colors"
        >
          Explore Signals <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
