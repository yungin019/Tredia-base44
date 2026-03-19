import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, ChevronRight, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';

// Context-aware prompts per page (will use i18n keys)
const PAGE_CONTEXT_KEYS = {
  '/Home': {
    greeting: 'ai.homeGreeting',
    intro: 'ai.homeIntro',
    suggestions: ['ai.suggest1', 'ai.suggest2', 'ai.suggest3', 'ai.suggest4'],
  },
  '/Markets': {
    greeting: 'ai.marketsGreeting',
    intro: 'ai.marketsIntro',
    suggestions: ['ai.mktSuggest1', 'ai.mktSuggest2', 'ai.mktSuggest3', 'ai.mktSuggest4'],
  },
  '/PaperTrading': {
    greeting: 'ai.ptGreeting',
    intro: 'ai.ptIntro',
    suggestions: ['ai.ptSuggest1', 'ai.ptSuggest2', 'ai.ptSuggest3', 'ai.ptSuggest4'],
  },
  '/Portfolio': {
    greeting: 'ai.pfGreeting',
    intro: 'ai.pfIntro',
    suggestions: ['ai.pfSuggest1', 'ai.pfSuggest2', 'ai.pfSuggest3', 'ai.pfSuggest4'],
  },
  '/AIInsights': {
    greeting: 'ai.aiGreeting',
    intro: 'ai.aiIntro',
    suggestions: ['ai.aiSuggest1', 'ai.aiSuggest2', 'ai.aiSuggest3', 'ai.aiSuggest4'],
  },
  '/Trade': {
    greeting: 'ai.tradeGreeting',
    intro: 'ai.tradeIntro',
    suggestions: ['ai.tradeSuggest1', 'ai.tradeSuggest2', 'ai.tradeSuggest3', 'ai.tradeSuggest4'],
  },
  default: {
    greeting: 'ai.defaultGreeting',
    intro: 'ai.defaultIntro',
    suggestions: ['ai.defSuggest1', 'ai.defSuggest2', 'ai.defSuggest3', 'ai.defSuggest4'],
  },
};

// Asset detail context (dynamic with symbol)
const getAssetContextKeys = (symbol) => ({
  greeting: 'ai.assetGreeting',
  symbolForGreeting: symbol,
  intro: 'ai.assetIntro',
  symbolForIntro: symbol,
  suggestions: ['ai.assetSuggest1', 'ai.assetSuggest2', 'ai.assetSuggest3', 'ai.assetSuggest4'],
  symbolsForSuggests: [symbol, symbol, symbol, symbol],
});

function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="h-3 w-3 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground font-medium'
            : 'bg-white/[0.06] border border-white/[0.08] text-white/80'
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

export default function TrediaAssistant() {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [proactiveShown, setProactiveShown] = useState(false);
  const [showProactiveBubble, setShowProactiveBubble] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Get context for current page
  const getContext = () => {
    const path = location.pathname;
    const keysOrData = path.startsWith('/Asset/') 
      ? getAssetContextKeys(path.split('/Asset/')[1])
      : PAGE_CONTEXT_KEYS[path] || PAGE_CONTEXT_KEYS.default;
    
    // Translate keys to actual strings
    const greeting = typeof keysOrData.greeting === 'string' && keysOrData.greeting.startsWith('ai.')
      ? (keysOrData.symbolForGreeting ? t(keysOrData.greeting, { symbol: keysOrData.symbolForGreeting }) || keysOrData.greeting : t(keysOrData.greeting) || keysOrData.greeting)
      : keysOrData.greeting;
    const intro = typeof keysOrData.intro === 'string' && keysOrData.intro.startsWith('ai.')
      ? (keysOrData.symbolForIntro ? t(keysOrData.intro, { symbol: keysOrData.symbolForIntro }) || keysOrData.intro : t(keysOrData.intro) || keysOrData.intro)
      : keysOrData.intro;
    const suggestions = keysOrData.suggestions.map((key, idx) => {
      if (typeof key === 'string' && key.startsWith('ai.')) {
        const symbol = keysOrData.symbolsForSuggests?.[idx];
        const translated = symbol ? t(key, { symbol }) : t(key);
        // Fallback: if translation key is returned instead of translated text, return key
        return translated && !translated.startsWith('ai.') ? translated : key;
      }
      return key;
    });
    
    return { greeting, intro, suggestions };
  };

  const ctx = getContext();

  // Show proactive bubble after 3 seconds on key pages
  useEffect(() => {
    const keyPages = ['/PaperTrading', '/Portfolio', '/AIInsights', '/Markets', '/Home'];
    const isKeyPage = keyPages.some(p => location.pathname.startsWith(p));

    if (isKeyPage && !open) {
      setProactiveShown(false);
      const t = setTimeout(() => {
        setShowProactiveBubble(true);
        setProactiveShown(true);
      }, 3000);
      return () => clearTimeout(t);
    }
    setShowProactiveBubble(false);
  }, [location.pathname]);

  // Hide bubble when chat opens
  useEffect(() => {
    if (open) setShowProactiveBubble(false);
  }, [open]);

  // Reset messages when page changes
  useEffect(() => {
    if (!open) {
      setMessages([]);
    }
  }, [location.pathname]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const openWithGreeting = () => {
    setOpen(true);
    setShowProactiveBubble(false);
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `${ctx.intro}\n\n${t('ai.askOrPick')}`,
      }]);
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');

    const pageLabel = location.pathname.replace('/', '') || 'Home';
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const systemPrompt = `You are TREDIA AI, a friendly and knowledgeable trading mentor inside the TREDIA app. 
The user is currently on the "${pageLabel}" page.
Page context: ${ctx.intro}

Your role:
- Be a supportive mentor, not a financial advisor
- Explain concepts simply, no jargon
- Guide users step by step
- Always suggest a clear next action
- Be encouraging and positive
- Keep responses concise (2-4 sentences max unless explaining something complex)
- Never give specific financial advice or price targets
- Focus on education and confidence-building

Always end with a suggested next action or follow-up question.`;

      const history = newMessages.map(m => `${m.role === 'user' ? 'User' : 'TREDIA AI'}: ${m.content}`).join('\n');

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nConversation:\n${history}\n\nTREDIA AI:`,
      });

      const reply = typeof res === 'string' ? res : res?.text || res?.content || "I'm here to help! What would you like to know?";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a moment — please try again. In the meantime, feel free to explore and I'll be here when you need me!",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Proactive bubble */}
      <AnimatePresence>
        {showProactiveBubble && !open && (
          <motion.button
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            onClick={openWithGreeting}
            className="fixed bottom-28 right-4 z-40 max-w-[220px] text-left rounded-2xl px-4 py-3 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #111118)',
              border: '1px solid rgba(245,158,11,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(245,158,11,0.08)',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-wide">TREDIA AI</span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowProactiveBubble(false); }}
                className="ml-auto text-white/30 hover:text-white/60"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="text-[11px] text-white/70 leading-snug">{ctx.greeting}</p>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-primary/70 font-bold">
              {t('common.live')} <ChevronRight className="h-3 w-3" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={openWithGreeting}
            className="fixed bottom-20 right-4 z-40 h-13 w-13 rounded-full flex items-center justify-center shadow-2xl"
            style={{
              width: 52, height: 52,
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              boxShadow: '0 4px 24px rgba(245,158,11,0.4), 0 0 40px rgba(245,158,11,0.15)',
            }}
          >
            <Sparkles className="h-5 w-5 text-black" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
            className="fixed bottom-4 right-4 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: 'min(380px, calc(100vw - 32px))',
              height: 'min(560px, calc(100vh - 96px))',
              background: '#0f0f1a',
              border: '1px solid rgba(245,158,11,0.2)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(245,158,11,0.06)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), transparent)' }}>
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-black text-white/90">TREDIA AI</p>
                <div className="flex items-center gap-1.5">
                       <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
                       <span className="text-[10px] text-white/35">{t('ai.mentor')}</span>
                     </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all">
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => <Message key={i} msg={msg} />)}
              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {ctx.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition-all"
                    style={{
                      background: 'rgba(245,158,11,0.08)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: 'rgba(245,158,11,0.8)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-white/[0.06] flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={t('ai.askPlaceholder')}
                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[12px] text-white/80 placeholder:text-white/25 outline-none focus:border-primary/40 transition-colors"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
              >
                <Send className="h-4 w-4 text-black" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}