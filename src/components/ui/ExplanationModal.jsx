import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, TrendingUp } from 'lucide-react';

export default function ExplanationModal({ isOpen, onClose, title, explanation }) {
  if (!explanation) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card border-t border-white/10 max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6 pb-12">
              {/* What This Means */}
              {explanation.whatItMeans && (
                <div>
                  <h3 className="text-sm font-bold text-primary mb-2">What This Means</h3>
                  <p className="text-sm text-foreground leading-relaxed">{explanation.whatItMeans}</p>
                </div>
              )}

              {/* Why It's Happening */}
              {explanation.whyHappening && (
                <div>
                  <h3 className="text-sm font-bold text-primary mb-2">Why It's Happening</h3>
                  <p className="text-sm text-foreground leading-relaxed">{explanation.whyHappening}</p>
                </div>
              )}

              {/* What It Affects */}
              {explanation.whatItAffects && (
                <div>
                  <h3 className="text-sm font-bold text-primary mb-2">What It Affects</h3>
                  <div className="space-y-2">
                    {Array.isArray(explanation.whatItAffects) ? (
                      explanation.whatItAffects.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-foreground">{explanation.whatItAffects}</p>
                    )}
                  </div>
                </div>
              )}

              {/* TREK Interpretation */}
              {explanation.trekInterpretation && (
                <div className="bg-primary/10 border border-primary/25 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-lg">🤖</div>
                    <div>
                      <h4 className="text-sm font-bold text-primary mb-1">TREK's Take</h4>
                      <p className="text-sm text-foreground leading-relaxed">{explanation.trekInterpretation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* What a Smart Trader Might Do */}
              {explanation.whatToDoAboutIt && (
                <div>
                  <h3 className="text-sm font-bold text-accent mb-2">What to Consider</h3>
                  <p className="text-sm text-foreground leading-relaxed">{explanation.whatToDoAboutIt}</p>
                </div>
              )}

              {/* What to Watch */}
              {explanation.whatToWatchNext && (
                <div className="bg-warning/10 border border-warning/25 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-warning mb-1">Watch For</h4>
                      <p className="text-sm text-foreground leading-relaxed">{explanation.whatToWatchNext}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Risks */}
              {explanation.risks && (
                <div>
                  <h3 className="text-sm font-bold text-destructive mb-2">Key Risks</h3>
                  <p className="text-sm text-foreground leading-relaxed">{explanation.risks}</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}