import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Leaf, Sun, Droplets } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'linear-gradient(180deg, hsl(142 45% 28%) 0%, hsl(142 50% 20%) 50%, hsl(25 35% 20%) 100%)',
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating leaves */}
        <div className="absolute top-20 left-10 animate-float opacity-20">
          <Leaf className="h-16 w-16 text-leaf-light" />
        </div>
        <div className="absolute top-40 right-20 animate-float opacity-20" style={{ animationDelay: '1s' }}>
          <Leaf className="h-12 w-12 text-leaf-light" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float opacity-20" style={{ animationDelay: '2s' }}>
          <Leaf className="h-20 w-20 text-leaf-light" />
        </div>
        
        {/* Sun rays */}
        <div className="absolute top-0 right-0 opacity-10">
          <Sun className="h-40 w-40 text-harvest animate-spin" style={{ animationDuration: '20s' }} />
        </div>
        
        {/* Water drops */}
        <div className="absolute bottom-20 right-10 animate-float opacity-20" style={{ animationDelay: '0.5s' }}>
          <Droplets className="h-10 w-10 text-water" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6">
        {/* Logo/Icon */}
        <div className="mb-8 animate-scale-in">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-harvest/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-rice/90 rounded-full p-6 shadow-2xl">
              <Leaf className="h-20 w-20 text-primary animate-sway" />
            </div>
          </div>
        </div>

        {/* App name */}
        <h1 className="font-tamil text-4xl font-bold text-rice mb-3 animate-fade-in-up text-shadow-lg">
          {t('appName')}
        </h1>

        {/* Tagline */}
        <p className="font-tamil text-xl text-rice/90 mb-2 animate-fade-in-up text-shadow" style={{ animationDelay: '0.3s' }}>
          {t('splashTagline')}
        </p>
        
        <p className="font-tamil text-base text-rice/70 animate-fade-in-up text-shadow" style={{ animationDelay: '0.5s' }}>
          {t('splashSubtitle')}
        </p>

        {/* Loading indicator */}
        <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-harvest rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-3 h-3 bg-harvest rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 bg-harvest rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-soil/50 to-transparent" />
    </div>
  );
};

export default SplashScreen;