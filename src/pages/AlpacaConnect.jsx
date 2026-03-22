import { motion } from 'framer-motion';
import { Zap, BarChart3, Bell } from 'lucide-react';

export default function AlpacaConnect() {
  const handleConnect = () => {
    const clientId = import.meta.env.VITE_ALPACA_CLIENT_ID;
    const redirectUri = encodeURIComponent(import.meta.env.VITE_ALPACA_REDIRECT_URI || 'https://tredio.app/alpaca-callback');
    const scope = encodeURIComponent('account:write trading');

    const authUrl = `https://app.alpaca.markets/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="text-4xl font-black tracking-[0.4em] text-[#F59E0B]">TREDIO</div>
          </div>

          <h1 className="text-2xl font-black text-white mb-4">Connect your trading account</h1>

          <div className="space-y-4 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-3 text-left"
            >
              <div className="mt-1 p-2 rounded-lg bg-[#F59E0B]/10">
                <Zap className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">TREK analyzes your real positions</p>
                <p className="text-xs text-white/50">AI-powered insights for what YOU actually hold</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3 text-left"
            >
              <div className="mt-1 p-2 rounded-lg bg-[#F59E0B]/10">
                <BarChart3 className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Personalized signals for your holdings</p>
                <p className="text-xs text-white/50">Every signal tailored to your actual portfolio</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3 text-left"
            >
              <div className="mt-1 p-2 rounded-lg bg-[#F59E0B]/10">
                <Bell className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Alerts when YOUR stocks hit key levels</p>
                <p className="text-xs text-white/50">Never miss critical moves on your positions</p>
              </div>
            </motion.div>
          </div>

          <p className="text-sm text-white/50 mb-6">
            Opens Alpaca securely. Takes 30 seconds.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConnect}
            className="w-full py-4 rounded-xl font-black text-base tracking-wide transition-all bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white mb-4"
          >
            CONNECT WITH ALPACA →
          </motion.button>

          <button
            onClick={() => window.history.back()}
            className="text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Not now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
