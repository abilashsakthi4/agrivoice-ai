import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDetection } from '@/hooks/useDetection';
import ImageUploader from '@/components/ImageUploader';
import DetectionResult from '@/components/DetectionResult';
import LanguageToggle from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Leaf, History, User, LogOut, Shield } from 'lucide-react';

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

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Welcome message */}
        <div className="text-center mb-8">
          <h1 className="font-tamil text-2xl font-bold text-foreground mb-2">
            {t('scanPlant')}
          </h1>
          <p className="font-tamil text-muted-foreground">
            {isGuest ? 'விருந்தினராக தொடர்கிறீர்கள்' : `${t('welcome')}!`}
          </p>
        </div>

        {/* Detection flow */}
        {result ? (
          <DetectionResult result={result} onNewScan={clearResult} />
        ) : (
          <ImageUploader onImageSelect={handleImageSelect} isLoading={isAnalyzing} />
        )}
      </main>
    </div>
  );
};

export default Home;