import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export const useTextToSpeech = (options: UseTTSOptions = {}) => {
  // Slower rate (0.6) for clearer speech
  const { lang = 'ta-IN', rate = 0.6, pitch = 1 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text: string, speechLang?: string) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang || lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Try to find a voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const targetLang = speechLang || lang;
    const matchingVoice = voices.find(voice => 
      voice.lang.includes(targetLang.split('-')[0]) || 
      voice.name.toLowerCase().includes(targetLang === 'ta-IN' ? 'tamil' : 'english')
    );
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, lang, rate, pitch]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const speakSequentially = useCallback((texts: { text: string; lang: string }[]) => {
    if (!isSupported || texts.length === 0) return;

    window.speechSynthesis.cancel();
    
    let currentIndex = 0;
    
    const speakNext = () => {
      if (currentIndex >= texts.length) {
        setIsSpeaking(false);
        return;
      }

      const { text, lang } = texts[currentIndex];
      if (!text.trim()) {
        currentIndex++;
        speakNext();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Find matching voice for the language
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => 
        voice.lang.startsWith(lang.split('-')[0]) || 
        voice.name.toLowerCase().includes(lang === 'ta-IN' ? 'tamil' : 'english')
      );
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        currentIndex++;
        speakNext();
      };
      utterance.onerror = () => {
        currentIndex++;
        speakNext();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [isSupported, rate, pitch]);

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

    const speechParts: { text: string; lang: string }[] = [];

    // Tamil section
    let tamilText = '';
    if (result.is_healthy) {
      tamilText = `நல்ல செய்தி! உங்கள் ${result.plant_type || 'செடி'} முற்றிலும் ஆரோக்கியமாக உள்ளது. எந்த நோயும் கண்டறியப்படவில்லை. உங்கள் செடி நன்றாக வளர்கிறது.`;
    } else {
      tamilText = `கவனம்! ${result.disease_name_ta || 'நோய்'} கண்டறியப்பட்டது. `;
      
      if (result.cause_ta) {
        tamilText += `நோய்க்கான காரணம்: ${result.cause_ta}. `;
      }
      
      tamilText += `இப்போது தீர்வுகளை பார்ப்போம். `;
      
      if (result.remedy_organic_ta) {
        tamilText += `இயற்கை தீர்வு: ${result.remedy_organic_ta}. `;
      }
      
      if (result.remedy_traditional_ta) {
        tamilText += `பாரம்பரிய வழிமுறை: ${result.remedy_traditional_ta}. `;
      }
      
      if (result.remedy_chemical_ta) {
        tamilText += `இரசாயன சிகிச்சை: ${result.remedy_chemical_ta}. `;
      }
      
      tamilText += `இந்த தீர்வுகளை முறையாக பின்பற்றுங்கள்.`;
    }
    speechParts.push({ text: tamilText, lang: 'ta-IN' });

    // English section
    let englishText = 'Now in English. ';
    if (result.is_healthy) {
      englishText += `Good news! Your ${result.plant_type || 'plant'} is completely healthy. No disease has been detected. Your plant is growing well.`;
    } else {
      englishText += `Attention! ${result.disease_name_en || 'A disease'} has been detected. `;
      
      if (result.cause_en) {
        englishText += `The cause of this disease is: ${result.cause_en}. `;
      }
      
      englishText += `Now let's look at the remedies. `;
      
      if (result.remedy_organic_en) {
        englishText += `Organic remedy: ${result.remedy_organic_en}. `;
      }
      
      if (result.remedy_traditional_en) {
        englishText += `Traditional remedy: ${result.remedy_traditional_en}. `;
      }
      
      if (result.remedy_chemical_en) {
        englishText += `Chemical treatment: ${result.remedy_chemical_en}. `;
      }
      
      englishText += `Please follow these remedies properly.`;
    }
    speechParts.push({ text: englishText, lang: 'en-US' });

    speakSequentially(speechParts);
  }, [isSupported, speakSequentially]);

  return {
    speak,
    stop,
    speakDetectionResult,
    isSpeaking,
    isSupported,
  };
};