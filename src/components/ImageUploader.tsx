import React, { useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Leaf, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  isLoading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, isLoading = false }) => {
  const { t } = useLanguage();
  const [preview, setPreview] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyze = () => {
    if (preview) {
      onImageSelect(preview);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Photo guide button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowGuide(!showGuide)}
        className="mb-4 text-muted-foreground"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        <span className="font-tamil">{t('photoGuideTitle')}</span>
      </Button>

      {/* Photo guide */}
      {showGuide && (
        <div className="mb-6 p-4 bg-accent/30 rounded-lg border border-border animate-fade-in">
          <ul className="space-y-2 text-sm font-tamil">
            <li className="flex items-start gap-2">
              <span className="text-lg">☀️</span>
              <span>{t('photoGuide1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">🌿</span>
              <span>{t('photoGuide2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">📸</span>
              <span>{t('photoGuide3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lg">🔍</span>
              <span>{t('photoGuide4')}</span>
            </li>
          </ul>
        </div>
      )}

      {/* Upload area or preview */}
      {!preview ? (
        <div
          className="relative border-2 border-dashed border-primary/50 rounded-2xl p-8 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer leaf-pattern"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="h-10 w-10 text-primary animate-leaf-pulse" />
            </div>
            
            <div className="text-center">
              <p className="font-tamil text-lg font-medium text-foreground">
                {t('uploadImage')}
              </p>
              <p className="font-tamil text-sm text-muted-foreground mt-1">
                படத்தை இங்கே இழுத்து விடவும்
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="gap-2 ripple"
              >
                <Camera className="h-4 w-4" />
                <span className="font-tamil">{t('takePhoto')}</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                <span className="font-tamil">{t('uploadImage')}</span>
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative animate-scale-in">
          {/* Preview image */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            
            {/* Clear button */}
            <button
              onClick={clearPreview}
              className="absolute top-3 right-3 p-2 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Analyze button */}
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full mt-4 h-14 text-lg font-tamil gap-3 gradient-field text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Leaf className="h-6 w-6 animate-spin" />
                <span>{t('analyzing')}</span>
              </>
            ) : (
              <>
                <Leaf className="h-6 w-6" />
                <span>{t('detectDisease')}</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;