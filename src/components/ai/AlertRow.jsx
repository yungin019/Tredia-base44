import { ChevronRight } from 'lucide-react';

export function AlertRow({ type = 'green', title, timestamp, onClick }) {
  const colors = {
    green: { border: 'border-l-[#00D68F]', bg: 'bg-[#00D68F]/5', text: 'text-[#00D68F]' },
    red: { border: 'border-l-[#FF3B3B]', bg: 'bg-[#FF3B3B]/5', text: 'text-[#FF3B3B]' },
    yellow: { border: 'border-l-[#F59E0B]', bg: 'bg-[#F59E0B]/5', text: 'text-[#F59E0B]' },
  };

  const color = colors[type] || colors.yellow;

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 border-l-4 ${color.border} ${color.bg} bg-[#0D1117] border border-white/[0.06] cursor-pointer tap-feedback`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        {timestamp && (
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{timestamp}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
    </div>
  );
}
