import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Brain, Briefcase, ArrowLeftRight, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import TickerTape from '../dashboard/TickerTape';

const NAV_ITEMS = [
  { path: '/Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/Markets', icon: TrendingUp, label: 'Markets' },
  { path: '/AIInsights', icon: Brain, label: 'AI' },
  { path: '/Portfolio', icon: Briefcase, label: 'Portfolio' },
  { path: '/Trade', icon: ArrowLeftRight, label: 'Trade' },
];

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="glass border-b border-border/50 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <span className="font-inter font-bold text-lg tracking-tight text-foreground">TREDIA</span>
          <span className="hidden sm:inline text-[10px] font-mono text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">PRO</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5 text-sm text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs">Search markets...</span>
            <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary live-pulse" />
          </button>
        </div>
      </header>

      {/* Ticker Tape */}
      <TickerTape />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 sm:pb-4">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 sm:hidden z-50">
        <div className="flex items-center justify-around py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center py-2 px-3 relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 h-0.5 w-8 bg-primary rounded-full"
                  />
                )}
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'} transition-colors`} />
                <span className={`text-[10px] mt-1 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden sm:flex fixed left-0 top-[53px] bottom-0 w-16 flex-col items-center py-4 gap-1 border-r border-border/50 bg-background z-40">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all group ${isActive ? 'bg-primary/10' : 'hover:bg-secondary/50'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 h-6 w-0.5 bg-primary rounded-r-full"
                />
              )}
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
              <span className={`text-[9px] mt-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}