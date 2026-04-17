import React from 'react';
import { Heart, Copy, TrendingUp, TrendingDown, Minus, Zap, CheckCircle, XCircle } from 'lucide-react';

const ACTION_STYLE = {
  BUY:  { color: '#0ec8dc', bg: 'rgba(14,200,220,0.12)', border: 'rgba(14,200,220,0.3)', icon: TrendingUp },
  SELL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  icon: TrendingDown },
  HOLD: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: Minus },
};

const GRADE_STYLE = {
  A: { color: '#0ec8dc', bg: 'rgba(14,200,220,0.1)' },
  B: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  C: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  D: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  F: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function DiscordBadge({ show }) {
  if (!show) return null;
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#5865F2" className="inline-block ml-1">
      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/>
    </svg>
  );
}

export default function CommunityPostCard({ post, liked, onLike, onCopyTrade, tier }) {
  const action = post.action || 'HOLD';
  const ast = ACTION_STYLE[action] || ACTION_STYLE.HOLD;
  const ActionIcon = ast.icon;
  const grade = post.trek_grade || 'B';
  const gst = GRADE_STYLE[grade] || GRADE_STYLE.B;

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: post.is_trek_post ? 'rgba(14,50,72,0.7)' : 'rgba(8,18,42,0.65)',
      border: post.is_trek_post ? '1px solid rgba(14,200,220,0.2)' : '1px solid rgba(100,220,255,0.08)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Trek post accent line */}
      {post.is_trek_post && (
        <div style={{ height: 2, background: 'linear-gradient(90deg, rgba(14,200,220,0.8), transparent)' }} />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: post.is_trek_post ? 'rgba(14,200,220,0.2)' : 'rgba(255,255,255,0.08)', color: post.is_trek_post ? '#0ec8dc' : 'rgba(255,255,255,0.6)' }}>
              {post.is_trek_post ? '⚡' : (post.username?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white">{post.is_trek_post ? 'TREK AI' : `@${post.username}`}</span>
                {post.is_trek_post && (
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(14,200,220,0.15)', color: '#0ec8dc', border: '1px solid rgba(14,200,220,0.3)' }}>
                    ⚡ AUTO
                  </span>
                )}
                <DiscordBadge show={post.discord_connected} />
              </div>
              <span className="text-[10px] text-white/30">{timeAgo(post.created_date)}</span>
            </div>
          </div>

          {/* Grade */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-lg" style={{ background: gst.bg, color: gst.color }}>
              TREK {grade}
            </span>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: post.trek_agrees ? '#22c55e' : '#ef4444' }}>
              {post.trek_agrees ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {post.trek_agrees ? 'Agrees' : 'Disagrees'}
            </span>
          </div>
        </div>

        {/* Ticker + Action */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-black text-white font-mono">${post.ticker}</span>
          <span className="flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg"
            style={{ background: ast.bg, color: ast.color, border: `1px solid ${ast.border}` }}>
            <ActionIcon className="h-3 w-3" />
            {action}
          </span>
        </div>

        {/* Analysis */}
        <p className="text-sm text-white/75 leading-relaxed mb-3">{post.analysis}</p>

        {/* Footer actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
          <button onClick={onLike} className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors tap-feedback"
            style={{ color: liked ? '#ef4444' : 'rgba(255,255,255,0.3)' }}>
            <Heart className="h-3.5 w-3.5" fill={liked ? '#ef4444' : 'none'} />
            {post.likes_count || 0}
          </button>

          <button
            onClick={onCopyTrade}
            className="flex items-center gap-1.5 text-[11px] font-semibold transition-all tap-feedback ml-auto px-3 py-1.5 rounded-lg"
            style={{
              background: (tier === 'pro' || tier === 'elite') ? 'rgba(14,200,220,0.1)' : 'rgba(255,255,255,0.04)',
              color: (tier === 'pro' || tier === 'elite') ? '#0ec8dc' : 'rgba(255,255,255,0.2)',
              border: `1px solid ${(tier === 'pro' || tier === 'elite') ? 'rgba(14,200,220,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <Copy className="h-3 w-3" />
            Copy Trade {(tier !== 'pro' && tier !== 'elite') && '🔒'}
          </button>
        </div>
      </div>
    </div>
  );
}