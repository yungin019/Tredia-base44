import React, { useState } from 'react';
import { Trophy, TrendingUp, Users, Star, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const LEADERBOARD = [
  {
    rank: 1,
    username: 'TraderPro_',
    isOG: true,
    monthlyReturn: 24.5,
    winRate: 78,
    followers: 1240,
    topTrade: 'NVDA +18.2% in 7 days',
    trades: 156,
    avgHold: '5 days',
    sharpe: 2.3,
  },
  {
    rank: 2,
    username: 'AlphaSeeker',
    isOG: true,
    monthlyReturn: 19.8,
    winRate: 72,
    followers: 980,
    topTrade: 'BTC +12.4% in 3 days',
    trades: 143,
    avgHold: '3 days',
    sharpe: 2.1,
  },
  {
    rank: 3,
    username: 'TechBull_',
    isOG: false,
    monthlyReturn: 17.2,
    winRate: 69,
    followers: 750,
    topTrade: 'TSLA +15.1% in 10 days',
    trades: 128,
    avgHold: '6 days',
    sharpe: 1.9,
  },
  {
    rank: 4,
    username: 'MomentumMax',
    isOG: true,
    monthlyReturn: 15.4,
    winRate: 75,
    followers: 620,
    topTrade: 'META +11.8% in 5 days',
    trades: 134,
    avgHold: '4 days',
    sharpe: 2.0,
  },
  {
    rank: 5,
    username: 'SwingKing',
    isOG: false,
    monthlyReturn: 14.1,
    winRate: 68,
    followers: 510,
    topTrade: 'AAPL +9.3% in 14 days',
    trades: 89,
    avgHold: '12 days',
    sharpe: 1.7,
  },
];

const PAPER_LEADERBOARD = [
  { rank: 1, username: 'NewbieAce', return: 32.1, trades: 45, reward: '3 months Elite FREE' },
  { rank: 2, username: 'LearningFast', return: 28.5, trades: 38, reward: '1 month Elite FREE' },
  { rank: 3, username: 'PaperTrader_', return: 24.2, trades: 52, reward: '1 month Pro FREE' },
];

function TraderDetailSheet({ trader, children }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-[#0D1117] border-white/[0.06] max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white text-xl">TREK Analysis: {trader.username}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6 pb-6">
          <div className="p-5 rounded-lg bg-[#080B12] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Overall Grade</span>
              <span className="text-3xl font-bold text-[#00D68F]">A</span>
            </div>
            <p className="text-sm text-gray-300">
              Consistently profitable momentum trader with excellent risk management. Strong in tech sector timing.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-3">Performance Breakdown</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">Win Rate:</span>
                <span className="text-white">{trader.winRate}% ({Math.floor(trader.trades * trader.winRate / 100)} / {trader.trades})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Win:</span>
                <span className="text-[#00D68F]">$2,340 (+8.2%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Loss:</span>
                <span className="text-[#FF3B3B]">$620 (-2.1%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sharpe Ratio:</span>
                <span className="text-white">{trader.sharpe}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-3">Trading Style</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">Momentum / Swing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Hold Time:</span>
                <span className="text-white">{trader.avgHold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dominant Sectors:</span>
                <span className="text-white">Tech 65%, Crypto 25%, Other 10%</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-3">Three Strengths</h3>
            <div className="space-y-2">
              {[
                'Excellent entry timing - 82% of trades enter within 2% of optimal level',
                'Strong discipline - never breaks stop loss rules (0 violations in 156 trades)',
                'Sector focus - specialized tech knowledge gives edge in NVDA, TSLA, AMD'
              ].map((strength, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#00D68F] font-bold">{i + 1}.</span>
                  <p className="text-sm text-gray-300">{strength}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-3">Three Weaknesses</h3>
            <div className="space-y-2">
              {[
                'Over-concentrated in tech - 65% exposure creates sector risk',
                'Struggles in choppy markets - win rate drops to 54% when VIX > 20',
                'Small account size limits position diversification'
              ].map((weakness, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[#F59E0B] font-bold">{i + 1}.</span>
                  <p className="text-sm text-gray-300">{weakness}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-lg bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 border border-[#F59E0B]/20">
            <h3 className="text-sm font-bold text-white mb-2">TREK Recommendation</h3>
            <p className="text-sm text-gray-300">
              Follow this trader's tech momentum plays with 50% position sizing. Use their entries as signals but apply your own risk management. Avoid copying during high VIX periods.
            </p>
          </div>

          <div className="text-center text-xs text-gray-500 font-mono">
            Confidence: 87% | Trades Analyzed: {trader.trades}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Traders() {
  const [following, setFollowing] = useState([]);

  const toggleFollow = (username) => {
    setFollowing(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  return (
    <div className="w-full min-h-screen pb-24" style={{ background: '#080B12' }}>
      <div className="p-4 space-y-6 max-w-[900px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-[#F59E0B]" />
          <div>
            <h1 className="text-2xl font-bold text-white">Top Traders</h1>
            <p className="text-sm text-gray-400">Follow and learn from the best</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4">Real Money Leaderboard</h2>
          <div className="space-y-3">
            {LEADERBOARD.map((trader) => (
              <Card key={trader.rank} className="bg-[#0D1117] border-white/[0.06] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] font-bold text-white">
                    {trader.rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white">{trader.username}</span>
                      {trader.isOG && (
                        <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 text-xs">
                          OG
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-400">Monthly Return</div>
                        <div className="font-mono font-bold text-[#00D68F]">+{trader.monthlyReturn}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                        <div className="font-mono font-bold text-white">{trader.winRate}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Followers</div>
                        <div className="font-mono font-bold text-white">{trader.followers}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#080B12] border border-white/[0.06] mb-3">
                      <div className="text-xs text-gray-400 mb-1">Top Trade This Month</div>
                      <div className="text-sm font-medium text-white">{trader.topTrade}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleFollow(trader.username)}
                        variant={following.includes(trader.username) ? "secondary" : "default"}
                        className={`flex-1 ${
                          following.includes(trader.username)
                            ? 'bg-gray-800 text-white'
                            : 'bg-[#00D68F] hover:bg-[#00D68F]/90 text-white'
                        }`}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {following.includes(trader.username) ? 'Following' : 'Follow'}
                      </Button>

                      <TraderDetailSheet trader={trader}>
                        <Button variant="outline" className="flex-1 border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/10">
                          TREK Analysis
                        </Button>
                      </TraderDetailSheet>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Paper Trading Weekly Leaders</h2>
            <Star className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <Card className="bg-gradient-to-br from-[#F59E0B]/10 to-[#F59E0B]/5 border-[#F59E0B]/20 p-5 mb-3">
            <p className="text-sm text-gray-300 mb-3">
              Top 3 paper traders this week win premium subscriptions!
            </p>
            <div className="flex gap-2 text-xs">
              <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-0">1st: 3mo Elite FREE</Badge>
              <Badge className="bg-[#F59E0B]/15 text-[#F59E0B] border-0">2nd: 1mo Elite FREE</Badge>
              <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-0">3rd: 1mo Pro FREE</Badge>
            </div>
          </Card>

          <div className="space-y-2">
            {PAPER_LEADERBOARD.map((trader) => (
              <Card key={trader.rank} className="bg-[#0D1117] border-white/[0.06] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F59E0B]/20 font-bold text-[#F59E0B] text-sm">
                      {trader.rank}
                    </div>
                    <div>
                      <div className="font-bold text-white">{trader.username}</div>
                      <div className="text-xs text-gray-400">{trader.trades} trades</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-[#00D68F]">+{trader.return}%</div>
                    <div className="text-xs text-[#F59E0B]">{trader.reward}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
