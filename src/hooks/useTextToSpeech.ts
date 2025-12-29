// @refresh reset
import { useState, useCallback, useRef } from 'react';

interface UseTTSOptions {
  rate?: number;
  pitch?: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useTextToSpeech = (options: UseTTSOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isCancelledRef = useRef(false);

  const speakWithElevenLabs = useCallback(async (text: string, lang: string = 'en', retries = 2): Promise<void> => {
    if (!text?.trim() || isCancelledRef.current) return;

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
        // Handle rate limiting with retry
        if (response.status === 429 && retries > 0) {
          console.log(`Rate limited, retrying in 2s... (${retries} retries left)`);
          await delay(2000);
          return speakWithElevenLabs(text, lang, retries - 1);
        }
        
        const error = await response.json();
        throw new Error(error.error || `TTS request failed: ${response.status}`);
      }

      if (isCancelledRef.current) return;

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return new Promise<void>((resolve, reject) => {
        if (isCancelledRef.current) {
          URL.revokeObjectURL(audioUrl);
          resolve();
          return;
        }
        
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
    isCancelledRef.current = true;
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
    
    isCancelledRef.current = false;
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
    isCancelledRef.current = false;
    
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
      // Speak Tamil first - wait for it to complete
      if (tamilText.trim() && !isCancelledRef.current) {
        await speakWithElevenLabs(tamilText, 'ta-IN');
      }
      
      // Small pause between languages
      if (!isCancelledRef.current) {
        await delay(800);
      }
      
      // Then speak English - sequential, not parallel
      if (englishText.trim() && !isCancelledRef.current) {
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
