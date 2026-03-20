import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(() => 
    sessionStorage.getItem('pwa-dismissed') === 'true'
  );
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa-dismissed', 'true');
  };

  if (isInstalled || dismissed) return null;

  // iOS Safari — show manual instructions
  if (isIOS && !isInstallable) {
    return (
      <AnimatePresence>
        {!showIOSGuide ? (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-tamil text-sm font-semibold text-foreground">
                  {t('appName').includes('Crop') ? 'Install Leaf Doctor' : 'ஆப்பை நிறுவுங்கள்'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {t('appName').includes('Crop') ? 'Add to home screen' : 'முகப்புத் திரையில் சேர்க்கவும்'}
                </p>
              </div>
              <Button size="sm" onClick={() => setShowIOSGuide(true)} className="shrink-0 font-tamil">
                {t('appName').includes('Crop') ? 'How?' : 'எப்படி?'}
              </Button>
              <button onClick={handleDismiss} className="text-muted-foreground p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-tamil font-semibold text-foreground">
                  {t('appName').includes('Crop') ? 'Install on iPhone/iPad' : 'iPhone/iPad-ல் நிறுவுதல்'}
                </p>
                <button onClick={handleDismiss} className="text-muted-foreground p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">1</div>
                  <div className="flex items-center gap-1 text-sm text-foreground">
                    <Share className="h-4 w-4 text-primary" />
                    <span className="font-tamil">
                      {t('appName').includes('Crop') ? 'Tap Share button' : 'பகிர் பொத்தானை அழுத்தவும்'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">2</div>
                  <div className="flex items-center gap-1 text-sm text-foreground">
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="font-tamil">
                      {t('appName').includes('Crop') ? '"Add to Home Screen"' : '"முகப்புத் திரையில் சேர்"'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">3</div>
                  <span className="text-sm text-foreground font-tamil">
                    {t('appName').includes('Crop') ? 'Tap "Add"' : '"சேர்" என்பதை அழுத்தவும்'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Android / Desktop — native install prompt
  if (!isInstallable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-tamil text-sm font-semibold text-foreground">
              {t('appName').includes('Crop') ? 'Install Leaf Doctor' : 'ஆப்பை நிறுவுங்கள்'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {t('appName').includes('Crop') ? 'Quick access from home screen' : 'முகப்புத் திரையிலிருந்து விரைவாக அணுகவும்'}
            </p>
          </div>
          <Button size="sm" onClick={install} className="shrink-0 gap-1 font-tamil">
            <Download className="h-3.5 w-3.5" />
            {t('appName').includes('Crop') ? 'Install' : 'நிறுவு'}
          </Button>
          <button onClick={handleDismiss} className="text-muted-foreground p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
