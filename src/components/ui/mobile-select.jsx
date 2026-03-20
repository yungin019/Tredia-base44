import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export default function MobileSelect({
  trigger,
  options = [],
  value,
  onChange,
  title = "Select an option"
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#111118] rounded-t-3xl border-t border-white/[0.08] shadow-2xl max-h-[75vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/[0.08] flex-shrink-0">
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">{title}</h3>
              </div>

              {/* Options */}
              <div className="overflow-y-auto flex-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-b-0"
                    style={{ minHeight: '60px' }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {option.icon && (
                        <span className="text-xl flex-shrink-0">{option.icon}</span>
                      )}
                      <span className="text-base font-medium text-white">
                        {option.label}
                      </span>
                    </div>
                    {value === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <Check className="h-5 w-5 text-primary" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>

              {/* Safe area padding for iPhone home indicator */}
              <div className="h-6 flex-shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
