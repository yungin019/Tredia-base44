import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Plus, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import CommunityFeed from '@/components/community/CommunityFeed';
import CommunityLeaderboard from '@/components/community/CommunityLeaderboard';
import DiscordWidget from '@/components/community/DiscordWidget';
import NewPostModal from '@/components/community/NewPostModal';

export default function Community() {
  const [tab, setTab] = useState('feed');
  const [showNewPost, setShowNewPost] = useState(false);
  const [user, setUser] = useState(null);
  const { tier } = useSubscriptionStatus();
  const canPost = tier === 'pro' || tier === 'elite';

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="w-full min-h-screen app-bg pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 border-b border-white/[0.05]"
        style={{ background: 'rgba(4,8,20,0.95)', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-black text-white">Community</h1>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(14,200,220,0.1)', color: 'rgb(100,220,240)', border: '1px solid rgba(14,200,220,0.2)' }}>
                LIVE
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {([
              { id: 'feed', label: 'Feed', TabIcon: Zap },
              { id: 'leaderboard', label: 'Leaderboard', TabIcon: Trophy },
            ]).map(({ id, label, TabIcon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
                style={tab === id
                  ? { background: 'rgba(14,200,220,0.15)', color: 'rgb(14,200,220)', border: '1px solid rgba(14,200,220,0.25)' }
                  : { color: 'rgba(255,255,255,0.35)' }}
              >
                <TabIcon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-[900px] mx-auto space-y-4">
        <AnimatePresence mode="wait">
          {tab === 'feed' && (
            <motion.div key="feed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CommunityFeed user={user} tier={tier} />
              <div className="mt-6">
                <DiscordWidget />
              </div>
            </motion.div>
          )}
          {tab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CommunityLeaderboard user={user} />
              <div className="mt-6">
                <DiscordWidget />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Post Button */}
      <button
        onClick={() => canPost ? setShowNewPost(true) : null}
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full flex items-center justify-center shadow-xl tap-feedback"
        style={{
          background: canPost
            ? 'linear-gradient(135deg, rgba(14,200,220,0.9), rgba(8,160,185,0.9))'
            : 'rgba(255,255,255,0.1)',
          border: canPost ? 'none' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: canPost ? '0 4px 24px rgba(14,200,220,0.35)' : 'none',
        }}
        title={canPost ? 'New post' : 'PRO required to post'}
      >
        <Plus className="h-6 w-6" style={{ color: canPost ? '#040d1e' : 'rgba(255,255,255,0.3)' }} />
      </button>

      {showNewPost && (
        <NewPostModal
          user={user}
          onClose={() => setShowNewPost(false)}
          onPosted={() => setShowNewPost(false)}
        />
      )}
    </div>
  );
}