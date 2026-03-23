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
        setError('Authorization was denied or cancelled.');
        setTimeout(() => navigate('/Settings'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received from Alpaca.');
        setTimeout(() => navigate('/Settings'), 3000);
        return;
      }

      try {
        setStatus('connecting');

        // Exchange code via Base44 backend function (secrets never touch frontend)
        const tokenRes = await base44.functions.invoke('alpacaOAuth', {
          action: 'exchange_token',
          code,
        });

        if (tokenRes.data?.blocked) {
          setStatus('error');
          setError('Alpaca OAuth is not yet configured. Please contact support.');
          setTimeout(() => navigate('/Settings'), 4000);
          return;
        }

        if (tokenRes.data?.error) throw new Error(tokenRes.data.error);

        const { access_token, refresh_token } = tokenRes.data;

        setStatus('fetching');

        // Fetch account + positions using the user's OAuth token (via backend)
        const [accountRes, positionsRes] = await Promise.all([
          base44.functions.invoke('alpacaOAuth', { action: 'get_account', alpaca_token: access_token }),
          base44.functions.invoke('alpacaOAuth', { action: 'get_positions', alpaca_token: access_token }),
        ]);

        if (accountRes.data?.error) throw new Error(accountRes.data.error);

        const accountData = accountRes.data;
        const positions = Array.isArray(positionsRes.data) ? positionsRes.data : [];

        // Persist to user profile — never expose tokens in client state beyond this
        await base44.auth.updateMe({
          alpaca_connected: true,
          broker_status: 'connected',
          trading_mode: 'live',
          alpaca_token: access_token,
          alpaca_refresh_token: refresh_token,
          alpaca_buying_power: parseFloat(accountData.buying_power || 0),
          alpaca_position_count: positions.length,
          alpaca_daily_pnl: parseFloat(accountData.equity || 0) - parseFloat(accountData.last_equity || accountData.equity || 0),
          alpaca_positions: JSON.stringify(positions.slice(0, 50)), // cap size
        });

        setStatus('success');

        setTimeout(() => {
          navigate('/trek-portfolio-welcome', { state: { positions, accountData } });
        }, 1500);

      } catch (err) {
        console.error('Alpaca OAuth error:', err);
        setStatus('error');
        setError(err.message || 'Failed to connect to Alpaca.');
        // Mark broker as error state
        base44.auth.updateMe({ broker_status: 'error' }).catch(() => {});
        setTimeout(() => navigate('/Settings'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 max-w-sm w-full">
        <div className="text-3xl font-black tracking-[0.3em] text-[#F59E0B] mb-2">TREDIO</div>

        {(status === 'connecting' || status === 'fetching') && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-[#F59E0B]/20 border-t-[#F59E0B] rounded-full mx-auto"
            />
            <div>
              <p className="text-lg font-bold text-white">
                {status === 'connecting' ? 'Connecting securely...' : 'Loading your portfolio...'}
              </p>
              <p className="text-sm text-white/40 mt-1">
                {status === 'connecting' ? 'Exchanging credentials with Alpaca' : 'Fetching your positions and account data'}
              </p>
            </div>
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
            <div>
              <p className="text-lg font-bold text-white">Broker connected!</p>
              <p className="text-sm text-white/50 mt-1">TREK can now analyze your real portfolio.</p>
            </div>
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
            <div>
              <p className="text-lg font-bold text-white">Connection failed</p>
              <p className="text-sm text-white/50 mt-1">{error}</p>
              <p className="text-xs text-white/25 mt-2">Redirecting to Settings...</p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}