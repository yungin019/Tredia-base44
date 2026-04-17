import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DEMO_LEADERS = [
  { rank: 1, username: 'TraderPro_', win_rate: 78, total_trades: 156, weekly_return: 24.5, avg_trek_grade: 'A', discord_connected: true },
  { rank: 2, username: 'AlphaSeeker', win_rate: 72, total_trades: 143, weekly_return: 19.8, avg_trek_grade: 'A', discord_connected: false },
  { rank: 3, username: 'TechBull_', win_rate: 69, total_trades: 128, weekly_return: 17.2, avg_trek_grade: 'B', discord_connected: true },
  { rank: 4, username: 'MomentumMax', win_rate: 75, total_trades: 134, weekly_return: 15.4, avg_trek_grade: 'B', discord_connected: false },
  { rank: 5, username: 'SwingKing', win_rate: 68, total_trades: 89, weekly_return: 14.1, avg_trek_grade: 'B', discord_connected: false },
];

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const GRADE_COLOR = { A: '#0ec8dc', B: '#22c55e', C: '#F59E0B', D: '#ef4444' };

function DiscordBadge() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/>
    </svg>
  );
}

export default function CommunityLeaderboard({ user }) {
  const [leaders, setLeaders] = useState(DEMO_LEADERS);
  const [following, setFollowing] = useState(new Set());

  const toggleFollow = (username) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username); else next.add(username);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gold" />
          <span className="text-sm font-black text-white">Weekly Leaderboard</span>
        </div>
        <span className="text-[9px] text-white/25 font-mono">Resets Monday</span>
      </div>

      {/* Prize banner */}
      <div className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <span className="text-2xl">🏆</span>
        <div>
          <p className="text-xs font-black text-white">Top 3 traders win prizes!</p>
          <p className="text-[10px] text-white/40">1st: 3mo Elite · 2nd: 1mo Elite · 3rd: 1mo Pro</p>
        </div>
      </div>

      {/* Rankings */}
      {leaders.map((trader, i) => (
        <motion.div
          key={trader.username}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="rounded-2xl p-4"
          style={{
            background: i === 0 ? 'rgba(14,200,220,0.07)' : 'rgba(8,18,42,0.6)',
            border: i === 0 ? '1px solid rgba(14,200,220,0.2)' : '1px solid rgba(100,220,255,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Rank */}
            <div className="text-xl w-8 text-center flex-shrink-0">
              {MEDAL[trader.rank] || (
                <span className="text-sm font-black text-white/30">#{trader.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
              {trader.username[0].toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm font-bold text-white">@{trader.username}</span>
                {trader.discord_connected && <DiscordBadge />}
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                  style={{ background: `${GRADE_COLOR[trader.avg_trek_grade]}15`, color: GRADE_COLOR[trader.avg_trek_grade] }}>
                  {trader.avg_trek_grade}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono">
                <span className="text-[#22c55e] font-bold">+{trader.weekly_return}%</span>
                <span>{trader.win_rate}% WR</span>
                <span>{trader.total_trades} trades</span>
              </div>
            </div>

            {/* Follow */}
            <button
              onClick={() => toggleFollow(trader.username)}
              className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all tap-feedback flex-shrink-0"
              style={following.has(trader.username)
                ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }
                : { background: 'rgba(14,200,220,0.1)', color: '#0ec8dc', border: '1px solid rgba(14,200,220,0.25)' }}
            >
              <Users className="h-3 w-3" />
              {following.has(trader.username) ? 'Following' : 'Follow'}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}