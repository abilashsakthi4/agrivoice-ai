import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, ScanLine, History, User } from 'lucide-react';

const navItems = [
  { path: '/home', icon: Home, labelTa: 'முகப்பு', labelEn: 'Home' },
  { path: '/home', icon: ScanLine, labelTa: 'ஸ்கேன்', labelEn: 'Scan', hash: '#scan' },
  { path: '/history', icon: History, labelTa: 'வரலாறு', labelEn: 'History' },
  { path: '/profile', icon: User, labelTa: 'சுயவிவரம்', labelEn: 'Profile' },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const isActive = (item: typeof navItems[0]) => {
    if (item.hash) return location.pathname === item.path && location.hash === item.hash;
    return location.pathname === item.path && !location.hash;
  };

  const handleNav = (item: typeof navItems[0]) => {
    if (item.hash) {
      navigate(item.path + item.hash);
      // Scroll to scan section
      setTimeout(() => {
        document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(item.path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.labelEn}
              onClick={() => handleNav(item)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
              <span className="font-tamil text-[10px] font-medium">
                {language === 'ta' ? item.labelTa : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
