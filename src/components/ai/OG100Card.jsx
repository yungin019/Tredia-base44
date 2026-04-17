import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function OG100Card({ onClaim }) {
  const [remaining, setRemaining] = useState(100);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCounter = async () => {
      try {
        const result = await base44.sql('SELECT value FROM app_settings WHERE key = $1', ['og100_spots_remaining']);
        if (result && result.length > 0) {
          setRemaining(parseInt(result[0].value) || 100);
        } else {
          await base44.sql('INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', ['og100_spots_remaining', '100']);
        }
      } catch (error) {
        console.log('OG100 counter not yet initialized, showing default');
      } finally {
        setLoading(false);
      }
    };
    loadCounter();
  }, []);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const user = await base44.auth.me();
      if (!user) {
        toast.error('Please sign in first');
        return;
      }

      const currentRemaining = await base44.sql('SELECT value FROM app_settings WHERE key = $1', ['og100_spots_remaining']);
      const spotsLeft = parseInt(currentRemaining[0]?.value || '100');

      if (spotsLeft <= 0) {
        toast.error('All spots have been claimed!');
        return;
      }

      const ogNumber = 100 - spotsLeft + 1;

      await base44.sql('UPDATE app_settings SET value = $1 WHERE key = $2', [String(spotsLeft - 1), 'og100_spots_remaining']);

      await base44.sql(
        'INSERT INTO founding_members (user_id, og_number, claimed_at) VALUES ($1, $2, NOW()) ON CONFLICT (user_id) DO NOTHING',
        [user.id, ogNumber]
      );

      setRemaining(spotsLeft - 1);
      toast.success(`You are OG #${ogNumber}! Welcome to the founding members.`);

      if (onClaim) onClaim();
    } catch (error) {
      console.error('Claim error:', error);
      toast.error('Failed to claim spot');
    } finally {
      setClaiming(false);
    }
  };

  if (remaining <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(10, 22, 52, 0.75)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(14,200,220,0.22)',
          boxShadow: '0 0 40px rgba(14,200,220,0.08), 0 12px 40px rgba(0,0,0,0.45)',
        }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(14,200,220,0.07)' }} />
        {/* top accent line */}
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, rgba(14,200,220,0.7) 0%, rgba(14,200,220,0.2) 50%, transparent 100%)' }} />

        <div className="relative p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: '#0ec8dc' }} />
              <h3 className="text-base font-black text-white">FOUNDING MEMBER OFFER</h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(14,200,220,0.15)', color: 'rgb(100,220,240)', border: '1px solid rgba(14,200,220,0.3)' }}>
              NEW
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#0ec8dc' }} />
            <p className="text-sm font-bold text-white">
              {remaining} of 100 spots remaining
            </p>
          </div>

          <div className="space-y-2 text-sm" style={{ color: 'rgba(180,210,240,0.7)' }}>
            <p className="font-bold text-white">First 100 members get:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span style={{ color: '#0ec8dc' }}>•</span>
                <span>Elite FREE for 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#0ec8dc' }}>•</span>
                <span>Then Elite for 89 SEK forever <span style={{ color: 'rgba(180,210,240,0.4)' }}>(normally 179 SEK/month)</span></span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#0ec8dc' }}>•</span>
                <span>OG Founding Member badge</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: '#0ec8dc' }}>•</span>
                <span>Personal referral link</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/Upgrade')}
            disabled={claiming || loading}
            className="w-full font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 tap-feedback"
            style={{
              background: 'linear-gradient(135deg, rgba(14,200,220,0.9), rgba(8,160,185,0.9))',
              color: '#040d1e',
              boxShadow: '0 4px 20px rgba(14,200,220,0.25)',
            }}
          >
            {claiming ? 'CLAIMING...' : 'CLAIM YOUR SPOT'} <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}