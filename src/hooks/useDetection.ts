import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DetectionResult {
  is_healthy: boolean;
  disease_name_en: string | null;
  disease_name_ta: string | null;
  plant_type: string;
  cause_en: string | null;
  cause_ta: string | null;
  remedy_organic_en: string | null;
  remedy_organic_ta: string | null;
  remedy_chemical_en: string | null;
  remedy_chemical_ta: string | null;
  remedy_traditional_en: string | null;
  remedy_traditional_ta: string | null;
}

// Simple hash function for image caching
const hashImage = async (base64: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(base64.substring(0, 10000)); // Use first 10k chars for speed
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const useDetection = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  const analyzeImage = async (imageBase64: string): Promise<DetectionResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Generate hash for caching
      const imageHash = await hashImage(imageBase64);
      
      // Check cache first
      const { data: cachedResult } = await supabase
        .from('image_cache')
        .select('detection_result')
        .eq('image_hash', imageHash)
        .maybeSingle();

      if (cachedResult?.detection_result) {
        console.log('Using cached result');
        const detectionResult = cachedResult.detection_result as unknown as DetectionResult;
        setResult(detectionResult);
        
        // Save to history if logged in
        if (user && !isGuest) {
          await saveToHistory(imageBase64, imageHash, detectionResult);
        }
        
        setIsAnalyzing(false);
        return detectionResult;
      }

      // Call AI detection
      const { data, error: fnError } = await supabase.functions.invoke('detect-plant-disease', {
        body: { imageBase64 },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const detectionResult = data as DetectionResult;
      setResult(detectionResult);

      // Cache offline
      saveOffline(detectionResult);

      // Cache the result
      await supabase
        .from('image_cache')
        .upsert({
          image_hash: imageHash,
          detection_result: detectionResult as any,
        }, { onConflict: 'image_hash' });

      // Save to history if logged in
      if (user && !isGuest) {
        await saveToHistory(imageBase64, imageHash, detectionResult);
      }

      return detectionResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      toast({
        title: 'பகுப்பாய்வு தோல்வி',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveToHistory = async (
    imageBase64: string,
    imageHash: string,
    detectionResult: DetectionResult
  ) => {
    try {
      // Upload image to storage
      const fileName = `${user!.id}/${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('plant-images')
        .upload(fileName, base64ToBlob(imageBase64), {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('plant-images')
        .getPublicUrl(fileName);

      // Save detection to history
      await supabase.from('detections').insert({
        user_id: user!.id,
        image_url: urlData.publicUrl,
        image_hash: imageHash,
        is_healthy: detectionResult.is_healthy,
        disease_name_ta: detectionResult.disease_name_ta,
        disease_name_en: detectionResult.disease_name_en,
        confidence: 100,
        cause_ta: detectionResult.cause_ta,
        cause_en: detectionResult.cause_en,
        remedy_organic_ta: detectionResult.remedy_organic_ta,
        remedy_organic_en: detectionResult.remedy_organic_en,
        remedy_chemical_ta: detectionResult.remedy_chemical_ta,
        remedy_chemical_en: detectionResult.remedy_chemical_en,
        remedy_traditional_ta: detectionResult.remedy_traditional_ta,
        remedy_traditional_en: detectionResult.remedy_traditional_en,
        plant_type: detectionResult.plant_type,
      });
    } catch (err) {
      console.error('Error saving to history:', err);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    analyzeImage,
    isAnalyzing,
    result,
    error,
    clearResult,
  };
};

// Helper to convert base64 to blob
const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(',');
  const byteString = atob(parts[1] || parts[0]);
  const mimeString = parts[0]?.match(/:(.*?);/)?.[1] || 'image/jpeg';
  
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
};