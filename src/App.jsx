import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import PageTransition from '@/components/ui/page-transition';
import i18n from '@/i18n';

import { FirebaseAuthProvider, useFirebaseAuth } from '@/lib/FirebaseAuthContext';
import { NavigationProvider } from '@/lib/NavigationManager';

import AppShell from './components/layout/AppShell';
import SplashScreen from './pages/SplashScreen.jsx';
import SignIn from './pages/SignIn.jsx';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
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
import Support from './pages/Support';

const LoadingSpinner = () => (
  <div style={{
    background: '#080B12', height: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px'
  }}>
    <img src="/logo-full.svg" alt="TREDIO" style={{ height: '36px' }} />
    <div style={{ width: 32, height: 32, border: '3px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

const AppRoutes = () => {
  const location = useLocation();
  const { firebaseUser, profile, isLoading, logout } = useFirebaseAuth();

  if (isLoading) return <LoadingSpinner />;

  if (location.pathname === '/support') {
    return <Support />;
  }

  if (!firebaseUser) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/SignIn" element={<PageTransition><SignIn /></PageTransition>} />
          <Route path="/SplashScreen" element={<PageTransition><SplashScreen /></PageTransition>} />
          <Route path="/support" element={<Support />} />
          <Route path="*" element={<Navigate to="/SignIn" replace />} />
        </Routes>
      </AnimatePresence>
    );
  }

  const lang = localStorage.getItem('tredio_lang') || profile?.language || 'en';
  if (i18n.isInitialized && i18n.language !== lang) {
    i18n.changeLanguage(lang).catch(() => {});
    const RTL = ['ar','he','ur','fa','yi','ji','iw','ku'];
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.some(r => lang.startsWith(r)) ? 'rtl' : 'ltr';
  }

  // FIX: Also check localStorage directly — on native, profile in context may lag
  // behind what was already written to localStorage during onboarding completion.
  const getCachedOnboarding = () => {
    try {
      const raw = localStorage.getItem('tredio_user_profile');
      if (!raw) return false;
      const p = JSON.parse(raw);
      return p?.onboarding_completed === true;
    } catch (_) { return false; }
  };
  const needsOnboarding = !(profile?.onboarding_completed === true || getCachedOnboarding());

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to={needsOnboarding ? "/Onboarding" : "/Home"} replace />} />
        <Route path="/SignIn" element={<PageTransition><SignIn /></PageTransition>} />
        <Route path="/SplashScreen" element={<PageTransition><SplashScreen /></PageTransition>} />
        <Route path="/Onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        <Route path="/OnboardingQuick" element={<PageTransition><OnboardingQuick /></PageTransition>} />
        <Route path="/Admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/alpaca-connect" element={<PageTransition><AlpacaConnect /></PageTransition>} />
        <Route path="/alpaca-callback" element={<AlpacaCallback />} />
        <Route path="/support" element={<Support />} />
        <Route path="/trek-portfolio-welcome" element={<PageTransition><TrekPortfolioWelcome /></PageTransition>} />
        <Route element={needsOnboarding ? <Navigate to="/Onboarding" replace /> : <AppShell onLogout={logout} />}>
          <Route path="/Home" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/Dashboard" element={<Navigate to="/Home" replace />} />
          <Route path="/Markets" element={<PageTransition><Markets /></PageTransition>} />
          <Route path="/AIInsights" element={<PageTransition><AIInsights /></PageTransition>} />
          <Route path="/Traders" element={<PageTransition><Traders /></PageTransition>} />
          <Route path="/Portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
          <Route path="/Trade" element={<PageTransition><Trade /></PageTransition>} />
          <Route path="/Settings" element={<PageTransition><Settings onLogout={logout} /></PageTransition>} />
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
  return (
    <QueryClientProvider client={queryClientInstance}>
      <FirebaseAuthProvider>
        <Router>
          <NavigationProvider>
            <AppRoutes />
            <Toaster />
          </NavigationProvider>
        </Router>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
