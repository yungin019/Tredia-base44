import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CommunityPostCard from './CommunityPostCard';

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
      setPosts(realPosts || []);
    } catch {
      setPosts([]);
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

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">📡</div>
        <p className="text-white/50 font-semibold mb-1">No posts yet</p>
        <p className="text-white/25 text-sm">TREK AI will post signals here. Be the first to share a trade.</p>
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