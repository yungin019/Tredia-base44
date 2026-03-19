import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, ChevronRight } from 'lucide-react';

/**
 * ContextBanner — shown once per screen visit (localStorage-gated).
 * Props:
 *   storageKey: string (unique per screen)
 *   title: string
 *   body: string
 *   steps?: string[]
 *   actions?: { label: string, onClick: () => void }[]
 *   onAskAI?: (question: string) => void
 *   aiQuestion?: string  (question to send to AI when CTA clicked)
 */
export default function ContextBanner({
  storageKey,
  title,
  body,
  steps,
  actions = [],
  onAskAI,
  aiQuestion,
  color = '#F59E0B',
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(`tredia_banner_${storageKey}`);
    if (!seen) setVisible(true);
  }, [storageKey]);

  const dismiss = () => {
    localStorage.setItem(`tredia_banner_${storageKey}`, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-xl overflow-hidden mb-1"
          style={{
            background: `linear-gradient(135deg, rgba(15,15,26,0.95), #111118)`,
            border: `1px solid ${color}30`,
            borderLeft: `4px solid ${color}`,
          }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Sparkles className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.1em]" style={{ color }}>{t('home.contextTitle')}</span>
              </div>
              <button onClick={dismiss} className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0 mt-0.5">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <h3 className="text-[14px] font-black text-white/90 mb-1.5">{title}</h3>
            <p className="text-[12px] text-white/55 leading-relaxed mb-3">{body}</p>

            {steps && steps.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[11px] text-white/60">
                    <span className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                      style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {actions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => { a.onClick(); dismiss(); }}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: i === 0 ? color : 'rgba(255,255,255,0.06)',
                    color: i === 0 ? '#0A0A0F' : 'rgba(255,255,255,0.6)',
                    border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {a.label}
                  {i === 0 && <ChevronRight className="h-3 w-3" />}
                </button>
              ))}
              {onAskAI && aiQuestion && (
                <button
                  onClick={() => { onAskAI(aiQuestion); dismiss(); }}
                  className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                >
                  <Sparkles className="h-3 w-3" />
                   {t('trek.wow')}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}