import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function AlpacaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError('Authorization was denied or failed');
        setTimeout(() => navigate('/Settings'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        setTimeout(() => navigate('/Settings'), 3000);
        return;
      }

      try {
        setStatus('connecting');

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/alpacaAccount`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              action: 'exchange_token',
              code,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to exchange authorization code');
        }

        const { access_token, refresh_token } = await response.json();

        setStatus('fetching');

        const accountResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/alpacaAccount`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              action: 'get_account',
              alpaca_token: access_token,
            }),
          }
        );

        if (!accountResponse.ok) {
          throw new Error('Failed to fetch account details');
        }

        const accountData = await accountResponse.json();

        const positionsResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/alpacaAccount`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              action: 'get_positions',
              alpaca_token: access_token,
            }),
          }
        );

        let positions = [];
        if (positionsResponse.ok) {
          positions = await positionsResponse.json();
        }

        await base44.auth.updateMe({
          alpaca_connected: true,
          alpaca_token: access_token,
          alpaca_refresh_token: refresh_token,
          alpaca_buying_power: parseFloat(accountData.buying_power || 0),
          alpaca_position_count: positions.length || 0,
          alpaca_daily_pnl: parseFloat(accountData.equity || 0) - parseFloat(accountData.last_equity || accountData.equity || 0),
          alpaca_positions: JSON.stringify(positions),
        });

        setStatus('success');

        setTimeout(() => {
          navigate('/trek-portfolio-welcome', {
            state: {
              positions,
              accountData,
            },
          });
        }, 1500);
      } catch (err) {
        console.error('Alpaca OAuth error:', err);
        setStatus('error');
        setError(err.message || 'Failed to connect to Alpaca');
        setTimeout(() => navigate('/Settings'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6"
      >
        <div className="inline-block mb-4">
          <div className="text-4xl font-black tracking-[0.4em] text-[#F59E0B]">TREDIO</div>
        </div>

        {status === 'connecting' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-[#F59E0B]/20 border-t-[#F59E0B] rounded-full mx-auto"
            />
            <p className="text-lg font-bold text-white">Opening Alpaca securely...</p>
          </>
        )}

        {status === 'fetching' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-[#F59E0B]/20 border-t-[#F59E0B] rounded-full mx-auto"
            />
            <p className="text-lg font-bold text-white">Connecting your account...</p>
            <p className="text-sm text-white/50">Fetching your portfolio data...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="w-16 h-16 rounded-full bg-[#22c55e]/20 border-2 border-[#22c55e] flex items-center justify-center mx-auto"
            >
              <svg className="w-8 h-8 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <p className="text-lg font-bold text-white">Connected successfully!</p>
            <p className="text-sm text-white/50">Preparing TREK analysis...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-[#ef4444]/20 border-2 border-[#ef4444] flex items-center justify-center mx-auto"
            >
              <svg className="w-8 h-8 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
            <p className="text-lg font-bold text-white">Connection failed</p>
            <p className="text-sm text-white/50">{error}</p>
            <p className="text-xs text-white/30">Redirecting back...</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
