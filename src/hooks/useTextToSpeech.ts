import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export const useTextToSpeech = (options: UseTTSOptions = {}) => {
  const { lang = 'ta-IN', rate = 0.8, pitch = 1 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices when they become available
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }
    
    setIsSupported(true);
    
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
    };

    loadVoices();
    
    // Voices may load asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const findBestVoice = useCallback((targetLang: string): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;
    
    const langCode = targetLang.split('-')[0]; // 'ta' from 'ta-IN'
    
    // Priority 1: Exact match
    let voice = voices.find(v => v.lang === targetLang);
    if (voice) return voice;
    
    // Priority 2: Language code match
    voice = voices.find(v => v.lang.startsWith(langCode));
    if (voice) return voice;
    
    // Priority 3: For Tamil, try Hindi as fallback (Indic language)
    if (langCode === 'ta') {
      voice = voices.find(v => v.lang.startsWith('hi'));
      if (voice) return voice;
    }
    
    // Priority 4: For English, prefer US or UK
    if (langCode === 'en') {
      voice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
      if (voice) return voice;
    }
    
    return null;
  }, [voices]);

  const speak = useCallback((text: string, speechLang?: string) => {
    if (!isSupported || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = speechLang || lang;
    utterance.lang = targetLang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    const voice = findBestVoice(targetLang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech error:', e);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, lang, rate, pitch, findBestVoice]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speakDetectionResult = useCallback((result: {
    is_healthy: boolean;
    disease_name_ta?: string | null;
    disease_name_en?: string | null;
    cause_ta?: string | null;
    cause_en?: string | null;
    remedy_organic_ta?: string | null;
    remedy_organic_en?: string | null;
    remedy_chemical_ta?: string | null;
    remedy_chemical_en?: string | null;
    remedy_traditional_ta?: string | null;
    remedy_traditional_en?: string | null;
    plant_type?: string;
  }, language: 'ta' | 'en' = 'ta') => {
    if (!isSupported) return;

    // Build Tamil text
    let tamilText = '';
    if (result.is_healthy) {
      tamilText = `நல்ல செய்தி! உங்கள் ${result.plant_type || 'செடி'} முற்றிலும் ஆரோக்கியமாக உள்ளது. எந்த நோயும் கண்டறியப்படவில்லை.`;
    } else {
      tamilText = `கவனம்! ${result.disease_name_ta || 'நோய்'} கண்டறியப்பட்டது. `;
      if (result.cause_ta) tamilText += `காரணம்: ${result.cause_ta}. `;
      if (result.remedy_organic_ta) tamilText += `இயற்கை தீர்வு: ${result.remedy_organic_ta}. `;
      if (result.remedy_traditional_ta) tamilText += `பாரம்பரிய வழிமுறை: ${result.remedy_traditional_ta}. `;
      if (result.remedy_chemical_ta) tamilText += `இரசாயன சிகிச்சை: ${result.remedy_chemical_ta}. `;
    }

    // Build English text
    let englishText = '';
    if (result.is_healthy) {
      englishText = `Good news! Your ${result.plant_type || 'plant'} is completely healthy. No disease has been detected.`;
    } else {
      englishText = `Attention! ${result.disease_name_en || 'A disease'} has been detected. `;
      if (result.cause_en) englishText += `Cause: ${result.cause_en}. `;
      if (result.remedy_organic_en) englishText += `Organic remedy: ${result.remedy_organic_en}. `;
      if (result.remedy_traditional_en) englishText += `Traditional remedy: ${result.remedy_traditional_en}. `;
      if (result.remedy_chemical_en) englishText += `Chemical treatment: ${result.remedy_chemical_en}. `;
    }

    window.speechSynthesis.cancel();
    
    const speechParts = [
      { text: tamilText, lang: 'ta-IN' },
      { text: englishText, lang: 'en-US' }
    ];
    
    let currentIndex = 0;
    
    const speakNext = () => {
      if (currentIndex >= speechParts.length) {
        setIsSpeaking(false);
        return;
      }

      const { text, lang: speechLang } = speechParts[currentIndex];
      if (!text.trim()) {
        currentIndex++;
        speakNext();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voice = findBestVoice(speechLang);
      if (voice) {
        utterance.voice = voice;
        console.log(`Using voice: ${voice.name} for ${speechLang}`);
      } else {
        console.log(`No voice found for ${speechLang}, using default`);
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        currentIndex++;
        // Small delay between languages
        setTimeout(speakNext, 500);
      };
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        currentIndex++;
        speakNext();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [isSupported, rate, pitch, findBestVoice]);

  return {
    speak,
    stop,
    speakDetectionResult,
    isSpeaking,
    isSupported,
  };
};
