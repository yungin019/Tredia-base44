import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Brain, Briefcase, ArrowLeftRight, Bell, Search, Zap, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TickerTape from '../dashboard/TickerTape';

export default function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();

  const NAV_ITEMS = [
    { path: '/AIInsights', icon: Brain, labelKey: 'nav.feed', isTrek: false },
    { path: '/Markets', icon: TrendingUp, labelKey: 'nav.markets', isTrek: false },
    { path: '/Portfolio', icon: Briefcase, labelKey: 'nav.portfolio', isTrek: false },
    { path: '/AIInsights', icon: Zap, labelKey: 'nav.trek', isTrek: true },
    { path: '/Settings', icon: Settings, labelKey: 'nav.settings', isTrek: false },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col grid-bg">
      {/* Top Header */}
      <header className="glass-dark border-b border-white/[0.06] px-4 lg:px-6 py-0 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative h-7 w-7">
              <div className="absolute inset-0 rounded-lg bg-primary/20 blur-sm" />
              <div className="relative h-7 w-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-inter font-black text-base tracking-[0.08em] text-white">TREDIA</span>
              <span className="text-[9px] font-mono font-bold text-primary/80 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded tracking-wider">PRO</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {NAV_ITEMS.filter(item => !item.isTrek).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={`${item.path}-${item.labelKey}`}
                    to={item.path}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-primary bg-primary/8'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/4'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-md bg-primary/8 border border-primary/15"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                      />
                    )}
                    <item.icon className="h-3.5 w-3.5 relative z-10" />
                    <span className="relative z-10">{t(item.labelKey)}</span>
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

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-chart-3/8 border border-chart-3/15">
            <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
            <span className="text-[10px] font-mono font-semibold text-chart-3 tracking-wider">LIVE</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
        </div>
      </header>

      {/* Ticker Tape */}
      <TickerTape />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile) */}
       <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/[0.06] lg:hidden z-50">
         <div className="flex items-center justify-around py-1 safe-bottom">
           {NAV_ITEMS.map((item) => {
             const isActive = location.pathname === item.path && !item.isTrek;
             const isTrekActive = item.isTrek && location.pathname === item.path;
             const fallbackLabels = {
               'nav.feed': 'Feed',
               'nav.markets': 'Markets',
               'nav.portfolio': 'Portfolio',
               'nav.trek': 'TREK',
               'nav.settings': 'Settings'
             };
             return (
               <Link key={`${item.path}-${item.labelKey}`} to={item.path} className="flex flex-col items-center py-2 px-3 relative">
                 {(isActive || isTrekActive) && (
                   <motion.div
                     layoutId="mobile-nav"
                     className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
                     style={{ background: item.isTrek ? '#F59E0B' : 'hsl(var(--primary))' }}
                   />
                 )}
                 <item.icon className={`h-5 w-5 transition-colors ${(isActive || isTrekActive) ? (item.isTrek ? 'text-[#F59E0B]' : 'text-primary') : 'text-muted-foreground'}`} />
                 <span className={`text-[8px] mt-1 font-medium tracking-wide transition-colors ${(isActive || isTrekActive) ? (item.isTrek ? 'text-[#F59E0B]' : 'text-primary') : 'text-muted-foreground'}`}>
                   {t(item.labelKey) || fallbackLabels[item.labelKey] || 'Menu'}
                 </span>
               </Link>
             );
           })}
         </div>
       </nav>
    </div>
  );
}