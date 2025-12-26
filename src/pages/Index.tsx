import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/LanguageToggle';
import SplashScreen from '@/components/SplashScreen';
import { Leaf, LogIn, UserPlus } from 'lucide-react';

const Index: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-background leaf-pattern flex flex-col">
      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
            <Leaf className="h-12 w-12 text-primary animate-sway" />
          </div>
          <h1 className="font-tamil text-3xl font-bold text-foreground mb-2">
            {t('appName')}
          </h1>
          <p className="font-tamil text-lg text-muted-foreground">
            {t('splashTagline')}
          </p>
        </div>

        {/* Action buttons */}
        <div className="w-full max-w-xs space-y-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={() => navigate('/auth')}
            className="w-full h-14 text-lg font-tamil gap-3 gradient-field"
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
            className="w-full h-12 font-tamil"
          >
            {t('skipLogin')}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground font-tamil">
          AI மூலம் செடி நோய்களை கண்டறியுங்கள்
        </p>
      </div>
    </div>
  );
};

export default Index;