import React from 'react';
import { Mail, MessageCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  {
    q: 'What is TREDIO and how does it work?',
    a: 'TREDIO is an AI-powered trading intelligence platform. The TREK engine analyzes real-time market data, news, and price action to deliver actionable trade signals and insights directly to you.',
  },
  {
    q: 'How do I connect my Alpaca account?',
    a: 'Go to Settings → Trading and tap "Connect Alpaca". You\'ll be redirected to Alpaca to authorize TREDIO. Once connected, TREK will monitor your real portfolio and execute trades on your behalf.',
  },
  {
    q: 'What is the difference between Free and Elite?',
    a: 'Free users get limited daily TREK signals and basic market data. Elite unlocks unlimited AI signals, real-time price alerts, advanced analytics, Super AI (4-model consensus), and priority support.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'On iOS, go to Settings → Apple ID → Subscriptions and cancel there. On Android, go to Google Play → Subscriptions. You\'ll retain Elite access until the end of your billing period.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-white/[0.07] rounded-xl overflow-hidden"
      style={{ background: '#111118' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
      >
        <span className="text-sm font-semibold text-white/85">{q}</span>
        <ChevronDown
          className="h-4 w-4 text-white/40 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-white/55 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Support() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <img src="/logo-full.svg" alt="TREDIO" style={{ height: '32px' }} />
          <p className="text-xs text-white/30 tracking-widest uppercase">Support Center</p>
        </div>

        {/* Contact Support */}
        <div
          className="rounded-xl border border-[#F59E0B]/20 p-6 space-y-3"
          style={{ background: '#111118' }}
        >
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: '#F59E0B' }}>
            Contact Support
          </h2>
          <p className="text-sm text-white/50">
            Have a question or issue? Reach out and we'll get back to you as soon as possible.
          </p>
          <a
            href="mailto:trediosupport@gmail.com"
            className="flex items-center gap-3 mt-2 px-4 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}
          >
            <Mail className="h-4 w-4" />
            trediosupport@gmail.com
          </a>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: '#F59E0B' }}>
            Frequently Asked Questions
          </h2>
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>

        {/* Discord */}
        <div
          className="rounded-xl border border-[#5865F2]/30 p-6 space-y-3"
          style={{ background: '#111118' }}
        >
          <h2 className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: '#5865F2' }}>
            Community
          </h2>
          <p className="text-sm text-white/50">
            Join our Discord for live trading discussions, signals, and community support.
          </p>
          <a
            href="https://discord.gg/KWT9VDhvj9"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #5865F2, #4752C4)', color: '#fff' }}
          >
            <MessageCircle className="h-4 w-4" />
            Join Discord →
          </a>
        </div>

      </div>
    </div>
  );
}