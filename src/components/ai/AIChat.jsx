import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, RotateCcw } from 'lucide-react';

// TREK gold avatar
function TrekAvatar({ size = 5 }) {
  return (
    <div
      className={`h-${size} w-${size} rounded-md flex items-center justify-center flex-shrink-0`}
      style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}
    >
      <span className="text-[10px] font-black" style={{ color: '#F59E0B' }}>T</span>
    </div>
  );
}
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { askTrek } from '@/api/trek';

const SUGGESTED = [
  'Is NVDA overbought?',
  'Fed rate outlook 2025',
  'Best sectors for Q2',
  'Bitcoin next resistance',
  'Explain VIX spike',
  'Top defensive plays',
];



export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  // Keep anthropic-format history for context
  const historyRef = useRef([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setError(null);
    historyRef.current = [...historyRef.current, { role: 'user', content: q }];
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    const reply = await askTrek(historyRef.current);
    historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }];
    setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    setLoading(false);
  };

  const clear = () => {
    setMessages([]);
    historyRef.current = [];
    setError(null);
  };



  return (
    <div className="rounded-xl border border-primary/20 bg-[#0e0e16] overflow-hidden flex flex-col glow-gold" style={{ minHeight: 320 }}>
      {/* Top gold line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
        <TrekAvatar size={6} />
        <span className="text-[11px] font-bold text-white/80">Ask TREK</span>
        <span className="text-[9px] font-mono font-bold text-primary/50 bg-primary/8 px-1.5 py-0.5 rounded border border-primary/15 ml-1 tracking-wider">CLAUDE · LIVE</span>
        {messages.length > 0 && (
          <button onClick={clear} className="ml-auto flex items-center gap-1 text-[9px] text-white/25 hover:text-white/50 transition-colors">
            <RotateCcw className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-72">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-28 gap-2">
            <Sparkles className="h-6 w-6 text-primary/30" />
            <p className="text-[11px] text-white/20 text-center">Ask anything about markets, stocks, or strategies</p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
              {SUGGESTED.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[9px] text-white/35 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] px-2 py-1 rounded-lg transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
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
                <div className="h-5 w-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  <Brain className="h-3 w-3 text-primary" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary/15 border border-primary/25 text-white/85 font-medium'
                  : 'bg-white/[0.04] border border-white/[0.07] text-white/65'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Brain className="h-3 w-3 text-primary" />
            </div>
            <div className="flex gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2">
              {[0,1,2].map(i => (
                <div key={i} className="h-1 w-1 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.05]">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about any stock, strategy, or macro event..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && send()}
            className="bg-white/[0.04] border-white/[0.07] h-9 text-[12px] text-white/80 placeholder:text-white/20 focus:border-primary/40"
          />
          <Button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            size="sm"
            className="h-9 px-3 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}