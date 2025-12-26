import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang: Language = language === 'ta' ? 'en' : 'ta';
    setLanguage(newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={`gap-2 bg-card/80 border-border hover:bg-accent ${className}`}
    >
      <Globe className="h-4 w-4" />
      <span className="font-tamil">
        {language === 'ta' ? 'English' : 'தமிழ்'}
      </span>
    </Button>
  );
};

export default LanguageToggle;