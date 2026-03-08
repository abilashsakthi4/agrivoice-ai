import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/LanguageToggle';
import SplashScreen from '@/components/SplashScreen';
import { LogIn, ArrowRight } from 'lucide-react';
import heroFarmer from '@/assets/hero-farmer.jpg';
import appLogo from '@/assets/app-logo.png';

const Index: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroFarmer} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      {/* Language toggle */}
      <motion.div
        className="absolute top-4 right-4 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <LanguageToggle />
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        {/* Logo */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/90 flex items-center justify-center mb-5 mx-auto shadow-lg rotate-6">
            <Leaf className="h-10 w-10 text-primary-foreground -rotate-6" />
          </div>
          <h1 className="font-tamil text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {t('appName')}
          </h1>
          <p className="font-tamil text-base text-muted-foreground max-w-xs mx-auto">
            {t('splashTagline')}
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="w-full max-w-xs space-y-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Button
            onClick={() => navigate('/auth')}
            className="w-full h-14 text-lg font-tamil gap-3 bg-primary hover:bg-primary/90 shadow-lg"
          >
            <LogIn className="h-5 w-5" />
            {t('login')} / {t('register')}
          </Button>

          <Button
            onClick={() => {
              sessionStorage.setItem('guestMode', 'true');
              navigate('/home');
            }}
            variant="outline"
            className="w-full h-12 font-tamil gap-2 bg-card/80 backdrop-blur border-border"
          >
            {t('skipLogin')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="relative z-10 p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs text-muted-foreground font-tamil">
          {t('splashSubtitle')}
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
