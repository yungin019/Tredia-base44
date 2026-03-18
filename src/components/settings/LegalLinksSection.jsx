import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const LEGAL_LINKS = [
  {
    label: 'Privacy Policy',
    href: 'https://tredia.app/privacy', // Update this to your actual privacy policy URL
    icon: '🔒',
  },
  {
    label: 'Terms of Service',
    href: 'https://tredia.app/terms', // Update this to your actual terms URL
    icon: '📋',
  },
  {
    label: 'Cookie Policy',
    href: 'https://tredia.app/cookies', // Update this to your actual cookie policy URL
    icon: '🍪',
  },
];

export default function LegalLinksSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-white/[0.06] bg-[#111118] p-5"
    >
      <h2 className="text-[11px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: '#F59E0B' }}>
        Legal
      </h2>
      <div className="space-y-2">
        {LEGAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{link.icon}</span>
              <span className="text-sm text-white/65 group-hover:text-white/85 transition-colors">
                {link.label}
              </span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-white/30 group-hover:text-white/50 transition-colors" />
          </a>
        ))}
      </div>
      <p className="text-[10px] text-white/20 mt-4">
        These links are required for App Store submission. Update the URLs in <code className="text-white/30 font-mono">components/settings/LegalLinksSection.jsx</code>
      </p>
    </motion.div>
  );
}