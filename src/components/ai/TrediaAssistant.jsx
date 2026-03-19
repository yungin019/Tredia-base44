import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, ChevronRight, Minimize2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';

// Context-aware prompts per page
const PAGE_CONTEXT = {
  '/Home': {
    greeting: "What should I focus on today?",
    intro: "I'm tracking the market for you. Alerts are ranked by urgency — the top ones need your attention now.",
    suggestions: [
      "What should I focus on today?",
      "Explain the top alert",
      "Where is the best opportunity right now?",
      "Is the market bullish or bearish today?",
    ],
  },
  '/Markets': {
    greeting: "Want me to find opportunities?",
    intro: "These are live market prices. Tap any asset to get a full analysis. I can help you spot opportunities.",
    suggestions: [
      "Find the best opportunity right now",
      "Explain what TREK grades mean",
      "What's moving the market today?",
      "Which sector is strongest?",
    ],
  },
  '/PaperTrading': {
    greeting: "Want me to guide your first trade?",
    intro: "Paper trading lets you practice with virtual money — no real risk. I'll walk you through each step.",
    suggestions: [
      "Guide me through my first trade",
      "What asset should I start with?",
      "Explain the difference between buy and sell",
      "How do I manage risk?",
    ],
  },
  '/Portfolio': {
    greeting: "Want me to analyze your portfolio?",
    intro: "Your portfolio shows all your positions. I can explain your P&L, risk level, and what to do next.",
    suggestions: [
      "Analyze my portfolio",
      "Explain my P&L",
      "Am I too concentrated in one sector?",
      "What should I add or remove?",
    ],
  },
  '/AIInsights': {
    greeting: "Want me to explain these signals?",
    intro: "These are AI-generated trading signals based on real market data. I'll explain what each one means.",
    suggestions: [
      "Explain the strongest signal",
      "What does a BUY signal mean?",
      "How confident should I be in these?",
      "Show me the best risk/reward setup",
    ],
  },
  '/Trade': {
    greeting: "Need help placing a trade?",
    intro: "I can explain how to place a trade, what price to target, and how to manage risk properly.",
    suggestions: [
      "How do I place my first trade?",
      "Explain stop loss and take profit",
      "What position size should I use?",
      "What's the risk on this trade?",
    ],
  },
  default: {
    greeting: "How can I help you?",
    intro: "I'm TREDIA AI — your personal trading mentor. Ask me anything about markets, trading, or this screen.",
    suggestions: [
      "What should I do first?",
      "Explain how this works",
      "Where should I start?",
      "What is TREK?",
    ],
  },
};

// Asset detail context
const getAssetContext = (symbol) => ({
  greeting: `Want me to analyze ${symbol}?`,
  intro: `I can explain ${symbol}'s price movement, what the signals mean, and whether this fits your strategy.`,
  suggestions: [
    `What is the trend for ${symbol}?`,
    `Explain the TREK signal for ${symbol}`,
    `Is this a good time to buy ${symbol}?`,
    `What are the risks with ${symbol}?`,
  ],
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
    if (path.startsWith('/Asset/')) {
      const symbol = path.split('/Asset/')[1];
      return getAssetContext(symbol);
    }
    return PAGE_CONTEXT[path] || PAGE_CONTEXT.default;
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
        content: `${ctx.intro}\n\nYou can ask me anything below, or pick a quick question:`,
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
              Tap to chat <ChevronRight className="h-3 w-3" />
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
                  <span className="text-[10px] text-white/35">Your personal trading mentor</span>
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
                placeholder="Ask TREDIA AI anything..."
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