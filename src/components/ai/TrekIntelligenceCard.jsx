import { Card } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export function TrekIntelligenceCard({ regime, action }) {
  const regimeData = {
    'RISK-ON': { color: '#00D68F', bg: 'bg-[#00D68F]/10' },
    'RISK-OFF': { color: '#FF3B3B', bg: 'bg-[#FF3B3B]/10' },
    'NEUTRAL': { color: '#F59E0B', bg: 'bg-[#F59E0B]/10' },
  };

  const current = regimeData[regime] || regimeData.NEUTRAL;

  return (
    <Card className="bg-[#0D1117] border-white/[0.06] overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-sm font-bold text-white">TREK INTELLIGENCE</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg ${current.bg}`}>
            <span className="text-sm font-bold font-mono" style={{ color: current.color }}>
              {regime}
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
            style={{ backgroundColor: '#F59E0B' }}
          />
          <p className="pl-4 text-sm text-white font-medium leading-relaxed">
            {action}
          </p>
        </div>
      </div>
    </Card>
  );
}
