import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, Newspaper, TrendingUp, Shield, Check, Sprout, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

const PLATFORMS = [
  { id: 'etoro', name: 'eToro' },
  { id: 'avanza', name: 'Avanza' },
  { id: 'robinhood', name: 'Robinhood' },
  { id: 'coinbase', name: 'Coinbase' },
  { id: 'other', name: 'Other' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const totalScreens = experienceLevel === 'existing' && selectedPlatform ? 8 : 7;

  const nextScreen = () => {
    if (currentScreen < totalScreens) {
      setCurrentScreen(prev => prev + 1);
    }
  };

  const skipToExperience = () => {
    setCurrentScreen(6);
  };

  const selectExperience = (level) => {
    setExperienceLevel(level);
    if (level === 'new') {
      setCurrentScreen(7);
    } else {
      setCurrentScreen(7);
    }
  };

  const selectPlatform = (platformId) => {
    setSelectedPlatform(platformId);
    setCurrentScreen(8);
  };

  const completeOnboarding = async () => {
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      await base44.auth.updateMe({
        onboarding_completed: true,
        experience_level: experienceLevel,
        existing_platform: selectedPlatform,
      });
      // Full reload so App.jsx re-fetches the updated user profile
      window.location.href = '/Home';
    } catch (error) {
      console.error('Error completing onboarding:', error);
      window.location.href = '/Home';
    } finally {
      setIsCompleting(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-[#080B12] text-white overflow-hidden relative">
      {currentScreen >= 2 && currentScreen <= 5 && (
        <button
          onClick={skipToExperience}
          className="absolute top-6 right-6 z-50 text-gray-400 hover:text-white transition-colors text-sm"
        >
          Skip
        </button>
      )}

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-50">
        {Array.from({ length: totalScreens }).map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx + 1 === currentScreen
                ? 'w-8 bg-[#F59E0B]'
                : idx + 1 < currentScreen
                ? 'w-2 bg-[#F59E0B]/50'
                : 'w-2 bg-gray-600'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentScreen === 1 && (
          <motion.div
            key="screen1"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-12"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                <Zap className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold mb-4 text-center"
            >
              Welcome to TREDIO
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-400 mb-16 text-center max-w-md"
            >
              Your personal AI trading mentor
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={nextScreen}
                size="lg"
                className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white px-12 py-6 text-lg rounded-xl shadow-lg shadow-[#F59E0B]/20"
              >
                GET STARTED
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {currentScreen === 2 && (
          <motion.div
            key="screen2"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-12"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                <Zap className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold mb-6 text-center"
            >
              Meet TREK
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-300 mb-16 text-center max-w-lg leading-relaxed"
            >
              TREK is your AI mentor that analyzes every trade before you make it.
              Think of it as having a Wall Street analyst in your pocket — 24/7.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={nextScreen}
                size="lg"
                className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white px-12 py-6 text-lg rounded-xl"
              >
                NEXT
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {currentScreen === 3 && (
          <motion.div
            key="screen3"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-12"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                <Newspaper className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold mb-6 text-center"
            >
              Your Intelligence Feed
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-300 mb-16 text-center max-w-lg leading-relaxed"
            >
              Every day TREK scans global markets and tells you exactly what's happening,
              what to watch, and what to avoid. No charts to decode. Just clear signals with reasons.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={nextScreen}
                size="lg"
                className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white px-12 py-6 text-lg rounded-xl"
              >
                NEXT
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {currentScreen === 4 && (
          <motion.div
            key="screen4"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-12"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold mb-6 text-center"
            >
              Live Markets
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-300 mb-16 text-center max-w-lg leading-relaxed"
            >
              See every sector, stock and crypto in real time. TREK grades each one —
              BUY, HOLD or SELL — with exact price levels and reasons. Never guess again.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={nextScreen}
                size="lg"
                className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white px-12 py-6 text-lg rounded-xl"
              >
                NEXT
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {currentScreen === 5 && (
          <motion.div
            key="screen5"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-12"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold mb-6 text-center"
            >
              TREK Checks Every Trade
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-300 mb-16 text-center max-w-lg leading-relaxed"
            >
              Before you buy or sell anything, TREK gives you the full picture.
              Entry price. Target. Stop loss. Confidence score. Exact reasons.
              You always know WHY before you act.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={nextScreen}
                size="lg"
                className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white px-12 py-6 text-lg rounded-xl"
              >
                NEXT
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {currentScreen === 6 && (
          <motion.div
            key="screen6"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 pb-24"
          >
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-12 text-center"
            >
              How do you invest?
            </motion.h2>

            <div className="w-full max-w-md space-y-4">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card
                  onClick={() => selectExperience('new')}
                  className="bg-[#0F1419] border-2 border-gray-700 hover:border-[#F59E0B] cursor-pointer transition-all p-6 hover:shadow-lg hover:shadow-[#F59E0B]/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🌱</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-white">I'm new to investing</h3>
                      <p className="text-gray-400 leading-relaxed">
                        TREK will guide you from your very first trade
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Card
                  onClick={() => selectExperience('existing')}
                  className="bg-[#0F1419] border-2 border-gray-700 hover:border-[#F59E0B] cursor-pointer transition-all p-6 hover:shadow-lg hover:shadow-[#F59E0B]/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📈</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-white">I already invest</h3>
                      <p className="text-gray-400 leading-relaxed">
                        TREK will upgrade your existing strategy
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {currentScreen === 7 && experienceLevel === 'existing' && (
          <motion.div
            key="screen7-platform"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 pb-24"
          >
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-4 text-center"
            >
              Which platform do you use?
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 mb-12 text-center max-w-md"
            >
              TREK works alongside your existing platform
            </motion.p>

            <div className="w-full max-w-md grid grid-cols-2 gap-3">
              {PLATFORMS.map((platform, idx) => (
                <motion.button
                  key={platform.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  onClick={() => selectPlatform(platform.id)}
                  className="bg-[#0F1419] border-2 border-gray-700 hover:border-[#F59E0B] text-white py-4 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-[#F59E0B]/20 font-medium"
                >
                  {platform.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {currentScreen === 8 && experienceLevel === 'existing' && selectedPlatform && (
          <motion.div
            key="screen8-existing-ready"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                <Check className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 mb-6 text-center max-w-md"
            >
              TREK works alongside {PLATFORMS.find(p => p.id === selectedPlatform)?.name}.
              Log your trades and get the analysis {PLATFORMS.find(p => p.id === selectedPlatform)?.name} never gives you.
            </motion.p>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-3xl md:text-4xl font-bold mb-4 text-center"
            >
              TREK is ready.
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl text-gray-300 mb-16 text-center"
            >
              Your AI edge starts now.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={completeOnboarding}
                disabled={isCompleting}
                size="lg"
                className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white px-12 py-6 text-lg rounded-xl shadow-lg shadow-[#F59E0B]/20"
              >
                {isCompleting ? 'LOADING...' : 'GO TO MY FEED'}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {currentScreen === 7 && experienceLevel === 'new' && (
          <motion.div
            key="screen7-new-ready"
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                <Check className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold mb-4 text-center"
            >
              You're ready to learn.
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-300 mb-16 text-center max-w-md leading-relaxed"
            >
              Start with practice trading. Zero risk. Real intelligence.
              TREK guides every step.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={completeOnboarding}
                disabled={isCompleting}
                size="lg"
                className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white px-12 py-6 text-lg rounded-xl shadow-lg shadow-[#F59E0B]/20"
              >
                {isCompleting ? 'LOADING...' : 'GO TO MY FEED'}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}