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
import AlpacaOnboarding from './pages/AlpacaOnboarding';
import Community from './pages/Community';
import DiscordCallback from './pages/DiscordCallback';
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

const AppRoutes = ({ user, userProfile, onLogout }) => {
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

  // Redirect to onboarding if not completed
  // userProfile.onboarding_completed is undefined for brand-new users → treat as needing onboarding
  const needsOnboarding = userProfile && userProfile.onboarding_completed !== true;
  if (needsOnboarding && location.pathname !== '/Onboarding') {
    return <Navigate to="/Onboarding" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/SignIn" element={<Navigate to="/Home" replace />} />
        <Route path="/SplashScreen" element={<PageTransition><SplashScreen /></PageTransition>} />
        <Route path="/Onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        <Route path="/OnboardingQuick" element={<PageTransition><OnboardingQuick /></PageTransition>} />
        <Route path="/Admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/alpaca-connect" element={<PageTransition><AlpacaConnect /></PageTransition>} />
        <Route path="/alpaca-onboarding" element={<PageTransition><AlpacaOnboarding /></PageTransition>} />
        <Route path="/alpaca-callback" element={<AlpacaCallback />} />
        <Route path="/auth/discord/callback" element={<DiscordCallback />} />
        <Route path="/trek-portfolio-welcome" element={<PageTransition><TrekPortfolioWelcome /></PageTransition>} />
        <Route element={<AppShell onLogout={onLogout} />}>
          <Route path="/Home" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/Dashboard" element={<Navigate to="/Home" replace />} />
          <Route path="/Markets" element={<PageTransition><Markets /></PageTransition>} />
          <Route path="/AIInsights" element={<PageTransition><AIInsights /></PageTransition>} />
          <Route path="/Traders" element={<PageTransition><Traders /></PageTransition>} />
          <Route path="/Community" element={<PageTransition><Community /></PageTransition>} />
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
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (!isAuthed) {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }
        const currentUser = await base44.auth.me();
        // Only accept users with a real email (not anonymous)
        if (currentUser?.email) {
          setUser(currentUser);
          setUserProfile(currentUser);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    setUser(null);
    setUserProfile(null);
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
            <AppRoutes user={user} userProfile={userProfile} onLogout={handleLogout} />
            <Toaster />
          </NavigationProvider>
        </Router>
      )}
    </QueryClientProvider>
  );
}

export default App;