import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AlertCircle, CheckCircle2, Copy, Share2 } from 'lucide-react';
import { Browser } from '@capacitor/browser';

const isNative = () => !!(window.Capacitor?.isNativePlatform?.());
import DeleteAccountModal from '@/components/settings/DeleteAccountModal';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { getFoundingMemberInfo } from '@/api/foundingMembers';
import FoundingMemberBadge from '@/components/settings/FoundingMemberBadge';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import LegalLinksSection from '@/components/settings/LegalLinksSection';
import AlpacaConnectedAccounts from '@/components/broker/AlpacaConnectedAccounts';

function SectionHeader({ title }) {
  return (
    <h2 className="text-[11px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: '#F59E0B' }}>
      {title}
    </h2>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? '#F59E0B' : 'rgba(255,255,255,0.08)' }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

const PRO_FEATURES = [
  'Unlimited TREK signals',
  'Real-time price alerts',
  'Advanced analytics & charts',
  'Priority support',
];

export default function Settings({ onLogout }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { tier } = useSubscriptionStatus();
  const { restorePurchases, purchaseInProgress, purchaseError } = useRevenueCat();
  const [user, setUser] = useState(null);
  const [foundingMember, setFoundingMember] = useState(null);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    trekSignals: true,
    newsAlerts: true,
    earningsCalendar: false,
  });
  const [notifLoaded, setNotifLoaded] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    base44.auth.me()
    .then(u => {
      setUser(u);
      if (u?.notification_prefs) {
        setNotifications(prev => ({ ...prev, ...u.notification_prefs }));
      }
      setNotifLoaded(true);
      const userId = u?.email || u?.id;
      if (userId) {
        getFoundingMemberInfo(userId)
          .then(setFoundingMember)
          .catch(() => {});
      }
    })
    .catch(() => { setNotifLoaded(true); });
  }, []);

  useEffect(() => {
    const handleLanguageChanged = () => {
      setCurrentLang(i18n.language);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => i18n.off('languageChanged', handleLanguageChanged);
  }, [i18n]);

  const toggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    base44.auth.updateMe({ notification_prefs: updated }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-2xl font-black text-white/95 tracking-tight">
        {t('settings.title', 'Settings')}
      </motion.h1>

      {/* TRADING STATUS */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#F59E0B]/20 bg-[#111118] p-5 space-y-4">
        <SectionHeader title={t('settings.trading', 'TRADING')} />

        {user?.alpaca_connected ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] mt-2" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white mb-1">{t('settings.alpacaConnected', 'Alpaca Connected')}</p>
                <p className="text-xs text-white/60 mb-3">{t('settings.trekWatching', 'TREK is watching your portfolio')}</p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    <p className="text-[10px] text-white/40 mb-1">{t('settings.buyingPower', 'Buying Power')}</p>
                    <p className="text-sm font-bold text-white">${(user.alpaca_buying_power || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    <p className="text-[10px] text-white/40 mb-1">{t('settings.positions', 'Positions')}</p>
                    <p className="text-sm font-bold text-white">{user.alpaca_position_count || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    <p className="text-[10px] text-white/40 mb-1">{t('settings.todayPnl', "Today P&L")}</p>
                    <p className={`text-sm font-bold ${(user.alpaca_daily_pnl || 0) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                      {(user.alpaca_daily_pnl || 0) >= 0 ? '+' : ''}${(user.alpaca_daily_pnl || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/Portfolio')}
                    className="flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white"
                  >
                    {t('settings.viewPortfolio', 'VIEW PORTFOLIO →')}
                  </button>
                  <button
                    onClick={async () => {
                      await base44.auth.updateMe({
                        alpaca_connected: false,
                        alpaca_token: null,
                        alpaca_refresh_token: null
                      });
                      setUser(prev => ({ ...prev, alpaca_connected: false }));
                    }}
                    className="px-4 py-3 rounded-lg font-bold text-sm border border-white/[0.1] hover:border-white/20 transition-colors text-white/55"
                  >
                    {t('settings.disconnect', 'DISCONNECT')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B] mt-2" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white mb-2">{t('settings.unlockRealTrading', 'Unlock Real Trading')}</p>
                <p className="text-xs text-white/60 mb-3">{t('settings.alpacaDesc', 'Connect Alpaca and TREK starts monitoring YOUR real portfolio immediately. Commission-free.')}</p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#F59E0B]" />
                    <p className="text-xs text-white/70">{t('settings.feat1', 'Zero hidden fees')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#F59E0B]" />
                    <p className="text-xs text-white/70">{t('settings.feat2', 'TREK analyzes your positions')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#F59E0B]" />
                    <p className="text-xs text-white/70">{t('settings.feat3', 'Real-time alerts on YOUR actual holdings')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#F59E0B]" />
                    <p className="text-xs text-white/70">{t('settings.feat4', 'Takes 30 seconds')}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/alpaca-connect')}
                  className="w-full px-4 py-3 rounded-lg font-bold text-sm transition-all bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white mb-3"
                >
                  {t('settings.connectAlpaca', 'CONNECT ALPACA - FREE →')}
                </button>

                <div className="text-center">
                  <p className="text-[11px] text-white/40 mb-1">{t('settings.newToAlpaca', 'New to Alpaca?')}</p>
                  <button
                    onClick={async () => {
                      if (isNative()) {
                        await Browser.open({ url: 'https://alpaca.markets', presentationStyle: 'popover' });
                      } else {
                        window.open('https://alpaca.markets', '_blank', 'noopener,noreferrer');
                      }
                    }}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    className="text-[11px] text-[#F59E0B] hover:underline"
                  >
                    {t('settings.createAlpacaAccount', 'Create free account → Commission-free · Takes 5 min')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* FOUNDING MEMBER BADGE */}
      {foundingMember && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <FoundingMemberBadge ogNumber={foundingMember.og_number} />
        </motion.div>
      )}

      {/* OG REFERRAL SECTION */}
      {foundingMember && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          className="rounded-xl border border-[#F59E0B]/20 bg-[#111118] p-5 space-y-4">
          <SectionHeader title={t('settings.referralProgram', 'REFERRAL PROGRAM')} />
          <p className="text-xs text-white/40 mb-3">{t('settings.referralDesc', 'Share TREDIO with friends. You both win.')}</p>

          <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{t('settings.friendsReferred', 'Friends referred')}</span>
              <span className="text-lg font-black text-[#F59E0B]">{foundingMember.referral_count || 0}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-2">{t('settings.yourReferralLink', 'Your referral link')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={`https://tredio.app/join?ref=OG${foundingMember.og_number}`}
                readOnly
                className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-white/70 font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://tredio.app/join?ref=OG${foundingMember.og_number}`);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                className="px-4 py-2 rounded-lg font-bold text-xs transition-all"
                style={{ background: copySuccess ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.12)', border: `1px solid ${copySuccess ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.25)'}`, color: copySuccess ? '#22c55e' : '#F59E0B' }}>
                {copySuccess ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Join TREDIO',
                      text: 'Check out TREDIO — AI-powered trading intelligence',
                      url: `https://tredio.app/join?ref=OG${foundingMember.og_number}`
                    }).catch(() => {});
                  }
                }}
                className="px-4 py-2 rounded-lg font-bold text-xs transition-all"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' }}>
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* PROFILE */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-xl border border-white/[0.06] bg-[#111118] p-5 space-y-4">
        <SectionHeader title={t('settings.profile', 'Profile')} />
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
            <User className="h-9 w-9 text-white/25" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <label className="text-[10px] font-semibold text-white/30 uppercase tracking-wider block mb-1">{t('settings.name', 'Name')}</label>
              <div className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/85">
                {user?.full_name || '—'}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-white/30 uppercase tracking-wider block mb-1">{t('settings.email', 'Email')}</label>
              <div className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/85">
                {user?.email || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Profile Summary */}
        {(user?.budget_range || user?.experience_level) && (
          <div className="pt-3 border-t border-white/[0.05]">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/25 mb-2">{t('settings.aiPersonalization', 'AI Personalization')}</p>
            <div className="flex flex-wrap gap-2">
              {user.budget_range && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                  style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {user.budget_range}
                </span>
              )}
              {user.risk_tolerance && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {user.risk_tolerance}
                </span>
              )}
              {user.goal && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {user.goal}
                </span>
              )}
              {user.experience_level && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {user.experience_level}
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* CONNECTED ACCOUNTS */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-white/[0.06] bg-[#111118] p-5">
        <AlpacaConnectedAccounts
          user={user}
          onDisconnect={async () => {
            await base44.auth.updateMe({
              alpaca_connected: false,
              alpaca_token: null,
              alpaca_refresh_token: null,
              broker_status: 'not_connected',
              trading_mode: 'practice',
            });
            setUser(prev => ({ ...prev, alpaca_connected: false, broker_status: 'not_connected' }));
          }}
        />
      </motion.div>

      {/* NOTIFICATIONS */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-xl border border-white/[0.06] bg-[#111118] p-5 space-y-3">
        <SectionHeader title={t('settings.notifications', 'Notifications')} />
        {[
          { key: 'priceAlerts', label: t('settings.priceAlerts', 'Price Alerts'), desc: t('settings.priceAlertsDesc', 'Get notified when price targets are hit') },
          { key: 'trekSignals', label: t('settings.trekSignals', 'TREK Signals'), desc: t('settings.trekSignalsDesc', 'Receive live AI trading signal alerts') },
          { key: 'newsAlerts', label: t('settings.newsAlerts', 'News Alerts'), desc: t('settings.newsAlertsDesc', 'Breaking market news and earnings updates') },
          { key: 'earningsCalendar', label: t('settings.earningsCalendar', 'Earnings Calendar'), desc: t('settings.earningsCalendarDesc', 'Reminders before key earnings releases') },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-2 border-b border-white/[0.04] last:border-0">
            <div>
              <p className="text-sm font-semibold text-white/80">{label}</p>
              <p className="text-[11px] text-white/30 mt-0.5">{desc}</p>
            </div>
            <Toggle checked={notifications[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </motion.div>

      {/* ACCOUNT TIER */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl border border-white/[0.06] bg-[#111118] p-5 space-y-4">
        <SectionHeader title={t('settings.subscription', 'Subscription')} />
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase ${
            tier === 'elite' ? 'bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B]' :
            tier === 'pro' ? 'bg-blue-500/15 border border-blue-500/40 text-blue-400' :
            'bg-white/[0.06] border border-white/[0.1] text-white/40'
          }`}
          style={tier === 'elite' ? { animation: 'eliteGoldGlow 2s ease-in-out infinite' } : {}}>
            {tier ? tier.toUpperCase() : t('upgrade.free', 'FREE')}
          </span>
          <span className="text-xs text-white/25">{t('settings.current', 'Current plan')}</span>
        </div>
        <ul className="space-y-2 mb-4">
          {[t('settings.unlimited', 'Unlimited TREK signals'), t('settings.realtimeAlerts', 'Real-time price alerts'), t('settings.advancedAnalytics', 'Advanced analytics'), t('settings.prioritySupport', 'Priority support')].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-white/50">
              <span style={{ color: '#F59E0B' }}>⚡</span>{f}
            </li>
          ))}
        </ul>
        {restoreMessage && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-3 rounded-lg mb-3 ${
              restoreMessage.type === 'error'
                ? 'bg-destructive/10 border border-destructive/20'
                : 'bg-chart-3/10 border border-chart-3/20'
            }`}>
            <AlertCircle className={`h-4 w-4 flex-shrink-0 ${
              restoreMessage.type === 'error' ? 'text-destructive' : 'text-chart-3'
            }`} />
            <p className={`text-xs ${
              restoreMessage.type === 'error' ? 'text-destructive' : 'text-chart-3'
            }`}>{restoreMessage.text}</p>
          </motion.div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate('/Upgrade')}
            className="py-3 rounded-xl font-black text-sm tracking-wide transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#0A0A0F' }}>
            ⚡ {t('upgrade.upgrade', 'Upgrade')}
          </button>
          <button
            onClick={async () => {
              setRestoreMessage(null);
              const success = await restorePurchases();
              if (success) {
                setRestoreMessage({ type: 'success', text: t('settings.restorePurchases', 'Purchases restored') });
              } else {
                setRestoreMessage({ type: 'error', text: purchaseError || t('common.error', 'Something went wrong') });
              }
            }}
            disabled={purchaseInProgress}
            className="py-3 rounded-xl font-bold text-sm tracking-wide border border-white/[0.1] hover:border-white/20 transition-colors text-white/55 disabled:opacity-50"
            title={t('settings.restorePurchases', 'Restore Purchases')}>
            {purchaseInProgress ? t('common.loading', 'Loading...') : t('settings.restorePurchases', 'Restore Purchases')}
          </button>
        </div>
      </motion.div>

      {/* LANGUAGE */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
       className="rounded-xl border border-white/[0.06] bg-[#111118] p-5 space-y-3">
       <SectionHeader title={t('settings.language', 'Language')} />
       <div className="space-y-3">
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
           {[
             { code: 'en', name: 'English', flag: '🇬🇧' },
             { code: 'fr', name: 'Français', flag: '🇫🇷' },
             { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
             { code: 'es', name: 'Español', flag: '🇪🇸' },
             { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
             { code: 'it', name: 'Italiano', flag: '🇮🇹' },
             { code: 'pt', name: 'Português', flag: '🇵🇹' },
             { code: 'ar', name: 'العربية', flag: '🇸🇦' },
             { code: 'ja', name: '日本語', flag: '🇯🇵' },
             { code: 'zh', name: '中文', flag: '🇨🇳' },
             { code: 'ko', name: '한국어', flag: '🇰🇷' },
             { code: 'ru', name: 'Русский', flag: '🇷🇺' },
             { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
             { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
             { code: 'pl', name: 'Polski', flag: '🇵🇱' },
             { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
             { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
             { code: 'ro', name: 'Română', flag: '🇷🇴' },
             { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
             { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
             { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
           ].map(lang => (
             <button
               key={lang.code}
               onClick={async () => {
                 const RTL = ['ar','he','ur','fa','yi','ji','iw','ku'];
                 document.documentElement.lang = lang.code;
                 document.documentElement.dir = RTL.some(r => lang.code.startsWith(r)) ? 'rtl' : 'ltr';
                 await i18n.changeLanguage(lang.code).catch(() => {});
                 setCurrentLang(lang.code);
                 // Persist to user profile so language loads correctly on next app open
                 base44.auth.updateMe({ language: lang.code }).catch(() => {});
               }}
               className={`p-3 rounded-lg border transition-all text-sm font-semibold flex items-center gap-2 justify-center ${
                 currentLang === lang.code
                   ? 'bg-primary/15 border-primary/40 text-white/90'
                   : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:border-white/[0.15]'
               }`}
             >
               <span>{lang.flag}</span>
               <span className="text-[11px]">{lang.name}</span>
             </button>
           ))}
         </div>
         <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '8px', lineHeight: '1.4' }}>
           {t('settings.languageNote', 'App language will update immediately.')}
         </p>
       </div>
      </motion.div>

      {/* LEGAL */}
      <LegalLinksSection />

      {/* LOGOUT BUTTON */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-xl border border-red-500/20 bg-[#111118] p-5">
        <button
          onClick={async () => {
            localStorage.removeItem('base44_access_token');
            localStorage.removeItem('token');
            if (onLogout) {
              await onLogout();
            } else {
              await base44.auth.logout('/SignIn');
            }
          }}
          className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }}
        >
          {t('settings.signOut', 'Sign Out')}
        </button>
      </motion.div>

      {/* VERSION */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-center pb-4">
        <span className="text-xs text-white/25 font-mono">{t('settings.version', 'TREDIO v1.0')}</span>
      </motion.div>

      {/* DANGER ZONE — Account Deletion */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="pb-8"
        style={{ borderTop: '1px solid rgba(239,68,68,0.15)', paddingTop: '24px' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: 'rgba(239,68,68,0.5)' }}>{t('settings.dangerZone', 'Danger Zone')}</p>
          <button
            onClick={() => setDeleteModal(true)}
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent',
              border: '1px solid rgba(239,68,68,0.5)',
              borderRadius: '12px',
              color: '#EF4444',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            {t('settings.deleteAccount', 'Delete Account')}
          </button>
          <p className="text-[10px] text-white/20 text-center mt-2">{t('settings.deleteAccountWarning', 'Permanently delete your account and all associated data')}</p>
      </motion.div>

      {deleteModal && (
        <DeleteAccountModal
          loading={deleteLoading}
          error={deleteError}
          onCancel={() => { setDeleteModal(false); setDeleteError(''); }}
          onConfirm={async () => {
            setDeleteLoading(true);
            setDeleteError('');
            try {
              const result = await base44.functions.invoke('deleteUserData', {});
              if (result?.data?.error) throw new Error(result.data.error);
              // Clear all local state and storage
              localStorage.clear();
              sessionStorage.clear();
              // Use navigate so it stays in-app (Apple requirement)
              navigate('/SignIn?deleted=1', { replace: true });
            } catch (err) {
              setDeleteLoading(false);
              setDeleteError(err?.message || 'Failed to delete account. Please try again.');
            }
          }}
        />
      )}
    </div>
  );
}