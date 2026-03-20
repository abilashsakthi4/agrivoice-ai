import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Share, Plus, MoreVertical, Monitor, Smartphone,
  Apple, Chrome, ArrowLeft, CheckCircle2, Leaf, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Platform = 'android' | 'ios' | 'desktop' | null;

const Install: React.FC = () => {
  const { language } = useLanguage();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);

  const en = language === 'en';

  const platforms = [
    {
      id: 'android' as Platform,
      icon: Smartphone,
      title: en ? 'Android' : 'ஆண்ட்ராய்டு',
      subtitle: en ? 'Chrome / Samsung Browser' : 'Chrome / Samsung உலாவி',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'ios' as Platform,
      icon: Apple,
      title: en ? 'iPhone / iPad' : 'iPhone / iPad',
      subtitle: en ? 'Safari Browser' : 'Safari உலாவி',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'desktop' as Platform,
      icon: Monitor,
      title: en ? 'Desktop / Laptop' : 'கணினி / லேப்டாப்',
      subtitle: en ? 'Chrome / Edge' : 'Chrome / Edge உலாவி',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  ];

  const androidSteps = en
    ? [
        { icon: Chrome, text: 'Open this website in Chrome browser' },
        { icon: MoreVertical, text: 'Tap the ⋮ menu (top-right corner)' },
        { icon: Plus, text: 'Select "Add to Home screen" or "Install app"' },
        { icon: CheckCircle2, text: 'Tap "Install" to confirm' },
        { icon: Leaf, text: 'Open Leaf Doctor from your home screen!' },
      ]
    : [
        { icon: Chrome, text: 'Chrome உலாவியில் இந்த வலைத்தளத்தை திறக்கவும்' },
        { icon: MoreVertical, text: 'மேல் வலது மூலையில் உள்ள ⋮ பட்டியலை அழுத்தவும்' },
        { icon: Plus, text: '"முகப்புத் திரையில் சேர்" அல்லது "ஆப்பை நிறுவு" என்பதை தேர்வு செய்யவும்' },
        { icon: CheckCircle2, text: '"நிறுவு" என்பதை அழுத்தி உறுதி செய்யவும்' },
        { icon: Leaf, text: 'உங்கள் முகப்புத் திரையிலிருந்து இலை மருத்துவரை திறக்கவும்!' },
      ];

  const iosSteps = en
    ? [
        { icon: Chrome, text: 'Open this website in Safari (required for iOS)' },
        { icon: Share, text: 'Tap the Share button (□↑) at the bottom' },
        { icon: Plus, text: 'Scroll down and tap "Add to Home Screen"' },
        { icon: CheckCircle2, text: 'Tap "Add" in the top-right corner' },
        { icon: Leaf, text: 'Open Leaf Doctor from your home screen!' },
      ]
    : [
        { icon: Chrome, text: 'Safari உலாவியில் இந்த வலைத்தளத்தை திறக்கவும் (iOS-க்கு அவசியம்)' },
        { icon: Share, text: 'கீழே உள்ள பகிர் பொத்தானை (□↑) அழுத்தவும்' },
        { icon: Plus, text: 'கீழே உருட்டி "முகப்புத் திரையில் சேர்" என்பதை அழுத்தவும்' },
        { icon: CheckCircle2, text: 'மேல் வலது மூலையில் "சேர்" என்பதை அழுத்தவும்' },
        { icon: Leaf, text: 'உங்கள் முகப்புத் திரையிலிருந்து இலை மருத்துவரை திறக்கவும்!' },
      ];

  const desktopSteps = en
    ? [
        { icon: Chrome, text: 'Open this website in Chrome or Edge browser' },
        { icon: Download, text: 'Look for the install icon (⊕) in the address bar' },
        { icon: CheckCircle2, text: 'Click "Install" in the popup dialog' },
        { icon: Leaf, text: 'Leaf Doctor opens as a standalone app!' },
      ]
    : [
        { icon: Chrome, text: 'Chrome அல்லது Edge உலாவியில் இந்த வலைத்தளத்தை திறக்கவும்' },
        { icon: Download, text: 'முகவரி பட்டியில் நிறுவு ஐகானை (⊕) பார்க்கவும்' },
        { icon: CheckCircle2, text: 'பாப்அப் உரையாடலில் "நிறுவு" என்பதை கிளிக் செய்யவும்' },
        { icon: Leaf, text: 'இலை மருத்துவர் ஒரு தனி ஆப்பாக திறக்கும்!' },
      ];

  const getSteps = (platform: Platform) => {
    if (platform === 'android') return androidSteps;
    if (platform === 'ios') return iosSteps;
    if (platform === 'desktop') return desktopSteps;
    return [];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <h1 className="font-tamil text-lg font-semibold text-foreground">
              {en ? 'Install Leaf Doctor' : 'இலை மருத்துவரை நிறுவுங்கள்'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Already installed banner */}
        {isInstalled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
            <div>
              <p className="font-tamil font-semibold text-foreground">
                {en ? 'Already Installed!' : 'ஏற்கனவே நிறுவப்பட்டுள்ளது!'}
              </p>
              <p className="text-sm text-muted-foreground font-tamil">
                {en
                  ? 'Leaf Doctor is installed on this device.'
                  : 'இலை மருத்துவர் இந்த சாதனத்தில் நிறுவப்பட்டுள்ளது.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Quick install button (if browser supports it) */}
        {isInstallable && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Download className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-tamil font-semibold text-foreground">
                    {en ? 'Quick Install Available!' : 'உடனடி நிறுவல் கிடைக்கிறது!'}
                  </p>
                  <p className="text-sm text-muted-foreground font-tamil mt-1">
                    {en
                      ? 'Your browser supports one-tap install.'
                      : 'உங்கள் உலாவி ஒரே தட்டலில் நிறுவலை ஆதரிக்கிறது.'}
                  </p>
                </div>
                <Button onClick={install} size="lg" className="w-full gap-2 font-tamil">
                  <Download className="h-4 w-4" />
                  {en ? 'Install Now' : 'இப்போது நிறுவுங்கள்'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Intro text */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground font-tamil">
            {en
              ? 'Install Leaf Doctor on your device for quick access, offline support, and a native app experience — no app store needed!'
              : 'விரைவான அணுகல், ஆஃப்லைன் ஆதரவு மற்றும் நேட்டிவ் ஆப் அனுபவத்திற்கு இலை மருத்துவரை உங்கள் சாதனத்தில் நிறுவுங்கள் — ஆப் ஸ்டோர் தேவையில்லை!'}
          </p>
        </div>

        {/* Platform selection */}
        <div className="space-y-3">
          <h2 className="font-tamil font-semibold text-foreground">
            {en ? 'Choose Your Device' : 'உங்கள் சாதனத்தை தேர்வு செய்யுங்கள்'}
          </h2>
          <div className="grid gap-3">
            {platforms.map((p) => (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlatform(selectedPlatform === p.id ? null : p.id)}
                className={`w-full text-left rounded-xl border p-4 flex items-center gap-4 transition-all ${
                  selectedPlatform === p.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${p.color}`}>
                  <p.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-tamil font-semibold text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground font-tamil">{p.subtitle}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-all shrink-0 ${
                    selectedPlatform === p.id
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {selectedPlatform === p.id && (
                    <CheckCircle2 className="h-full w-full text-primary-foreground" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {selectedPlatform && (
            <motion.div
              key={selectedPlatform}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-tamil font-semibold text-foreground flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    {en ? 'Installation Steps' : 'நிறுவல் படிகள்'}
                  </h3>
                  <div className="space-y-4">
                    {getSteps(selectedPlatform).map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex items-start gap-2 pt-1">
                          <step.icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground font-tamil leading-relaxed">{step.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* iOS-specific note */}
                  {selectedPlatform === 'ios' && (
                    <div className="rounded-lg bg-accent/10 border border-accent/20 p-3 mt-3">
                      <p className="text-xs text-muted-foreground font-tamil">
                        ⚠️{' '}
                        {en
                          ? 'Important: PWA install only works in Safari on iOS. Chrome and other browsers on iPhone/iPad do not support this feature.'
                          : 'முக்கியம்: iOS-ல் PWA நிறுவல் Safari-ல் மட்டுமே வேலை செய்யும். iPhone/iPad-ல் Chrome மற்றும் பிற உலாவிகள் இந்த அம்சத்தை ஆதரிக்காது.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefits */}
        <div className="space-y-3">
          <h2 className="font-tamil font-semibold text-foreground">
            {en ? 'Why Install?' : 'ஏன் நிறுவ வேண்டும்?'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                emoji: '⚡',
                title: en ? 'Instant Access' : 'உடனடி அணுகல்',
                desc: en ? 'Open from home screen' : 'முகப்புத் திரையிலிருந்து திறக்கவும்',
              },
              {
                emoji: '📴',
                title: en ? 'Works Offline' : 'ஆஃப்லைன் வேலை',
                desc: en ? 'No internet needed' : 'இணையம் தேவையில்லை',
              },
              {
                emoji: '🔔',
                title: en ? 'Notifications' : 'அறிவிப்புகள்',
                desc: en ? 'Get crop alerts' : 'பயிர் எச்சரிக்கைகள்',
              },
              {
                emoji: '💾',
                title: en ? 'No Storage' : 'சேமிப்பிடம் குறைவு',
                desc: en ? 'Under 5MB size' : '5MB-க்கு குறைவு',
              },
            ].map((b) => (
              <Card key={b.title} className="border-border">
                <CardContent className="p-3 text-center space-y-1">
                  <span className="text-2xl">{b.emoji}</span>
                  <p className="font-tamil text-sm font-semibold text-foreground">{b.title}</p>
                  <p className="text-[11px] text-muted-foreground font-tamil">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Back to app */}
        <div className="text-center pt-2">
          <Button variant="outline" onClick={() => navigate('/home')} className="gap-2 font-tamil">
            <ArrowLeft className="h-4 w-4" />
            {en ? 'Back to App' : 'ஆப்புக்கு திரும்பு'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Install;
