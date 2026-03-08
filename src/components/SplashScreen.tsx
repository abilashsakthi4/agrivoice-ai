import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
import heroFarmer from '@/assets/hero-farmer.jpg';
import appLogo from '@/assets/app-logo.png';
interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase('hold'), 300);
    const exitTimer = setTimeout(() => setPhase('exit'), 1400);
    const completeTimer = setTimeout(onComplete, 1800);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background Image */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <img
              src={heroFarmer}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(142_45%_15%/0.85)] via-[hsl(142_40%_12%/0.75)] to-[hsl(25_35%_10%/0.9)]" />
          </motion.div>

          {/* Floating Leaf Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-[hsl(var(--leaf-light))] opacity-15"
              initial={{
                x: `${15 + i * 15}vw`,
                y: '-10vh',
                rotate: 0,
                scale: 0.6 + Math.random() * 0.8,
              }}
              animate={{
                y: '110vh',
                rotate: 360,
                x: `${15 + i * 15 + (Math.random() - 0.5) * 20}vw`,
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                delay: i * 0.4,
                ease: 'linear',
                repeat: Infinity,
              }}
            >
              <Leaf className="h-8 w-8" />
            </motion.div>
          ))}

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center px-6">
            {/* Logo Mark */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
            >
              <motion.div
                className="absolute inset-[-12px] rounded-full bg-[hsl(var(--harvest))]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.25, scale: 1.3 }}
                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, repeatType: 'reverse' }}
              />
              <div className="relative w-28 h-28 rounded-3xl bg-[hsl(var(--rice))] shadow-2xl flex items-center justify-center border-4 border-[hsl(var(--harvest)/0.4)] overflow-hidden">
                <img src={appLogo} alt="Crop Doctor" className="w-24 h-24 object-contain" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="font-tamil text-4xl sm:text-5xl font-bold text-[hsl(var(--rice))] mb-3 text-center"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              {t('appName')}
            </motion.h1>

            {/* Decorative Line */}
            <motion.div
              className="w-16 h-1 rounded-full bg-[hsl(var(--harvest))] mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            />

            {/* Tagline */}
            <motion.p
              className="font-tamil text-xl text-[hsl(var(--rice)/0.9)] mb-2 text-center"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              {t('splashTagline')}
            </motion.p>

            <motion.p
              className="font-tamil text-sm text-[hsl(var(--rice)/0.65)] text-center max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              {t('splashSubtitle')}
            </motion.p>

            {/* Loading Dots */}
            <motion.div
              className="flex gap-2 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--harvest))]"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[hsl(25_35%_8%/0.6)] to-transparent" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
