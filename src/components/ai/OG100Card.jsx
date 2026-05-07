import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function OG100Card({ onClaim, onSkip }) {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const user = await base44.auth.me();
      if (!user) { toast.error('Please sign in first'); return; }
      if (onClaim) onClaim();
    } catch (error) {
      console.error('Claim error:', error);
      toast.error('Failed to proceed');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
      <div className="relative overflow-hidden rounded-2xl" style={{ background: 'rgba(10,22,52,0.75)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(245,158,11,0.3)', boxShadow: '0 0 40px rgba(245,158,11,0.06), 0 12px 40px rgba(0,0,0,0.45)' }}>
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.9) 0%, rgba(245,158,11,0.3) 60%, transparent 100%)' }} />
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(245,158,11,0.05)' }} />
        <div className="relative p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: '#F59E0B' }} />
              <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: '#F59E0B' }}>Founding Member Offer</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>OG100</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-1">Join the OG100</h3>
            <p className="text-sm" style={{ color: 'rgba(180,210,240,0.65)' }}>First 100 members unlock lifetime founding perks</p>
          </div>
          <ul className="space-y-2">
            {['Elite FREE for 30 days','Then Elite for 89 SEK/month for life (normally 179 SEK)','OG Founding Member badge','Personal referral link'].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(180,210,240,0.8)' }}>
                <span className="mt-0.5 text-base leading-none" style={{ color: '#F59E0B' }}>✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 pt-1">
            <button onClick={handleClaim} disabled={claiming} className="w-full font-black h-12 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 tracking-wider text-sm" style={{ background: 'linear-gradient(135deg, #F59E0B, #d97706)', color: '#0a0e1a', boxShadow: '0 4px 24px rgba(245,158,11,0.3)' }}>
              {claiming ? 'Loading...' : 'JOIN OG100'}
            </button>
            {onSkip && (
              <button onClick={onSkip} className="w-full h-10 rounded-xl text-sm font-semibold transition-all" style={{ background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>SKIP</button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
