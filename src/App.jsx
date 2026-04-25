import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import PageTransition from '@/components/ui/page-transition';
import { base44 } from '@/api/base44Client';

import AppShell from './components/layout/AppShell';
import { NavigationProvider } from '@/lib/NavigationManager';
import SplashScreen from './pages/SplashScreen.jsx';
import SignIn from './pages/SignIn.jsx';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import AIInsights from './pages/AIInsights';
import Portfolio from './pages/Portfolio';
import Trade from './pages/Trade';
import Settings from './pages/Settings';
import PaperTrading from './pages/PaperTrading';
import Upgrade from './pages/Upgrade';
import AssetDetail from './pages/AssetDetail';
import Notifications from './pages/Notifications';
import Traders from './pages/Traders';
import TradingSetup from './pages/TradingSetup';
import Admin from './pages/Admin.jsx';
import AlpacaConnect from './pages/AlpacaConnect';
import AlpacaCallback from './pages/AlpacaCallback';
import TrekPortfolioWelcome from './pages/TrekPortfolioWelcome';
import OnboardingQuick from './pages/OnboardingQuick';

const LoadingSpinner = () => (
  <div style={{
    background: '#080B12',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '16px'
  }}>
  <img src="/logo-full.svg" alt="TREDIO" style={{ height: '36px' }} />
    <div style={{
      width: 32,
      height: 32,
      border: '3px solid #F59E0B',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg) }
      }
    `}</style>
  </div>
);

const AppRoutes = ({ user, onLogout }) => {
  const location = useLocation();

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/SignIn" element={<PageTransition><SignIn /></PageTransition>} />
          <Route path="/SplashScreen" element={<PageTransition><SplashScreen /></PageTransition>} />
          <Route path="*" element={<Navigate to="/SignIn" replace />} />
        </Routes>
      </AnimatePresence>
    );
  }

  // Gate: if user hasn't completed onboarding, force them there
  const needsOnboarding = !user.onboarding_completed;
  const onboardingPaths = ['/Onboarding', '/OnboardingQuick', '/alpaca-callback', '/SplashScreen'];
  const isOnboardingPath = onboardingPaths.some(p => location.pathname.startsWith(p));

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* If onboarding not done, redirect everything to Onboarding */}
        <Route path="/" element={needsOnboarding ? <Navigate to="/Onboarding" replace /> : <Navigate to="/Home" replace />} />
        <Route path="/SignIn" element={<Navigate to={needsOnboarding ? "/Onboarding" : "/Home"} replace />} />
        <Route path="/SplashScreen" element={<PageTransition><SplashScreen /></PageTransition>} />
        <Route path="/Onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        <Route path="/OnboardingQuick" element={<PageTransition><OnboardingQuick /></PageTransition>} />
        <Route path="/Admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/alpaca-connect" element={<PageTransition><AlpacaConnect /></PageTransition>} />
        <Route path="/alpaca-callback" element={<AlpacaCallback />} />
        <Route path="/trek-portfolio-welcome" element={<PageTransition><TrekPortfolioWelcome /></PageTransition>} />
        {/* If onboarding not done, all main app routes redirect to Onboarding */}
        <Route element={needsOnboarding ? <Navigate to="/Onboarding" replace /> : <AppShell onLogout={onLogout} />}>
          <Route path="/Home" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/Dashboard" element={<Navigate to="/Home" replace />} />
          <Route path="/Markets" element={<PageTransition><Markets /></PageTransition>} />
          <Route path="/AIInsights" element={<PageTransition><AIInsights /></PageTransition>} />
          <Route path="/Traders" element={<PageTransition><Traders /></PageTransition>} />
          <Route path="/Portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
          <Route path="/Trade" element={<PageTransition><Trade /></PageTransition>} />
          <Route path="/Settings" element={<PageTransition><Settings onLogout={onLogout} /></PageTransition>} />
          <Route path="/Upgrade" element={<PageTransition><Upgrade /></PageTransition>} />
          <Route path="/PaperTrading" element={<PageTransition><PaperTrading /></PageTransition>} />
          <Route path="/Notifications" element={<PageTransition><Notifications /></PageTransition>} />
          <Route path="/Asset/:symbol" element={<PageTransition><AssetDetail /></PageTransition>} />
          <Route path="/TradingSetup" element={<PageTransition><TradingSetup /></PageTransition>} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    setUser(null);
    try {
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
      await base44.auth.logout('/SignIn');
    } catch (error) {
      window.location.href = '/SignIn';
    }
  };

  return (
    <QueryClientProvider client={queryClientInstance}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Router>
          <NavigationProvider>
            <AppRoutes user={user} onLogout={handleLogout} />
            <Toaster />
          </NavigationProvider>
        </Router>
      )}
    </QueryClientProvider>
  );
}

export default App;