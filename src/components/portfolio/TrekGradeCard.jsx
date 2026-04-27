import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TrekGradeCard() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-6 flex flex-col items-center justify-center text-center">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30 mb-3">{t('portfolio.trekGrade', 'TREK Portfolio Grade')}</div>
      <div className="text-8xl font-black leading-none mb-3" style={{ color: '#F59E0B' }}>B+</div>
      <p className="text-xs text-white/40 max-w-[220px] leading-relaxed">
        {t('portfolio.trekGradeDesc', 'Well diversified with moderate risk. Consider reducing tech concentration for a stronger score.')}
      </p>
    </div>
  );
}