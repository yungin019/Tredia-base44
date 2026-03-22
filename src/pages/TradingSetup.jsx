import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, DollarSign, Shield, Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const TradingSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    country: '',
    street: '',
    city: '',
    postalCode: '',
    employment: '',
    income: '',
    experience: '',
    goal: ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const progressSteps = [
    { num: 1, label: 'Welcome' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Address' },
    { num: 4, label: 'Questions' },
    { num: 5, label: 'Setup' }
  ];

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
            style={{ background: '#080B12' }}
          >
            <div className="text-4xl font-black text-[#F59E0B] mb-12 tracking-widest">TREDIO</div>

            <h1 className="text-3xl font-black text-white mb-4">Ready to trade real stocks?</h1>

            <div className="grid gap-4 w-full max-w-md my-8">
              <Card className="bg-[#0D1117] border-[#F59E0B]/20 p-6">
                <div className="text-3xl mb-3">💰</div>
                <p className="text-white font-bold mb-1">Real stocks and crypto</p>
                <p className="text-sm text-white/60">Trade thousands of assets</p>
              </Card>
              <Card className="bg-[#0D1117] border-[#F59E0B]/20 p-6">
                <div className="text-3xl mb-3">🛡️</div>
                <p className="text-white font-bold mb-1">Your money protected up to $500k</p>
                <p className="text-sm text-white/60">SIPC insured</p>
              </Card>
              <Card className="bg-[#0D1117] border-[#F59E0B]/20 p-6">
                <div className="text-3xl mb-3">⚡</div>
                <p className="text-white font-bold mb-1">TREK guides every trade</p>
                <p className="text-sm text-white/60">AI analysis before you buy</p>
              </Card>
            </div>

            <p className="text-white/70 text-sm max-w-md mb-8">
              TREDIO connects to a regulated trading account on your behalf. Commission-free. Takes 3 minutes.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-md">
              <Button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold h-12"
              >
                LET'S DO IT <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate('/PaperTrading')}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5 h-12"
              >
                PRACTICE FIRST
              </Button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen p-6"
            style={{ background: '#080B12' }}
          >
            <Button
              onClick={() => setStep(1)}
              variant="ghost"
              className="text-white/60 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <div className="flex gap-2 mb-8">
              {progressSteps.slice(0, 4).map((s, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full transition-all"
                  style={{
                    background: i < step - 1 ? '#F59E0B' : 'rgba(255,255,255,0.1)'
                  }}
                />
              ))}
            </div>

            <h2 className="text-2xl font-black text-white mb-2">Your details</h2>
            <p className="text-white/60 mb-8">Quick and secure</p>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-white text-sm font-bold mb-2 block">First name</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className="bg-[#0D1117] border-white/10 text-white focus:border-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-white text-sm font-bold mb-2 block">Last name</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className="bg-[#0D1117] border-white/10 text-white focus:border-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-white text-sm font-bold mb-2 block">Date of birth</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="bg-[#0D1117] border-white/10 text-white focus:border-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-white text-sm font-bold mb-2 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="bg-[#0D1117] border-white/10 text-white focus:border-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-white text-sm font-bold mb-2 block">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="bg-[#0D1117] border-white/10 text-white focus:border-[#F59E0B]"
                />
              </div>
            </div>

            <Button
              onClick={() => setStep(3)}
              className="w-full max-w-md mt-8 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold h-12"
            >
              CONTINUE <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen p-6"
            style={{ background: '#080B12' }}
          >
            <Button
              onClick={() => setStep(2)}
              variant="ghost"
              className="text-white/60 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <div className="flex gap-2 mb-8">
              {progressSteps.slice(0, 4).map((s, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full transition-all"
                  style={{
                    background: i < step - 1 ? '#F59E0B' : 'rgba(255,255,255,0.1)'
                  }}
                />
              ))}
            </div>

            <h2 className="text-2xl font-black text-white mb-8">Where do you live?</h2>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-white text-sm font-bold mb-2 block">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="United States"
                  className="bg-[#0D1117] border-white/10 text-white focus:border-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-white text-sm font-bold mb-2 block">Street address</label>
                <Input
                  value={formData.street}
                  onChange={(e) => updateField('street', e.target.value)}
                  className="bg-[#0D1117] border-white/10 text-white focus:border-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-white text-sm font-bold mb-2 block">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="bg-[#0D1117] border-white/10 text-white focus:border-[#F59E0B]"
                />
              </div>
              <div>
                <label className="text-white text-sm font-bold mb-2 block">Postal code</label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  className="bg-[#0D1117] border-white/10 text-white focus:border-[#F59E0B]"
                />
              </div>
            </div>

            <Button
              onClick={() => setStep(4)}
              className="w-full max-w-md mt-8 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold h-12"
            >
              CONTINUE <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen p-6"
            style={{ background: '#080B12' }}
          >
            <Button
              onClick={() => setStep(3)}
              variant="ghost"
              className="text-white/60 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <div className="flex gap-2 mb-8">
              {progressSteps.slice(0, 4).map((s, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full transition-all"
                  style={{
                    background: i < step - 1 ? '#F59E0B' : 'rgba(255,255,255,0.1)'
                  }}
                />
              ))}
            </div>

            <h2 className="text-2xl font-black text-white mb-2">A few quick questions</h2>
            <p className="text-white/60 mb-8">Required by law to keep you safe</p>

            <div className="space-y-6 max-w-md">
              <div>
                <label className="text-white text-sm font-bold mb-3 block">Employment</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Employed', 'Self-employed', 'Student', 'Retired'].map(opt => (
                    <Button
                      key={opt}
                      onClick={() => updateField('employment', opt)}
                      variant="outline"
                      className={`border-white/20 ${formData.employment === opt ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-white' : 'text-white/60 hover:bg-white/5'}`}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-bold mb-3 block">Annual income</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Under $20k', '$20-50k', '$50-100k', 'Over $100k'].map(opt => (
                    <Button
                      key={opt}
                      onClick={() => updateField('income', opt)}
                      variant="outline"
                      className={`border-white/20 ${formData.income === opt ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-white' : 'text-white/60 hover:bg-white/5'}`}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-bold mb-3 block">Investment experience</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Some experience', 'Expert'].map(opt => (
                    <Button
                      key={opt}
                      onClick={() => updateField('experience', opt)}
                      variant="outline"
                      className={`border-white/20 ${formData.experience === opt ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-white' : 'text-white/60 hover:bg-white/5'}`}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-bold mb-3 block">Investment goal</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Grow my savings', 'Generate income', 'Learn to invest', 'Active trading'].map(opt => (
                    <Button
                      key={opt}
                      onClick={() => updateField('goal', opt)}
                      variant="outline"
                      className={`border-white/20 ${formData.goal === opt ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-white' : 'text-white/60 hover:bg-white/5'}`}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep(5)}
              className="w-full max-w-md mt-8 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold h-12"
            >
              CONTINUE <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        );

      case 5:
        setTimeout(() => setStep(6), 4000);
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
            style={{ background: '#080B12' }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-4xl font-black text-[#F59E0B] mb-8 tracking-widest"
            >
              TREDIO
            </motion.div>

            <div style={{
              width: 48,
              height: 48,
              border: '4px solid #F59E0B',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: 32
            }} />

            <motion.p
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/80 text-center"
            >
              Setting up your account...
            </motion.p>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
            style={{ background: '#080B12' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-[#00D68F]/20 flex items-center justify-center mb-6"
            >
              <Check className="w-10 h-10 text-[#00D68F]" />
            </motion.div>

            <h1 className="text-3xl font-black text-white mb-2">You're ready to trade!</h1>
            <p className="text-white/70 mb-8 max-w-md">
              Your TREDIO trading account is live. TREK will guide every trade you make.
            </p>

            <Card className="bg-[#0D1117] border-[#F59E0B]/20 p-6 mb-8 max-w-md w-full">
              <p className="text-white/60 text-sm mb-2">Starting balance</p>
              <p className="text-3xl font-black text-white">$0.00</p>
            </Card>

            <div className="flex flex-col gap-3 w-full max-w-md">
              <Button
                onClick={() => navigate('/Home')}
                className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold h-12"
              >
                ADD FUNDS
              </Button>
              <Button
                onClick={() => navigate('/Home')}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5 h-12"
              >
                EXPLORE FIRST — I'll add funds later
              </Button>
            </div>

            <p className="text-xs text-white/40 mt-8 max-w-md">
              Your funds are held by our regulated partner and protected up to $500,000. TREDIO never holds or touches your money.
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderStep()}
    </AnimatePresence>
  );
};

export default TradingSetup;
