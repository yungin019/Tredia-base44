import { Zap, TrendingUp, AlertTriangle, Target } from 'lucide-react';

export function IntelligenceTicker({ alerts = [] }) {
  const defaultAlerts = [
    { icon: Zap, text: 'Smart money accumulating NVDA', color: '#F59E0B' },
    { icon: TrendingUp, text: 'S&P 500 breaking key resistance', color: '#00D68F' },
    { icon: AlertTriangle, text: 'High volatility expected in tech sector', color: '#F59E0B' },
    { icon: Target, text: 'Bitcoin testing critical support zone', color: '#00D68F' },
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;
  const doubledAlerts = [...displayAlerts, ...displayAlerts];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#F59E0B]/10 via-[#F59E0B]/5 to-[#F59E0B]/10 border-y border-[#F59E0B]/20">
      <div className="flex items-center gap-8 py-3 ticker-animate">
        {doubledAlerts.map((alert, index) => {
          const IconComponent = alert.icon;
          return (
            <div key={index} className="flex items-center gap-2 whitespace-nowrap">
              <IconComponent className="w-4 h-4" style={{ color: alert.color }} />
              <span className="text-sm font-medium text-white/90">{alert.text}</span>
              {index < doubledAlerts.length - 1 && (
                <span className="text-[#F59E0B] mx-4">•</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
