import { lazy, Suspense } from 'react';
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

// Route-level lazy loading — each page is a separate chunk
const SplashScreen = lazy(() => import('./pages/SplashScreen.jsx'));
const SignIn = lazy(() => import('./pages/SignIn.jsx'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const OnboardingQuick = lazy(() => import('./pages/OnboardingQuick'));
const Home = lazy(() => import('./pages/Home'));
const Markets = lazy(() => import('./pages/Markets'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Trade = lazy(() => import('./pages/Trade'));
const Settings = lazy(() => import('./pages/Settings'));
const PaperTrading = lazy(() => import('./pages/PaperTrading'));
const Upgrade = lazy(() => import('./pages/Upgrade'));
const AssetDetail = lazy(() => import('./pages/AssetDetail'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Traders = lazy(() => import('./pages/Traders'));
const TradingSetup = lazy(() => import('./pages/TradingSetup'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const AlpacaConnect = lazy(() => import('./pages/AlpacaConnect'));
const AlpacaCallback = lazy(() => import('./pages/AlpacaCallback'));
const TrekPortfolioWelcome = lazy(() => import('./pages/TrekPortfolioWelcome'));
const Support = lazy(() => import('./pages/Support'));

const LazyFallback = () => (
  <div style={{
    background: '#080B12', minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  }}>
    <div style={{ width: 32, height: 32, border: '3px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

const LazyPage = ({ children }) => (
  <PageTransition>
    <Suspense fallback={<LazyFallback />}>
      {children}
    </Suspense>
  </PageTransition>
);

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
    return <Suspense fallback={<LazyFallback />}><Support /></Suspense>;
  }

  if (!firebaseUser) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/SignIn" element={<LazyPage><SignIn /></LazyPage>} />
          <Route path="/SplashScreen" element={<LazyPage><SplashScreen /></LazyPage>} />
          <Route path="/support" element={<Suspense fallback={<LazyFallback />}><Support /></Suspense>} />
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
        <Route path="/SignIn" element={<LazyPage><SignIn /></LazyPage>} />
        <Route path="/SplashScreen" element={<LazyPage><SplashScreen /></LazyPage>} />
        <Route path="/Onboarding" element={<LazyPage><Onboarding /></LazyPage>} />
        <Route path="/OnboardingQuick" element={<LazyPage><OnboardingQuick /></LazyPage>} />
        <Route path="/Admin" element={<LazyPage><Admin /></LazyPage>} />
        <Route path="/alpaca-connect" element={<LazyPage><AlpacaConnect /></LazyPage>} />
        <Route path="/alpaca-callback" element={<Suspense fallback={<LazyFallback />}><AlpacaCallback /></Suspense>} />
        <Route path="/support" element={<Suspense fallback={<LazyFallback />}><Support /></Suspense>} />
        <Route path="/trek-portfolio-welcome" element={<LazyPage><TrekPortfolioWelcome /></LazyPage>} />
        <Route element={needsOnboarding ? <Navigate to="/Onboarding" replace /> : <AppShell onLogout={logout} />}>
          <Route path="/Home" element={<LazyPage><Home /></LazyPage>} />
          <Route path="/Dashboard" element={<Navigate to="/Home" replace />} />
          <Route path="/Markets" element={<LazyPage><Markets /></LazyPage>} />
          <Route path="/AIInsights" element={<LazyPage><AIInsights /></LazyPage>} />
          <Route path="/Traders" element={<LazyPage><Traders /></LazyPage>} />
          <Route path="/Portfolio" element={<LazyPage><Portfolio /></LazyPage>} />
          <Route path="/Trade" element={<LazyPage><Trade /></LazyPage>} />
          <Route path="/Settings" element={<LazyPage><Settings onLogout={logout} /></LazyPage>} />
          <Route path="/Upgrade" element={<LazyPage><Upgrade /></LazyPage>} />
          <Route path="/PaperTrading" element={<LazyPage><PaperTrading /></LazyPage>} />
          <Route path="/Notifications" element={<LazyPage><Notifications /></LazyPage>} />
          <Route path="/Asset/:symbol" element={<LazyPage><AssetDetail /></LazyPage>} />
          <Route path="/TradingSetup" element={<LazyPage><TradingSetup /></LazyPage>} />
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