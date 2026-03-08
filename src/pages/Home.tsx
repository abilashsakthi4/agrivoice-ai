import React, { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDetection } from '@/hooks/useDetection';
import { motion, type Easing } from 'framer-motion';
import ImageUploader from '@/components/ImageUploader';
import DetectionResult from '@/components/DetectionResult';
import LanguageToggle from '@/components/LanguageToggle';
import BottomNav from '@/components/BottomNav';
import DarkModeToggle from '@/components/DarkModeToggle';
import { Button } from '@/components/ui/button';
import { Leaf, History, User, LogOut, Shield, ScanLine, Sprout, ShieldCheck } from 'lucide-react';
import heroFarmer from '@/assets/hero-farmer.jpg';
import leafDisease from '@/assets/leaf-disease.jpg';
import healthyLeaf from '@/assets/healthy-leaf.jpg';

// Lazy-load below-the-fold sections
const WeatherWidget = lazy(() => import('@/components/WeatherWidget'));
const CropCalendar = lazy(() => import('@/components/CropCalendar'));
const QuickTipsCarousel = lazy(() => import('@/components/QuickTipsCarousel'));
const FarmingTips = lazy(() => import('@/components/FarmingTips'));
const NotificationSettings = lazy(() => import('@/components/NotificationSettings'));

const EASE: Easing = [0, 0, 0.2, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: EASE },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.05 + i * 0.1, duration: 0.3, ease: EASE },
  }),
};

const SectionLoader = () => (
  <div className="flex items-center justify-center py-8">
    <Leaf className="h-5 w-5 text-primary animate-pulse" />
  </div>
);

const features = [
  { icon: ScanLine, titleTa: 'நோயைக் கண்டறி', titleEn: 'Detect Disease', image: leafDisease },
  { icon: Sprout, titleTa: 'இயற்கை தீர்வு', titleEn: 'Organic Remedy', image: healthyLeaf },
  { icon: ShieldCheck, titleTa: 'பயிர் பாதுகாப்பு', titleEn: 'Crop Protection', image: heroFarmer },
];

const FeatureCards = memo(({ t }: { t: (k: string) => string }) => (
  <div className="grid grid-cols-3 gap-3">
    {features.map((f, i) => (
      <motion.div
        key={i}
        custom={i}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={scaleIn}
        className="relative rounded-xl overflow-hidden aspect-square group cursor-pointer will-change-transform"
      >
        <img
          src={f.image}
          alt={f.titleEn}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
          <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground mb-1" />
          <p className="font-tamil text-[10px] sm:text-xs font-semibold text-primary-foreground leading-tight">
            {t('appName').includes('Crop') ? f.titleEn : f.titleTa}
          </p>
        </div>
      </motion.div>
    ))}
  </div>
));
FeatureCards.displayName = 'FeatureCards';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { user, isGuest, isAdmin, signOut } = useAuth();
  const { analyzeImage, isAnalyzing, result, clearResult } = useDetection();
  const navigate = useNavigate();

  const handleImageSelect = useCallback(async (base64: string) => {
    await analyzeImage(base64);
  }, [analyzeImage]);

  const handleLogout = useCallback(async () => {
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-tamil font-bold text-lg">{t('appName')}</span>
          </div>
          <div className="flex items-center gap-1">
            <DarkModeToggle />
            <LanguageToggle />
            {user && !isGuest && (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
                  <History className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                  <User className="h-5 w-5" />
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                    <Shield className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}
            {(user || isGuest) && (
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section – faster animation */}
      <section className="relative h-64 sm:h-80 overflow-hidden">
        <motion.img
          src={heroFarmer}
          alt="Tamil Nadu farmer in rice paddy field"
          className="w-full h-full object-cover will-change-transform"
          loading="eager"
          fetchPriority="high"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <motion.div
          className="absolute bottom-6 left-0 right-0 text-center px-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
        >
          <h1 className="font-tamil text-2xl sm:text-3xl font-bold text-foreground drop-shadow-lg mb-1">
            {t('appName')}
          </h1>
          <p className="font-tamil text-sm sm:text-base text-muted-foreground">
            {isGuest ? 'விருந்தினராக தொடர்கிறீர்கள்' : `${t('welcome')}!`}
          </p>
        </motion.div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Weather Widget */}
        <Suspense fallback={<SectionLoader />}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            <WeatherWidget />
          </motion.div>
        </Suspense>

        {/* Feature Cards */}
        {!result && <FeatureCards t={t} />}

        {/* Detection flow */}
        {result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <DetectionResult result={result} onNewScan={clearResult} />
          </motion.div>
        ) : (
          <motion.div
            id="scan-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            custom={0}
            variants={fadeUp}
          >
            <h2 className="font-tamil text-xl font-bold text-foreground mb-4 text-center">
              {t('scanPlant')}
            </h2>
            <ImageUploader onImageSelect={handleImageSelect} isLoading={isAnalyzing} />
          </motion.div>
        )}

        {/* Below-fold lazy sections */}
        {!result && (
          <Suspense fallback={<SectionLoader />}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} custom={0} variants={fadeUp}>
              <CropCalendar />
            </motion.div>
          </Suspense>
        )}

        {!result && (
          <Suspense fallback={<SectionLoader />}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} custom={0} variants={fadeUp}>
              <QuickTipsCarousel />
            </motion.div>
          </Suspense>
        )}

        {!result && (
          <Suspense fallback={<SectionLoader />}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} custom={0} variants={fadeUp}>
              <FarmingTips />
            </motion.div>
          </Suspense>
        )}

        {!result && (
          <Suspense fallback={<SectionLoader />}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} custom={0} variants={fadeUp}>
              <NotificationSettings />
            </motion.div>
          </Suspense>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
