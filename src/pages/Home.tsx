import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDetection } from '@/hooks/useDetection';
import ImageUploader from '@/components/ImageUploader';
import DetectionResult from '@/components/DetectionResult';
import LanguageToggle from '@/components/LanguageToggle';
import WeatherWidget from '@/components/WeatherWidget';
import FarmingTips from '@/components/FarmingTips';
import CropCalendar from '@/components/CropCalendar';
import { Button } from '@/components/ui/button';
import { Leaf, History, User, LogOut, Shield, ScanLine, Sprout, ShieldCheck } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import heroFarmer from '@/assets/hero-farmer.jpg';
import leafDisease from '@/assets/leaf-disease.jpg';
import healthyLeaf from '@/assets/healthy-leaf.jpg';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { user, isGuest, isAdmin, signOut } = useAuth();
  const { analyzeImage, isAnalyzing, result, clearResult } = useDetection();
  const navigate = useNavigate();

  const handleImageSelect = async (base64: string) => {
    await analyzeImage(base64);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const features = [
    {
      icon: ScanLine,
      titleTa: 'நோயைக் கண்டறி',
      titleEn: 'Detect Disease',
      descTa: 'இலையின் புகைப்படத்தை எடுத்து நோயை உடனடியாக கண்டறியுங்கள்',
      descEn: 'Take a photo of the leaf and instantly detect the disease',
      image: leafDisease,
    },
    {
      icon: Sprout,
      titleTa: 'இயற்கை தீர்வு',
      titleEn: 'Organic Remedy',
      descTa: 'பாரம்பரிய மற்றும் இயற்கை வழிகளில் தீர்வு பெறுங்கள்',
      descEn: 'Get solutions through traditional and organic methods',
      image: healthyLeaf,
    },
    {
      icon: ShieldCheck,
      titleTa: 'பயிர் பாதுகாப்பு',
      titleEn: 'Crop Protection',
      descTa: 'உங்கள் பயிர்களை நோய்களிலிருந்து பாதுகாக்கவும்',
      descEn: 'Protect your crops from diseases',
      image: heroFarmer,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-tamil font-bold text-lg">{t('appName')}</span>
          </div>
          
          <div className="flex items-center gap-2">
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

      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={heroFarmer}
          alt="Tamil Nadu farmer in rice paddy field"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 text-center px-4">
          <h1 className="font-tamil text-2xl sm:text-3xl font-bold text-foreground drop-shadow-lg mb-1">
            {t('appName')}
          </h1>
          <p className="font-tamil text-sm sm:text-base text-muted-foreground">
            {isGuest ? 'விருந்தினராக தொடர்கிறீர்கள்' : `${t('welcome')}!`}
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Weather Widget */}
        <WeatherWidget />

        {/* Feature Cards */}
        {!result && (
          <div className="grid grid-cols-3 gap-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="relative rounded-xl overflow-hidden aspect-square group"
              >
                <img
                  src={f.image}
                  alt={f.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                  <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground mb-1" />
                  <p className="font-tamil text-[10px] sm:text-xs font-semibold text-primary-foreground leading-tight">
                    {t('appName').includes('Crop') ? f.titleEn : f.titleTa}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detection flow */}
        {result ? (
          <DetectionResult result={result} onNewScan={clearResult} />
        ) : (
          <div>
            <h2 className="font-tamil text-xl font-bold text-foreground mb-4 text-center">
              {t('scanPlant')}
            </h2>
            <ImageUploader onImageSelect={handleImageSelect} isLoading={isAnalyzing} />
          </div>
        )}

        {/* Crop Calendar */}
        {!result && <CropCalendar />}

        {/* Farming Tips */}
        {!result && <FarmingTips />}
      </main>
    </div>
  );
};

export default Home;
