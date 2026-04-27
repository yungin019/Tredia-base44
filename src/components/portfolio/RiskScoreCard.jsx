import React from 'react';
import { useTranslation } from 'react-i18next';

const RISK = 6.2;

export default function RiskScoreCard() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-6 flex flex-col justify-between">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30 mb-4">{t('portfolio.riskScore', 'Risk Score')}</div>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-5xl font-black font-mono" style={{ color: '#F59E0B' }}>{RISK}</span>
        <span className="text-xl text-white/20 mb-1 font-mono">/10</span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${RISK * 10}%`, background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
        />
      </div>
      <span className="text-xs font-semibold" style={{ color: '#F59E0B' }}>{t('portfolio.moderateHighRisk', 'Moderate-High Risk')}</span>
    </div>
  );
}