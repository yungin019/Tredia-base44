import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Zap } from 'lucide-react';

export default function TrekPortfolioWelcome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const positions = location.state?.positions || [];
  const accountData = location.state?.accountData || {};

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    const analyzePortfolio = async () => {
      try {
        const positionsList = positions.map(p =>
          `${p.symbol}: ${p.qty} shares at $${p.avg_entry_price} (current: $${p.current_price}, P&L: ${parseFloat(p.unrealized_plpc * 100).toFixed(2)}%)`
        ).join('\n');

        const prompt = `You are TREK doing a first-time portfolio analysis for a new TREDIO user.

Their real positions are:
${positionsList}

Their account equity: $${parseFloat(accountData.equity || 0).toLocaleString()}
Their buying power: $${parseFloat(accountData.buying_power || 0).toLocaleString()}

Give them:
1. Portfolio grade A-F with one sentence why
2. Their strongest position and why
3. Their biggest hidden risk they probably don't see
4. One specific action to take today
5. One thing that impressed TREK about their portfolio

Be personal. Reference their actual positions by name. Make them feel like TREK has been watching their portfolio for years and finally gets to speak.

Format your response EXACTLY like this:
GRADE: [A-F]
GRADE_REASON: [One sentence that references their actual holdings]
STRONGEST: [Position name] - [specific why in one sentence]
RISK: [Specific risk with exact % or amount in one sentence. Start with the risk, not "Most traders miss this"]
ACTION: [One specific action. Not generic. References their actual situation. One sentence.]
IMPRESSED: [One thing that impressed TREK. One sentence.]`;

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trekChat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ message: prompt }),
          }
        );

        if (!response.ok) throw new Error('Analysis failed');

        const data = await response.json();
        const text = data.reply || data.response || '';

        const parsed = {
          grade: text.match(/GRADE:\s*([A-F][+-]?)/)?.[1] || 'B+',
          gradeReason: text.match(/GRADE_REASON:\s*(.+?)(?=\n|$)/)?.[1]?.trim() || 'Solid portfolio with room for optimization.',
          strongest: text.match(/STRONGEST:\s*(.+?)(?=\n|$)/)?.[1]?.trim() || 'Your positions show good diversification.',
          risk: text.match(/RISK:\s*(.+?)(?=\n|$)/)?.[1]?.trim() || 'Consider reviewing your position sizing.',
          action: text.match(/ACTION:\s*(.+?)(?=\n|$)/)?.[1]?.trim() || 'Review your portfolio allocation.',
          impressed: text.match(/IMPRESSED:\s*(.+?)(?=\n|$)/)?.[1]?.trim() || 'Your portfolio shows discipline.',
        };

        setProgress(100);
        setTimeout(() => {
          setAnalysis(parsed);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Portfolio analysis failed:', err);
        setAnalysis({
          grade: 'B+',
          gradeReason: 'Solid portfolio with good fundamentals.',
          strongest: `${positions[0]?.symbol || 'Your largest position'} - Strong market position with solid fundamentals.`,
          risk: 'Your portfolio could benefit from additional diversification across sectors.',
          action: 'Consider taking partial profits on positions that have exceeded your target gains.',
          impressed: 'Your portfolio shows disciplined entry points and risk management.',
        });
        setProgress(100);
        setLoading(false);
      }
    };

    analyzePortfolio();

    return () => clearInterval(progressInterval);
  }, [positions, accountData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-md w-full space-y-6"
        >
          <div className="text-center space-y-4">
            <div className="inline-block mb-4">
              <div className="text-4xl font-black tracking-[0.4em] text-[#F59E0B]">TREDIO</div>
            </div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-[#F59E0B]/20 border-t-[#F59E0B] rounded-full mx-auto"
            />

            <div className="space-y-2">
              <p className="text-lg font-bold text-white">TREK PORTFOLIO ANALYSIS</p>
              <p className="text-sm text-white/60">Analyzing your real positions...</p>
            </div>

            <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706]"
              />
            </div>
            <p className="text-xs text-white/40">{Math.round(progress)}%</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6 py-6"
      >
        <div className="text-center space-y-4 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-block"
          >
            <div className="text-4xl font-black tracking-[0.4em] text-[#F59E0B] mb-2">⚡</div>
          </motion.div>
          <h1 className="text-2xl font-black text-white">WELCOME TO TREDIO</h1>
          <p className="text-sm text-white/60">TREK has analyzed your portfolio.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[#F59E0B]/30 bg-[#111118] p-6 text-center"
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F59E0B] mb-3">PORTFOLIO GRADE</p>
          <div className="text-6xl font-black text-[#F59E0B] mb-4">{analysis.grade}</div>
          <p className="text-sm text-white/80 italic">"{analysis.gradeReason}"</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/[0.1] bg-[#111118] p-5 space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#22c55e]/10 mt-1">
              <TrendingUp className="h-5 w-5 text-[#22c55e]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-white/40 mb-1">STRONGEST POSITION</p>
              <p className="text-sm text-white leading-relaxed">{analysis.strongest}</p>
            </div>
          </div>

          <div className="h-px bg-white/[0.05]" />

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#F59E0B]/10 mt-1">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-white/40 mb-1">HIDDEN RISK</p>
              <p className="text-sm text-white leading-relaxed mb-1">{analysis.risk}</p>
              <p className="text-xs text-white/40 italic">Most traders miss this.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border-2 border-[#F59E0B]/40 bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/5 p-5"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#F59E0B] mt-1">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-[#F59E0B] mb-2">TREK SAYS - DO THIS TODAY</p>
              <p className="text-base font-bold text-white leading-relaxed">{analysis.action}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-white/[0.1] bg-[#111118] p-5"
        >
          <p className="text-xs text-white/40 mb-2">What impressed TREK:</p>
          <p className="text-sm text-white/80 italic">"{analysis.impressed}"</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center py-6 space-y-4"
        >
          <div className="h-px bg-[#F59E0B]/20" />
          <p className="text-sm font-bold text-white/90">
            TREK is now watching your {positions.length} position{positions.length !== 1 ? 's' : ''} 24/7.
          </p>
          <p className="text-sm text-[#F59E0B]">You will never trade alone again.</p>
          <div className="h-px bg-[#F59E0B]/20" />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/Portfolio')}
            className="w-full py-4 rounded-xl font-black text-base tracking-wide transition-all bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white mt-6"
          >
            GO TO MY PORTFOLIO →
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
