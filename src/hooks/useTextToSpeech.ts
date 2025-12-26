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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Try to find a Tamil voice
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find(voice => 
      voice.lang.includes('ta') || voice.name.toLowerCase().includes('tamil')
    );
    
    if (tamilVoice) {
      utterance.voice = tamilVoice;
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

  const speakDetectionResult = useCallback((result: {
    is_healthy: boolean;
    disease_name_ta?: string | null;
    disease_name_en?: string | null;
    cause_ta?: string | null;
    remedy_organic_ta?: string | null;
    remedy_chemical_ta?: string | null;
    remedy_traditional_ta?: string | null;
    plant_type?: string;
  }, language: 'ta' | 'en' = 'ta') => {
    if (!isSupported) return;

    let text = '';

    if (language === 'ta') {
      if (result.is_healthy) {
        text = `உங்கள் செடி முற்றிலும் ஆரோக்கியமாக உள்ளது. ${result.plant_type || 'செடி'} நன்றாக வளர்கிறது. எந்த நோயும் இல்லை.`;
      } else {
        text = `கவனம்! ${result.disease_name_ta || 'நோய்'} கண்டறியப்பட்டது. `;
        if (result.cause_ta) {
          text += `காரணம்: ${result.cause_ta}. `;
        }
        if (result.remedy_organic_ta) {
          text += `இயற்கை தீர்வு: ${result.remedy_organic_ta}. `;
        }
        if (result.remedy_traditional_ta) {
          text += `பாரம்பரிய வழிமுறை: ${result.remedy_traditional_ta}. `;
        }
        if (result.remedy_chemical_ta) {
          text += `இரசாயன சிகிச்சை: ${result.remedy_chemical_ta}.`;
        }
      }
    } else {
      if (result.is_healthy) {
        text = `Your plant is completely healthy. The ${result.plant_type || 'plant'} is growing well. No disease detected.`;
      } else {
        text = `Attention! ${result.disease_name_en || 'Disease'} detected.`;
      }
    }

    speak(text);
  }, [isSupported, speak]);

  return {
    speak,
    stop,
    speakDetectionResult,
    isSpeaking,
    isSupported,
  };
};