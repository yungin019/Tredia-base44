import React, { useState } from 'react';
import { ChevronDown, Mail, MessageCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I connect my Alpaca brokerage account?',
    a: 'Go to Settings → Connected Accounts → tap Connect Alpaca and follow the steps.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'Go to Settings → Subscription → tap Manage on the App Store to cancel. You will retain access until the end of your billing period.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings → scroll to the bottom → tap Delete Account. This permanently removes all your data.',
  },
  {
    q: 'What is paper trading?',
    a: 'Paper trading lets you practice with $100,000 virtual money — no real money involved. It\'s a safe way to test strategies.',
  },
  {
    q: 'How do I contact support?',
    a: 'Email us at trediosupport@gmail.com and we will respond within 24 hours.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: '#111118',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: '16px',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{q}</span>
        <ChevronDown
          style={{
            width: 16, height: 16, color: 'rgba(255,255,255,0.35)', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s',
          }}
        />
      </button>
      {open && (
        <div style={{ padding: '0 20px 16px', fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
          {a}
        </div>
      )}
    </div>
  );
}

// Fully static — no auth, no API calls. Accessible at /support without login.
export default function Support() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'calc(48px + env(safe-area-inset-top)) 16px calc(48px + env(safe-area-inset-bottom))',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Logo + Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <img src="/logo-full.svg" alt="TREDIO" style={{ height: '32px' }} />
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 }}>
            Support Center
          </p>
        </div>

        {/* Hero message */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 8px' }}>
            TREDIO Support
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Need help? We're here for you.
          </p>
        </div>

        {/* Contact Email */}
        <div style={{
          background: '#111118',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F59E0B' }}>
            Contact Support
          </span>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Have a question or issue? Reach out and we'll get back to you within 24 hours.
          </p>
          <a
            href="mailto:trediosupport@gmail.com"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '13px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '14px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F',
              textDecoration: 'none',
            }}
          >
            <Mail style={{ width: 16, height: 16 }} />
            trediosupport@gmail.com
          </a>
        </div>

        {/* FAQ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F59E0B' }}>
            Frequently Asked Questions
          </span>
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>

        {/* Legal Links */}
        <div style={{
          background: '#111118',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            Legal
          </span>
          <a
            href="https://pushy-sapphire-d17.notion.site/TREDIO-Terms-of-Use-32cbfe5c098c809b9956e2b6a6cea173"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '14px', color: '#F59E0B', textDecoration: 'none', fontWeight: '500' }}
          >
            Terms of Use →
          </a>
          <a
            href="https://pushy-sapphire-d17.notion.site/TREDIO-Privacy-Policy-329bfe5c098c807b9dccf735b02158e3"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '14px', color: '#F59E0B', textDecoration: 'none', fontWeight: '500' }}
          >
            Privacy Policy →
          </a>
        </div>

        {/* Discord */}
        <div style={{
          background: '#111118',
          border: '1px solid rgba(88,101,242,0.3)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5865F2' }}>
            Community
          </span>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Join our Discord for live trading discussions and community support.
          </p>
          <a
            href="https://discord.gg/KWT9VDhvj9"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '14px',
              background: 'linear-gradient(135deg, #5865F2, #4752C4)', color: '#fff',
              textDecoration: 'none',
            }}
          >
            <MessageCircle style={{ width: 16, height: 16 }} />
            Join Discord →
          </a>
        </div>

      </div>
    </div>
  );
}