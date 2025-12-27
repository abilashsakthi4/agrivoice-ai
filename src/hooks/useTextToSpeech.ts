import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export const useTextToSpeech = (options: UseTTSOptions = {}) => {
  const { lang = 'ta', rate = 0.6, pitch = 1 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const speakWithEdgeFunction = useCallback(async (text: string, speechLang: string = 'ta') => {
    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, lang: speechLang }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return audioUrl;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null;
      }
      console.error('Edge function TTS error:', error);
      throw error;
    }
  }, []);

  const speak = useCallback(async (text: string, speechLang?: string) => {
    if (!text) return;

    try {
      setIsSpeaking(true);
      const audioUrl = await speakWithEdgeFunction(text, speechLang || lang);
      
      if (audioUrl) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  }, [speakWithEdgeFunction, lang]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsSpeaking(false);
  }, []);

  const speakDetectionResult = useCallback(async (result: {
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
    // Build Tamil text
    let tamilText = '';
    if (result.is_healthy) {
      tamilText = `நல்ல செய்தி! உங்கள் ${result.plant_type || 'செடி'} முற்றிலும் ஆரோக்கியமாக உள்ளது. எந்த நோயும் கண்டறியப்படவில்லை. உங்கள் செடி நன்றாக வளர்கிறது.`;
    } else {
      tamilText = `கவனம்! ${result.disease_name_ta || 'நோய்'} கண்டறியப்பட்டது. `;
      if (result.cause_ta) tamilText += `நோய்க்கான காரணம்: ${result.cause_ta}. `;
      tamilText += `இப்போது தீர்வுகளை பார்ப்போம். `;
      if (result.remedy_organic_ta) tamilText += `இயற்கை தீர்வு: ${result.remedy_organic_ta}. `;
      if (result.remedy_traditional_ta) tamilText += `பாரம்பரிய வழிமுறை: ${result.remedy_traditional_ta}. `;
      if (result.remedy_chemical_ta) tamilText += `இரசாயன சிகிச்சை: ${result.remedy_chemical_ta}. `;
      tamilText += `இந்த தீர்வுகளை முறையாக பின்பற்றுங்கள்.`;
    }

    // Build English text
    let englishText = '';
    if (result.is_healthy) {
      englishText = `Good news! Your ${result.plant_type || 'plant'} is completely healthy. No disease has been detected. Your plant is growing well.`;
    } else {
      englishText = `Attention! ${result.disease_name_en || 'A disease'} has been detected. `;
      if (result.cause_en) englishText += `The cause of this disease is: ${result.cause_en}. `;
      englishText += `Now let's look at the remedies. `;
      if (result.remedy_organic_en) englishText += `Organic remedy: ${result.remedy_organic_en}. `;
      if (result.remedy_traditional_en) englishText += `Traditional remedy: ${result.remedy_traditional_en}. `;
      if (result.remedy_chemical_en) englishText += `Chemical treatment: ${result.remedy_chemical_en}. `;
      englishText += `Please follow these remedies properly.`;
    }

    const speechParts = [
      { text: tamilText, lang: 'ta' },
      { text: englishText, lang: 'en' }
    ];

    setIsSpeaking(true);
    
    // Play each part sequentially
    for (const part of speechParts) {
      if (!part.text.trim()) continue;
      
      try {
        const audioUrl = await speakWithEdgeFunction(part.text, part.lang);
        
        if (audioUrl) {
          await new Promise<void>((resolve, reject) => {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onended = () => {
              URL.revokeObjectURL(audioUrl);
              resolve();
            };
            audioRef.current.onerror = () => {
              URL.revokeObjectURL(audioUrl);
              reject(new Error('Audio playback failed'));
            };
            audioRef.current.play().catch(reject);
          });
        }
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
    
    setIsSpeaking(false);
  }, [speakWithEdgeFunction]);

  return {
    speak,
    stop,
    speakDetectionResult,
    isSpeaking,
    isSupported,
  };
};
