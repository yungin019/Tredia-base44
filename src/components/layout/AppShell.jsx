import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Brain, Briefcase, Zap, Settings, Bell, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import TrediaAssistant from '@/components/ai/TrediaAssistant';
import NotificationsPanel from '@/components/ui/NotificationsPanel';

const NAV_CONFIG = [
  { path: '/Home',       icon: Home,      translationKey: 'nav.feed',     isTrek: false },
  { path: '/Markets',    icon: TrendingUp, translationKey: 'nav.markets',  isTrek: false },
  { path: '/Portfolio',  icon: Briefcase,  translationKey: 'nav.portfolio', isTrek: false },
  { path: '/AIInsights', icon: Zap,        translationKey: 'nav.trek',     isTrek: true  },
  { path: '/Settings',   icon: Settings,   translationKey: 'nav.settings', isTrek: false },
];

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      base44.auth.redirectToLogin(location.pathname);
    }
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  const NAV_ITEMS = NAV_CONFIG.map(nav => ({
    ...nav,
    label: t(nav.translationKey)
  }));

  const currentNav = NAV_ITEMS.find(n => location.pathname === n.path);
  const pageTitle = currentNav?.label || '';

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col grid-bg">
      {/* ── Top Header ───────────────────────────────────────────── */}
      <header className="glass-dark border-b border-white/[0.06] px-4 lg:px-6 py-0 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/Home" className="flex items-center gap-2.5">
            <div className="relative h-7 w-7">
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" />
              <div className="relative h-7 w-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-inter font-black text-base tracking-[0.08em] text-white">TREDIA</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(252,211,77,0.1))', borderColor: 'rgba(245,158,11,0.35)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.35)', boxShadow: '0 0 12px rgba(245,158,11,0.1)' }}>
                ⚡ ELITE
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
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
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-muted-foreground cursor-pointer transition-colors">
            <Search className="h-3 w-3" />
            <span>Search...</span>
            <kbd className="text-[9px] bg-white/[0.06] px-1.5 py-0.5 rounded font-mono ml-2">⌘K</kbd>
          </div>

          {/* Elite Intelligence Active */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
            style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.2)', boxShadow: '0 0 16px rgba(245,158,11,0.06)' }}>
            <span className="h-1.5 w-1.5 rounded-full live-pulse" style={{ background: '#F59E0B' }} />
            <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: '#F59E0B' }}>Intelligence Active</span>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-chart-3/8 border border-chart-3/15">
            <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
            <span className="text-[10px] font-mono font-semibold text-chart-3 tracking-wider">LIVE</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-6 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Global AI Assistant ──────────────────────────────────── */}
      <TrediaAssistant />

      {/* ── Bottom Nav (Mobile) ───────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/[0.06] lg:hidden z-50"
        style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-around py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const activeColor = item.isTrek ? '#F59E0B' : 'hsl(var(--primary))';
            return (
              <Link key={item.path} to={item.path}
                className="flex flex-col items-center py-2 px-3 relative tap-feedback"
                style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation' }}>
                {isActive && (
                  <motion.div layoutId="mobile-nav"
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
                    style={{ background: activeColor }}
                  />
                )}
                {item.isTrek ? (
                  <div className="relative">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-0.5"
                      style={{
                        background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.07)',
                        border: `1px solid ${isActive ? 'rgba(245,158,11,0.4)' : 'rgba(245,158,11,0.15)'}`,
                        boxShadow: isActive ? '0 0 14px rgba(245,158,11,0.2)' : 'none',
                      }}>
                      <item.icon className="h-4 w-4" style={{ color: '#F59E0B' }} />
                    </div>
                  </div>
                ) : (
                  <item.icon className={`h-5 w-5 transition-colors`} style={{ color: isActive ? activeColor : 'rgba(255,255,255,0.35)' }} />
                )}
                <span className="text-[8px] mt-0.5 font-semibold tracking-wide transition-colors" style={{ color: isActive ? activeColor : 'rgba(255,255,255,0.3)' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}