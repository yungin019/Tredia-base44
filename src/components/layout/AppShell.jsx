import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Briefcase, Zap, Settings, Bell, Search, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TredioAssistant from '@/components/ai/TredioAssistant';
import NotificationsPanel from '@/components/ui/NotificationsPanel';
import SearchModal from '@/components/ui/SearchModal';
import { useNavigation } from '@/lib/NavigationManager';

const NAV_CONFIG = [
  { path: '/Home',       icon: Home,       translationKey: 'nav.feed',      isTrek: false },
  { path: '/Markets',    icon: TrendingUp,  translationKey: 'nav.markets',   isTrek: false },
  { path: '/AIInsights', icon: Zap,         translationKey: 'nav.trek',      isTrek: true  },
  { path: '/Portfolio',  icon: Briefcase,   translationKey: 'nav.portfolio', isTrek: false },
  { path: '/Settings',   icon: Settings,    translationKey: 'nav.settings',  isTrek: false },
];

const TAB_ROOTS = NAV_CONFIG.map(n => n.path);

export default function AppShell({ onLogout }) {
  const location = useLocation();
  const { t } = useTranslation();
  const { switchTab, goBack, canGoBack, getTabForPath } = useNavigation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Track previous path for slide direction
  const prevPath = React.useRef(location.pathname);
  const [slideDir, setSlideDir] = useState(1); // 1=forward, -1=back

  useEffect(() => {
    const prev = prevPath.current;
    const curr = location.pathname;
    const prevTab = getTabForPath(prev);
    const currTab = getTabForPath(curr);
    const prevIdx = TAB_ROOTS.indexOf(prevTab);
    const currIdx = TAB_ROOTS.indexOf(currTab);

    if (prevTab !== currTab) {
      setSlideDir(currIdx >= prevIdx ? 1 : -1);
    } else {
      // Within same tab: forward if going deeper, back if popping
      setSlideDir(canGoBack() ? 1 : -1);
    }
    prevPath.current = curr;
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const NAV_ITEMS = NAV_CONFIG.map(nav => ({ ...nav, label: t(nav.translationKey) }));
  const isTabRoot = TAB_ROOTS.includes(location.pathname);
  const showBack = !isTabRoot && canGoBack();

  const pageVariants = {
    initial: (dir) => ({ opacity: 0, x: dir * 20 }),
    animate: { opacity: 1, x: 0 },
    exit:    (dir) => ({ opacity: 0, x: dir * -20 }),
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col grid-bg">

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <header className="glass-dark border-b border-white/[0.06] px-4 lg:px-6 py-0 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">

          {/* Back button — visible when inside a sub-page */}
          {showBack ? (
            <button
              onClick={goBack}
              className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-white/[0.06] transition-colors tap-feedback"
            >
              <ChevronLeft className="h-5 w-5 text-white/70" />
            </button>
          ) : (
            <Link to="/Home" className="flex items-center gap-2.5" onClick={() => switchTab('/Home')}>
              <img src="/logo-icon.svg" alt="TREDIO" style={{ height: '28px', width: '28px' }} />
              <div className="flex items-baseline gap-1.5">
                <img src="/logo-full.svg" alt="TREDIO" className="hidden sm:block" style={{ height: '22px' }} />
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider"
                  style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(252,211,77,0.1))', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)', boxShadow: '0 0 12px rgba(245,158,11,0.1)' }}>
                  ⚡ ELITE
                </span>
              </div>
            </Link>
          )}

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {NAV_ITEMS.map((item) => {
              const isActive = getTabForPath(location.pathname) === item.path;
              return (
                <button key={item.path}
                  onClick={() => switchTab(item.path)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? item.isTrek ? 'text-primary' : 'text-white/90'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/4'
                  }`}
                  style={isActive && item.isTrek ? { color: '#F59E0B' } : {}}>
                  {isActive && (
                    <motion.div layoutId="nav-pill"
                      className="absolute inset-0 rounded-md border"
                      style={{ background: item.isTrek ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.05)', borderColor: item.isTrek ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)' }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                    />
                  )}
                  <item.icon className="h-3.5 w-3.5 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-muted-foreground cursor-pointer transition-colors tap-feedback min-h-[44px]">
            <Search className="h-3 w-3" />
            <span>{t('common.search')}...</span>
            <kbd className="text-[9px] bg-white/[0.06] px-1.5 py-0.5 rounded font-mono ml-2">⌘K</kbd>
          </button>
          <button onClick={() => setSearchOpen(true)}
            className="sm:hidden flex items-center justify-center h-10 w-10 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] transition-colors tap-feedback">
            <Search className="h-4 w-4 text-white/50" />
          </button>

          {/* Elite badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
            style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.2)', boxShadow: '0 0 16px rgba(245,158,11,0.06)' }}>
            <span className="h-1.5 w-1.5 rounded-full live-pulse" style={{ background: '#F59E0B' }} />
            <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: '#F59E0B' }}>{t('common.intelligence')} {t('common.active')}</span>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-chart-3/8 border border-chart-3/15">
            <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
            <span className="text-[10px] font-mono font-semibold text-chart-3 tracking-wider">LIVE</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 w-full">
        <AnimatePresence mode="wait" custom={slideDir}>
          <motion.div
            key={location.pathname}
            custom={slideDir}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Global AI Assistant (NON-INTRUSIVE) ──────────────────── */}
      {/* Positioned at bottom-right, no overlap with feed content */}
      <TredioAssistant />

      {/* ── Bottom Tab Nav (Mobile) ──────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/[0.06] lg:hidden z-50"
        style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-around py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = getTabForPath(location.pathname) === item.path;
            const activeColor = item.isTrek ? '#F59E0B' : 'hsl(var(--primary))';
            return (
              <button key={item.path}
                onClick={() => switchTab(item.path)}
                className="flex flex-col items-center py-2 px-3 relative tap-feedback"
                style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation', background: 'none', border: 'none', cursor: 'pointer' }}>
                {isActive && (
                  <motion.div layoutId="mobile-nav"
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
                    style={{ background: activeColor }}
                  />
                )}
                {item.isTrek ? (
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-0.5"
                    style={{
                      background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.07)',
                      border: `1px solid ${isActive ? 'rgba(245,158,11,0.4)' : 'rgba(245,158,11,0.15)'}`,
                      boxShadow: isActive ? '0 0 14px rgba(245,158,11,0.2)' : 'none',
                    }}>
                    <item.icon className="h-4 w-4" style={{ color: '#F59E0B' }} />
                  </div>
                ) : (
                  <item.icon className="h-5 w-5 transition-colors" style={{ color: isActive ? activeColor : 'rgba(255,255,255,0.35)' }} />
                )}
                <span className="text-[8px] mt-0.5 font-semibold tracking-wide transition-colors"
                  style={{ color: isActive ? activeColor : 'rgba(255,255,255,0.3)' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Use new GlobalAssetSearch instead of old SearchModal */}
      {searchOpen && <GlobalAssetSearch />}
      {searchOpen && <div className="fixed inset-0 z-30" onClick={() => setSearchOpen(false)} />}
    </div>
  );
}