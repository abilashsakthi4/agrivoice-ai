import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Share2, MessageCircle, Phone, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareResultProps {
  result: {
    is_healthy: boolean;
    disease_name_en: string | null;
    disease_name_ta: string | null;
    plant_type: string;
    remedy_organic_en: string | null;
    remedy_organic_ta: string | null;
  };
}

const ShareResult: React.FC<ShareResultProps> = ({ result }) => {
  const { language, getText } = useLanguage();
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    const appName = language === 'ta' ? 'பயிர் மருத்துவர்' : 'Crop Doctor';
    const status = result.is_healthy
      ? (language === 'ta' ? '✅ ஆரோக்கியமான செடி' : '✅ Healthy Plant')
      : (language === 'ta' ? '⚠️ நோய் கண்டறியப்பட்டது' : '⚠️ Disease Detected');
    
    let text = `🌿 ${appName}\n${status}\n🌱 ${result.plant_type}`;
    
    if (!result.is_healthy) {
      const disease = getText(result.disease_name_ta, result.disease_name_en);
      text += `\n🔬 ${disease}`;
      const remedy = getText(result.remedy_organic_ta, result.remedy_organic_en);
      if (remedy) text += `\n💊 ${remedy}`;
    }
    
    return text;
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaSMS = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`sms:?body=${text}`, '_blank');
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: getShareText() });
      } catch {}
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={shareViaWhatsApp} className="gap-1.5 font-tamil text-xs">
        <MessageCircle className="h-4 w-4 text-success" />
        WhatsApp
      </Button>
      <Button variant="outline" size="sm" onClick={shareViaSMS} className="gap-1.5 font-tamil text-xs">
        <Phone className="h-4 w-4 text-primary" />
        SMS
      </Button>
      <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-1.5 font-tamil text-xs">
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        {copied ? (language === 'ta' ? 'நகலெடுக்கப்பட்டது' : 'Copied') : (language === 'ta' ? 'நகலெடு' : 'Copy')}
      </Button>
      {typeof navigator.share === 'function' && (
        <Button variant="outline" size="sm" onClick={handleNativeShare} className="gap-1.5 font-tamil text-xs">
          <Share2 className="h-4 w-4" />
          {language === 'ta' ? 'பகிர்' : 'Share'}
        </Button>
      )}
    </div>
  );
};

export default ShareResult;
