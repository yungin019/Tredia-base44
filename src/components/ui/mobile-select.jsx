import React, { useState, useRef } from 'react';
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
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Swipe-down to dismiss
  const handleTouchStart = (e) => {
    dragStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (dragStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - dragStartY.current;
    if (delta > 60) setIsOpen(false);
    dragStartY.current = null;
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
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              ref={sheetRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-3xl border-t border-white/[0.09] shadow-2xl max-h-[78vh] flex flex-col"
              style={{ background: 'rgba(10,10,20,0.97)', backdropFilter: 'blur(32px)' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Drag handle + header */}
              <div className="px-6 pt-4 pb-4 border-b border-white/[0.07] flex-shrink-0">
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                <h3 className="text-[15px] font-bold text-white/90">{title}</h3>
              </div>

              {/* Options */}
              <div className="overflow-y-auto flex-1 pb-2">
                {options.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors border-b border-white/[0.04] last:border-b-0 active:bg-white/[0.05]"
                      style={{
                        background: isSelected ? 'rgba(14,200,220,0.06)' : 'transparent',
                        minHeight: '56px',
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {option.icon && <span className="text-xl flex-shrink-0">{option.icon}</span>}
                        <span className={`text-[15px] font-medium ${isSelected ? 'text-primary font-semibold' : 'text-white/80'}`}>
                          {option.label}
                        </span>
                      </div>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0 ml-3">
                          <Check className="h-5 w-5 text-primary" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Safe area */}
              <div style={{ height: 'calc(8px + env(safe-area-inset-bottom))', flexShrink: 0 }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}