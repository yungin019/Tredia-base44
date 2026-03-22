import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import PageTransition from '@/components/ui/page-transition';

import AppShell from './components/layout/AppShell';
import SplashScreen from './pages/SplashScreen';
import SignIn from './pages/SignIn';
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

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="text-xs text-muted-foreground font-mono">TREDIO</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/SignIn" replace />;
  }

  return children;
};

const AuthenticatedApp = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span className="text-xs text-muted-foreground font-mono">TREDIO</span>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={user ? <Navigate to="/Home" replace /> : <Navigate to="/SignIn" replace />} />
        <Route path="/SignIn" element={user ? <Navigate to="/Home" replace /> : <PageTransition><SignIn /></PageTransition>} />
        <Route path="/SplashScreen" element={<PageTransition><SplashScreen /></PageTransition>} />
        <Route path="/Onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/Home" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/Dashboard" element={<Navigate to="/Home" replace />} />
          <Route path="/Markets" element={<PageTransition><Markets /></PageTransition>} />
          <Route path="/AIInsights" element={<PageTransition><AIInsights /></PageTransition>} />
          <Route path="/Traders" element={<PageTransition><Traders /></PageTransition>} />
          <Route path="/Portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
          <Route path="/Trade" element={<PageTransition><Trade /></PageTransition>} />
          <Route path="/Settings" element={<PageTransition><Settings /></PageTransition>} />
          <Route path="/Upgrade" element={<PageTransition><Upgrade /></PageTransition>} />
          <Route path="/PaperTrading" element={<PageTransition><PaperTrading /></PageTransition>} />
          <Route path="/Notifications" element={<PageTransition><Notifications /></PageTransition>} />
          <Route path="/Asset/:symbol" element={<PageTransition><AssetDetail /></PageTransition>} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App
