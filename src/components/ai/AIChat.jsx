import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, RotateCcw, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { askTrek } from '@/api/trek';
import { buildMarketContext } from '@/api/marketContext';
import { base44 } from '@/api/base44Client';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import QueryLimitModal from './QueryLimitModal';
import TrekResponseRenderer from './TrekResponseRenderer';
import SuperAIPanel from './SuperAIPanel';

const SUGGESTED_KEYS = [
  'trek.suggest1',
  'trek.suggest2',
  'trek.suggest3',
  'trek.suggest4',
  'trek.suggest5',
  'trek.suggest6',
];

function TrekAvatar({ size = 5 }) {
  const px = size * 4;
  return (
    <div
      className="rounded-md flex items-center justify-center flex-shrink-0"
      style={{
        height: px, width: px,
        background: 'rgba(245,158,11,0.12)',
        border: '1px solid rgba(245,158,11,0.25)',
      }}
    >
      <span className="text-[10px] font-black" style={{ color: '#F59E0B' }}>T</span>
    </div>
  );
}

const QUERY_LIMIT_KEY = 'trek_daily_queries';
const QUERY_LIMIT_DATE_KEY = 'trek_query_date';
const FREE_LIMIT = 5;

function getQuestionsToday() {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem(QUERY_LIMIT_DATE_KEY);
  if (storedDate !== today) {
    localStorage.setItem(QUERY_LIMIT_DATE_KEY, today);
    localStorage.setItem(QUERY_LIMIT_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(QUERY_LIMIT_KEY) || '0', 10);
}

function incrementQuestions() {
  const today = new Date().toDateString();
  localStorage.setItem(QUERY_LIMIT_DATE_KEY, today);
  const current = getQuestionsToday();
  const next = current + 1;
  localStorage.setItem(QUERY_LIMIT_KEY, next.toString());
  return next;
}

export default function AIChat() {
  const { t } = useTranslation();
  const { tier } = useSubscriptionStatus();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [marketContext, setMarketContext] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [questionsToday, setQuestionsToday] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const bottomRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    setQuestionsToday(getQuestionsToday());
  }, []);

  useEffect(() => {
    buildMarketContext().then(setMarketContext).catch(() => {});
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    
    // Enforce FREE tier limit (5 questions/day)
    if (tier === 'free' && questionsToday >= FREE_LIMIT) {
      setShowLimitModal(true);
      return;
    }
    
    setInput('');
    setError(null);
    historyRef.current = [...historyRef.current, { role: 'user', content: q }];
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    
    const nextCount = incrementQuestions();
    setQuestionsToday(nextCount);
    
    try {
      const reply = await askTrek(historyRef.current, marketContext, currentUser);
      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }];
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    } catch (e) {
      setError(t('trek.unavailable'));
    }
    setLoading(false);
  };

  const handleClear = () => {
    setMessages([]);
    historyRef.current = [];
    setError(null);
  };

  return (
    <>
      <QueryLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
      <div className="rounded-xl border border-primary/20 bg-[#0e0e16] overflow-hidden flex flex-col glow-gold h-full" style={{ minHeight: 320 }}>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
        <TrekAvatar size={6} />
        <span className="text-[11px] font-bold text-white/80">{t('trek.askTrek')}</span>
        <span className="text-[9px] font-mono font-bold text-primary/50 px-1.5 py-0.5 rounded border border-primary/15 ml-1 tracking-wider" style={{ background: 'rgba(245,158,11,0.05)' }}>GPT-4o · LIVE</span>
        {messages.length > 0 && (
          <button onClick={handleClear} className="ml-auto flex items-center gap-1 text-[9px] text-white/25 hover:text-white/50 transition-colors">
            <RotateCcw className="h-3 w-3" /> {t('common.clear')}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-28 gap-2">
            <Sparkles className="h-6 w-6 text-primary/30" />
            <>
              <p className="text-[11px] text-white/20 text-center">{t('trek.askAbout')}</p>
               <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                 {SUGGESTED_KEYS.map(key => (
                   <button
                     key={key}
                     onClick={() => send(t(key))}
                     className="text-[9px] text-white/35 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] px-2 py-1 rounded-lg transition-colors"
                   >
                     {t(key)}
                   </button>
                 ))}
               </div>
            </>
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="mr-2 mt-0.5">
                  <TrekAvatar size={5} />
                </div>
              )}
              <div className={`max-w-[88%] rounded-xl px-3 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-primary/15 border border-primary/25 text-white/85 text-[11px] font-medium leading-relaxed'
                  : 'bg-white/[0.04] border border-white/[0.07]'
              }`}>
                {msg.role === 'ai' ? (
                  <TrekResponseRenderer content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <TrekAvatar size={5} />
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2">
              <div className="flex gap-1 items-center">
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} style={{ color: '#F59E0B' }}>●</motion.span>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} style={{ color: '#F59E0B' }}>●</motion.span>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} style={{ color: '#F59E0B' }}>●</motion.span>
              </div>
              <span className="text-[10px] text-white/30">{t('trek.analyzing')}</span>
            </div>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-400/70 text-center py-1">
            {error}
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input - Sticky Bottom */}
      <div className="sticky bottom-0 px-4 py-3 border-t border-white/[0.05] bg-[#0e0e16] safe-bottom">
        {tier === 'free' && (
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 8, background: 'rgba(245,158,11,0.1)', borderRadius: 6, padding: '6px' }}>
            {questionsToday}/{FREE_LIMIT} {t('trek.questionsLeft')}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder={t('trek.askAboutAnything')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && send()}
            disabled={tier === 'free' && questionsToday >= FREE_LIMIT}
            className="bg-white/[0.04] border-white/[0.07] h-9 text-[12px] text-white/80 placeholder:text-white/20 focus:border-primary/40 disabled:opacity-50"
          />
          <Button
            onClick={() => send()}
            disabled={loading || !input.trim() || (tier === 'free' && questionsToday >= FREE_LIMIT)}
            size="sm"
            className="h-9 px-3 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 8 }}>
          ⚡ {t('trek.disclaimer')}
        </p>
      </div>
    </div>
    </>
  );
}