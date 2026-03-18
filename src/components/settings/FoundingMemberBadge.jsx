import React from 'react';
import { motion } from 'framer-motion';

export default function FoundingMemberBadge({ ogNumber }) {
  if (!ogNumber) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-[1px] mb-6"
      style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D, #D97706)' }}
    >
      <div
        className="rounded-xl px-5 py-4 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #111118, #0e0e14)' }}
      >
        {/* Gold medal icon */}
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
          style={{
            background: 'linear-gradient(135deg, #F59E0B22, #FCD34D11)',
            border: '1px solid rgba(245,158,11,0.4)',
            boxShadow: '0 0 20px rgba(245,158,11,0.15)',
          }}
        >
          🥇
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-sm font-black tracking-wide"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              OG #{ogNumber} · Founding Member
            </span>
          </div>
          <p className="text-[11px] text-white/40 font-medium">Elite access · First 100 users ever</p>
        </div>

        <div
          className="text-[8px] font-black px-2 py-1 rounded-full tracking-[0.15em] uppercase flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          OG100
        </div>
      </div>
    </motion.div>
  );
}