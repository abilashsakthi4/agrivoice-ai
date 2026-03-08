import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ta' | 'en';

interface Translations {
  [key: string]: {
    ta: string;
    en: string;
  };
}

export const translations: Translations = {
  // Common
  appName: { ta: 'பயிர் மருத்துவர்', en: 'Crop Doctor' },
  welcome: { ta: 'வரவேற்கிறோம்', en: 'Welcome' },
  loading: { ta: 'ஏற்றுகிறது...', en: 'Loading...' },
  error: { ta: 'பிழை ஏற்பட்டது', en: 'An error occurred' },
  retry: { ta: 'மீண்டும் முயற்சி', en: 'Try Again' },
  cancel: { ta: 'ரத்து செய்', en: 'Cancel' },
  save: { ta: 'சேமி', en: 'Save' },
  delete: { ta: 'நீக்கு', en: 'Delete' },
  back: { ta: 'பின் செல்', en: 'Back' },
  next: { ta: 'அடுத்து', en: 'Next' },
  
  // Auth
  login: { ta: 'உள்நுழை', en: 'Login' },
  register: { ta: 'பதிவு செய்', en: 'Register' },
  logout: { ta: 'வெளியேறு', en: 'Logout' },
  email: { ta: 'மின்னஞ்சல்', en: 'Email' },
  password: { ta: 'கடவுச்சொல்', en: 'Password' },
  fullName: { ta: 'முழு பெயர்', en: 'Full Name' },
  phone: { ta: 'தொலைபேசி எண்', en: 'Phone Number' },
  skipLogin: { ta: 'பதிவு இல்லாமல் தொடர', en: 'Continue without login' },
  createAccount: { ta: 'கணக்கு உருவாக்கு', en: 'Create Account' },
  alreadyHaveAccount: { ta: 'ஏற்கனவே கணக்கு உள்ளதா?', en: 'Already have an account?' },
  noAccount: { ta: 'கணக்கு இல்லையா?', en: "Don't have an account?" },
  
  // Home
  scanPlant: { ta: 'செடியை ஸ்கேன் செய்', en: 'Scan Plant' },
  uploadImage: { ta: 'படத்தை பதிவேற்று', en: 'Upload Image' },
  takePhoto: { ta: 'புகைப்படம் எடு', en: 'Take Photo' },
  detectDisease: { ta: 'நோயைக் கண்டறி', en: 'Detect Disease' },
  history: { ta: 'வரலாறு', en: 'History' },
  profile: { ta: 'சுயவிவரம்', en: 'Profile' },
  settings: { ta: 'அமைப்புகள்', en: 'Settings' },
  
  // Detection
  analyzing: { ta: 'பகுப்பாய்வு செய்கிறது...', en: 'Analyzing...' },
  healthyPlant: { ta: '🌿 ஆரோக்கியமான இலை', en: '🌿 Healthy Leaf' },
  diseaseDetected: { ta: '⚠️ நோய் கண்டறியப்பட்டது', en: '⚠️ Disease Detected' },
  cause: { ta: 'காரணம்', en: 'Cause' },
  remedies: { ta: 'தீர்வுகள்', en: 'Remedies' },
  organicRemedy: { ta: '🌱 இயற்கை தீர்வு', en: '🌱 Organic Remedy' },
  chemicalRemedy: { ta: '🧪 இரசாயன சிகிச்சை', en: '🧪 Chemical Treatment' },
  traditionalRemedy: { ta: '🏡 பாரம்பரிய வழிமுறை', en: '🏡 Traditional Method' },
  confidence: { ta: 'நம்பிக்கை', en: 'Confidence' },
  plantType: { ta: 'செடி வகை', en: 'Plant Type' },
  listenResult: { ta: '🔊 விளக்கத்தைக் கேளுங்கள்', en: '🔊 Listen to Result' },
  stopAudio: { ta: '⏹️ நிறுத்து', en: '⏹️ Stop' },
  
  // History
  noHistory: { ta: 'இதுவரை எந்த ஸ்கேனும் இல்லை', en: 'No scans yet' },
  viewDetails: { ta: 'விவரங்களைப் பார்', en: 'View Details' },
  
  // Admin
  adminDashboard: { ta: 'நிர்வாக டாஷ்போர்டு', en: 'Admin Dashboard' },
  totalUsers: { ta: 'மொத்த பயனர்கள்', en: 'Total Users' },
  totalScans: { ta: 'மொத்த ஸ்கேன்கள்', en: 'Total Scans' },
  todayScans: { ta: 'இன்றைய ஸ்கேன்கள்', en: "Today's Scans" },
  recentActivity: { ta: 'சமீபத்திய செயல்பாடுகள்', en: 'Recent Activity' },
  userManagement: { ta: 'பயனர் மேலாண்மை', en: 'User Management' },
  
  // Splash
  splashTagline: { ta: 'உங்கள் பயிர் பாதுகாவலர்', en: 'Your Crop Guardian' },
  splashSubtitle: { ta: 'AI மூலம் செடி நோய்களை உடனடியாக கண்டறியுங்கள்', en: 'Instantly detect plant diseases with AI' },
  getStarted: { ta: 'தொடங்கு', en: 'Get Started' },
  
  // Photo guide
  photoGuideTitle: { ta: 'நல்ல புகைப்படம் எடுப்பது எப்படி?', en: 'How to take a good photo?' },
  photoGuide1: { ta: 'இலையை நன்றாக வெளிச்சத்தில் வைக்கவும்', en: 'Place the leaf in good lighting' },
  photoGuide2: { ta: 'முழு இலையும் தெரிய வேண்டும்', en: 'Entire leaf should be visible' },
  photoGuide3: { ta: 'தெளிவாக, மங்காமல் எடுக்கவும்', en: 'Take a clear, non-blurry photo' },
  photoGuide4: { ta: 'பாதிக்கப்பட்ட பகுதியை காட்டவும்', en: 'Show the affected area' },
  
  // Knowledge Base
  knowledgeBase: { ta: 'பயிர் அறிவுத் தளம்', en: 'Crop Knowledge Base' },
  searchCrop: { ta: 'பயிர் அல்லது நோயை தேடுங்கள்', en: 'Search crop or disease' },
  
  // Notifications
  notifications: { ta: 'அறிவிப்புகள்', en: 'Notifications' },
  
  // Share
  shareResult: { ta: 'முடிவைப் பகிர்', en: 'Share Result' },
  
  // Offline
  offlineResults: { ta: 'ஆஃப்லைன் முடிவுகள்', en: 'Offline Results' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getText: (tamilText: string | null | undefined, englishText: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ta');

  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage') as Language;
    if (saved && (saved === 'ta' || saved === 'en')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  const getText = (tamilText: string | null | undefined, englishText: string | null | undefined): string => {
    if (language === 'ta') {
      return tamilText || englishText || '';
    }
    return englishText || tamilText || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, getText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};