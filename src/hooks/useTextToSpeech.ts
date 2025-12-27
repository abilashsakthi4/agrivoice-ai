import { useState, useCallback, useEffect, useRef } from 'react';

interface UseTTSOptions {
  rate?: number;
  pitch?: number;
}

export const useTextToSpeech = (options: UseTTSOptions = {}) => {
  const { rate = 0.8, pitch = 1 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);
    
    if (!supported) return;
    
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const findVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current;
    const langCode = lang.split('-')[0];
    
    return voices.find(v => v.lang === lang) || 
           voices.find(v => v.lang.startsWith(langCode)) || 
           null;
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (!isSupported || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    const voice = findVoice(lang);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, findVoice]);

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
  }) => {
    if (!isSupported) return;

    let tamilText = '';
    let englishText = '';

    if (result.is_healthy) {
      tamilText = `நல்ல செய்தி! உங்கள் ${result.plant_type || 'செடி'} ஆரோக்கியமாக உள்ளது.`;
      englishText = `Good news! Your ${result.plant_type || 'plant'} is healthy.`;
    } else {
      tamilText = `${result.disease_name_ta || 'நோய்'} கண்டறியப்பட்டது. `;
      if (result.cause_ta) tamilText += result.cause_ta + '. ';
      if (result.remedy_organic_ta) tamilText += result.remedy_organic_ta + '. ';

      englishText = `${result.disease_name_en || 'Disease'} detected. `;
      if (result.cause_en) englishText += result.cause_en + '. ';
      if (result.remedy_organic_en) englishText += result.remedy_organic_en + '. ';
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const parts = [
      { text: tamilText, lang: 'ta-IN' },
      { text: englishText, lang: 'en-US' }
    ];

    let index = 0;

    const speakPart = () => {
      if (index >= parts.length) {
        setIsSpeaking(false);
        return;
      }

      const { text, lang } = parts[index];
      if (!text.trim()) {
        index++;
        speakPart();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voice = findVoice(lang);
      if (voice) utterance.voice = voice;

      utterance.onend = () => {
        index++;
        setTimeout(speakPart, 300);
      };
      utterance.onerror = () => {
        index++;
        speakPart();
      };

      window.speechSynthesis.speak(utterance);
    };

    speakPart();
  }, [isSupported, rate, pitch, findVoice]);

  return { speak, stop, speakDetectionResult, isSpeaking, isSupported };
};
