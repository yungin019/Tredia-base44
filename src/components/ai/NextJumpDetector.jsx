import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function NextJumpDetector({ signal, onSeeWhy }) {
  if (!signal) return null;

  const isLong = signal.direction === 'BUY' || signal.direction === 'WATCH';
  const DirectionIcon = isLong ? TrendingUp : TrendingDown;
  const directionColor = isLong ? 'text-[#00D68F]' : 'text-[#FF3B3B]';
  const borderColor = isLong ? 'border-[#00D68F]/30' : 'border-[#FF3B3B]/30';

  return (
    <Card className="relative overflow-hidden border-2 border-[#F59E0B]/40 bg-[#0D1117] glow-gold-pulse">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/5 rounded-full blur-3xl" />

      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
            <h3 className="text-lg font-bold text-white">NEXT JUMP DETECTOR</h3>
          </div>
          <Badge className="bg-[#FF3B3B] text-white border-0 live-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
            LIVE
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${isLong ? 'from-[#00D68F]/20 to-[#00D68F]/5' : 'from-[#FF3B3B]/20 to-[#FF3B3B]/5'}`}>
              <DirectionIcon className={`w-6 h-6 ${directionColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">{signal.asset}</span>
                <span className={`text-lg font-bold ${directionColor}`}>{signal.direction}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">TREK Confidence</span>
              <span className="font-mono font-bold text-white">{signal.confidence}%</span>
            </div>
            <Progress
              value={signal.confidence}
              className={`h-2 ${borderColor}`}
            />
          </div>

          {signal.quote && (
            <div className="space-y-3 bg-black/40 rounded-lg p-3 border border-white/5">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-semibold text-gold">Why:</span> {signal.quote}
              </p>
              {signal.entry && (
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-semibold text-success">Entry:</span> {signal.entry}
                </p>
              )}
              {signal.timing && (
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-semibold text-primary">Timeframe:</span> {signal.timing}
                </p>
              )}
              {signal.positionSize && (
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Size:</span> {signal.positionSize}
                </p>
              )}
              {signal.risk && (
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-semibold text-destructive">Risk Trigger:</span> {signal.risk}
                </p>
              )}
            </div>
          )}

          <Button
            onClick={onSeeWhy}
            className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold border-0 h-11"
          >
            SEE WHY
          </Button>
        </div>
      </div>
    </Card>
  );
}