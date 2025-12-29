import { useState, useCallback, useRef } from 'react';

interface UseTTSOptions {
  rate?: number;
  pitch?: number;
}

export const useTextToSpeech = (options: UseTTSOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(true); // ElevenLabs works on all devices
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const speakWithElevenLabs = useCallback(async (text: string, lang: string = 'en') => {
    if (!text?.trim()) return;

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: text.trim(), lang }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return new Promise<void>((resolve, reject) => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          resolve();
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          reject(new Error('Audio playback failed'));
        };
        
        audio.play().catch(reject);
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }, []);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string, lang: string = 'en-US') => {
    if (!text?.trim()) return;
    
    setIsSpeaking(true);
    try {
      await speakWithElevenLabs(text, lang);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [speakWithElevenLabs]);

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
  }) => {
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

    setIsSpeaking(true);
    
    try {
      // Speak Tamil first
      if (tamilText.trim()) {
        await speakWithElevenLabs(tamilText, 'ta-IN');
      }
      
      // Small pause between languages
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then speak English
      if (englishText.trim()) {
        await speakWithElevenLabs(englishText, 'en-US');
      }
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [speakWithElevenLabs]);

  return { speak, stop, speakDetectionResult, isSpeaking, isSupported };
};
