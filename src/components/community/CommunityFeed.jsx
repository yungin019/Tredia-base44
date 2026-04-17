import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CommunityPostCard from './CommunityPostCard';

const DEMO_POSTS = [
  {
    id: 'demo1',
    username: 'TraderPro_',
    ticker: 'NVDA',
    action: 'BUY',
    analysis: 'Blackwell cycle just beginning. Data center demand accelerating faster than consensus. $1,000 target by EOY.',
    trek_grade: 'A',
    trek_agrees: true,
    likes_count: 47,
    comments_count: 12,
    is_trek_post: false,
    created_date: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'demo2',
    username: 'TREK AI',
    ticker: 'SPY',
    action: 'HOLD',
    analysis: 'Fed uncertainty persists. Market pricing 2 cuts in 2025 — TREK sees 1. Stay defensive until CPI confirms trajectory.',
    trek_grade: 'B',
    trek_agrees: true,
    likes_count: 89,
    comments_count: 24,
    is_trek_post: true,
    created_date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'demo3',
    username: 'AlphaSeeker',
    ticker: 'BTC',
    action: 'BUY',
    analysis: 'ETF inflows re-accelerating. On-chain supply shock incoming post-halving. Accumulation zone.',
    trek_grade: 'B',
    trek_agrees: true,
    likes_count: 31,
    comments_count: 8,
    is_trek_post: false,
    created_date: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'demo4',
    username: 'TechBull_',
    ticker: 'TSLA',
    action: 'SELL',
    analysis: 'Margin compression continuing. China competition intensifying. Deliveries miss likely next quarter.',
    trek_grade: 'C',
    trek_agrees: false,
    likes_count: 15,
    comments_count: 31,
    is_trek_post: false,
    created_date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

export default function CommunityFeed({ user, tier }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const realPosts = await base44.entities.CommunityPost.list('-created_date', 20);
      const combined = [...(realPosts || []), ...DEMO_POSTS];
      setPosts(combined.slice(0, 20));
    } catch {
      setPosts(DEMO_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + (likedPosts.has(postId) ? -1 : 1) } : p
    ));
  };

  const handleCopyTrade = async (post) => {
    if (tier !== 'pro' && tier !== 'elite') {
      alert('Copy trading is PRO/ELITE only. Upgrade to copy trades.');
      return;
    }
    try {
      await base44.entities.CopiedTrade.create({
        user_id: user?.email || user?.id,
        post_id: post.id,
        original_username: post.username,
        ticker: post.ticker,
        action: post.action,
        trek_grade: post.trek_grade,
        outcome: 'pending',
      });
      alert(`✅ Copied @${post.username}'s ${post.action} on $${post.ticker} as paper trade.`);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className="h-40 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post, i) => (
        <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <CommunityPostCard
            post={post}
            liked={likedPosts.has(post.id)}
            onLike={() => handleLike(post.id)}
            onCopyTrade={() => handleCopyTrade(post)}
            tier={tier}
          />
        </motion.div>
      ))}
    </div>
  );
}