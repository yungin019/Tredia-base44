import React from 'react';
import { Shield } from 'lucide-react';

/**
 * Reusable disclosure banner shown wherever trading actions are presented.
 * Keeps TREDIO legally clean — never implies custody or broker role.
 */
export default function BrokerDisclosureBanner({ className = '' }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl p-3 ${className}`}
      style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}
    >
      <Shield className="h-3.5 w-3.5 text-[#F59E0B] mt-0.5 flex-shrink-0" />
      <p className="text-[10px] text-white/40 leading-relaxed">
        <span className="text-[#F59E0B] font-semibold">TREDIO provides intelligence only.</span>{' '}
        Brokerage services, execution, and account custody are provided by{' '}
        <span className="text-white/60">Alpaca Securities LLC</span>, member FINRA/SIPC.
        TREDIO does not hold client funds.
      </p>
    </div>
  );
}