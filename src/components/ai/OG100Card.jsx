import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export function OG100Card({ onClaim }) {
  const [remaining, setRemaining] = useState(100);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

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
      <Card
        className="relative overflow-hidden bg-gradient-to-br from-[#0D1117] to-[#1a1f2e] border-2"
        style={{
          borderColor: '#F59E0B',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)',
          animation: 'pulse-border 3s ease-in-out infinite'
        }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#F59E0B]/10 rounded-full blur-3xl" />

        <div className="relative p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="text-base font-black text-white">FOUNDING MEMBER OFFER</h3>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#FF3B3B] text-white">
              NEW
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF3B3B] animate-pulse" />
            <p className="text-sm font-bold text-white">
              {remaining} of 100 spots remaining
            </p>
          </div>

          <div className="space-y-2 text-sm text-white/80">
            <p className="font-bold text-white">First 100 members get:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-[#00D68F]">•</span>
                <span>Elite FREE for 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00D68F]">•</span>
                <span>Then Elite for 89 SEK forever <span className="text-white/50">(normally 179 SEK/month)</span></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00D68F]">•</span>
                <span>OG Founding Member badge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00D68F]">•</span>
                <span>Personal referral link</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleClaim}
            disabled={claiming || loading}
            className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold h-12 disabled:opacity-50"
          >
            {claiming ? 'CLAIMING...' : 'CLAIM YOUR SPOT'} <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </Card>

      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.2);
          }
          50% {
            box-shadow: 0 0 40px rgba(245, 158, 11, 0.4);
          }
        }
      `}</style>
    </motion.div>
  );
}
