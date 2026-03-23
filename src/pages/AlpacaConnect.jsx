import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Bell, Shield, AlertTriangle } from 'lucide-react';

const CLIENT_ID = import.meta.env.VITE_ALPACA_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_ALPACA_REDIRECT_URI || 'https://tredio.app/alpaca-callback';

const FEATURES = [
  { Icon: Zap, title: 'TREK analyzes your real positions', desc: 'AI-powered insights for what you actually hold', color: '#F59E0B' },
  { Icon: BarChart3, title: 'Personalized signals for your holdings', desc: 'Every signal tailored to your actual portfolio', color: '#3b82f6' },
  { Icon: Bell, title: 'Alerts when YOUR stocks hit key levels', desc: 'Never miss critical moves on your positions', color: '#22c55e' },
];

export default function AlpacaConnect() {
  const navigate = useNavigate();
  const oauthConfigured = !!CLIENT_ID;

  const handleConnect = () => {
    if (!oauthConfigured) return;
    const scope = encodeURIComponent('account:write trading');
    const redirectUri = encodeURIComponent(REDIRECT_URI);
    const authUrl = `https://app.alpaca.markets/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-3xl font-black tracking-[0.3em] text-[#F59E0B] mb-2">TREDIO</div>
          <h1 className="text-2xl font-black text-white mb-1">Connect your broker</h1>
          <p className="text-sm text-white/40">
            Brokerage provided by <span className="text-white/60 font-semibold">Alpaca Markets</span>
          </p>
        </div>

        {/* Broker Disclosure */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-[#F59E0B] mb-1">Broker Disclosure</p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                TREDIO does not hold client funds or act as a broker.
                Brokerage services, execution, and account custody are provided by Alpaca Securities LLC, member FINRA/SIPC.
              </p>
            </div>
          </div>
        </div>

        {/* Feature bullets */}
        <div className="space-y-3">
          {FEATURES.map(({ Icon, title, desc, color }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg flex-shrink-0" style={{ background: `${color}15` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Blocked state if OAuth not configured */}
        {!oauthConfigured && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-red-400 mb-0.5">OAuth Not Configured</p>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  VITE_ALPACA_CLIENT_ID is not set. The admin must configure the Alpaca OAuth application and set this environment variable before users can connect.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="space-y-2">
          <motion.button
            whileHover={oauthConfigured ? { scale: 1.02 } : {}}
            whileTap={oauthConfigured ? { scale: 0.98 } : {}}
            onClick={handleConnect}
            disabled={!oauthConfigured}
            className="w-full py-4 rounded-xl font-black text-base tracking-wide transition-all text-white disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: oauthConfigured ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'rgba(255,255,255,0.08)' }}
          >
            {oauthConfigured ? 'CONNECT WITH ALPACA →' : 'OAUTH NOT CONFIGURED'}
          </motion.button>

          <a
            href="https://alpaca.markets/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-sm border border-white/[0.1] text-white/60 hover:border-white/20 transition-colors"
          >
            Open an Alpaca account (new users)
          </a>

          <button
            onClick={() => navigate('/Home')}
            className="w-full py-2.5 text-sm text-white/30 hover:text-white/50 transition-colors"
          >
            Stay in Practice Mode
          </button>
        </div>

        <p className="text-[10px] text-white/20 text-center leading-relaxed">
          By connecting, you authorize TREDIO to read your Alpaca account information and submit orders on your behalf via Alpaca's API. You can disconnect at any time in Settings.
        </p>
      </motion.div>
    </div>
  );
}