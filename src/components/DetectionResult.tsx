import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, AlertTriangle, Volume2, VolumeX, Sparkles, FlaskConical, Home } from 'lucide-react';

interface DetectionResultProps {
  result: {
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
  };
  onNewScan: () => void;
}

const DetectionResult: React.FC<DetectionResultProps> = ({ result, onNewScan }) => {
  const { t, getText, language } = useLanguage();
  const { speakDetectionResult, isSpeaking, stop, isSupported } = useTextToSpeech();

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speakDetectionResult(result);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-fade-in-up">
      {/* Main result card */}
      <Card className={`border-2 ${result.is_healthy ? 'border-success bg-success/5' : 'border-warning bg-warning/5'}`}>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            {result.is_healthy ? (
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
                <Leaf className="h-10 w-10 text-success" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-warning/20 flex items-center justify-center animate-scale-in">
                <AlertTriangle className="h-10 w-10 text-warning" />
              </div>
            )}
          </div>
          
          <CardTitle className="font-tamil text-2xl">
            {result.is_healthy ? t('healthyPlant') : t('diseaseDetected')}
          </CardTitle>
          
          {!result.is_healthy && (
            <p className="font-tamil text-xl font-semibold text-foreground mt-2">
              {getText(result.disease_name_ta, result.disease_name_en)}
            </p>
          )}
          
          <p className="text-muted-foreground mt-1">
            {t('plantType')}: <span className="font-medium">{result.plant_type}</span>
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Voice button */}
          {isSupported && (
            <Button
              onClick={handleSpeak}
              variant={isSpeaking ? 'destructive' : 'secondary'}
              className="w-full mb-4 gap-2 font-tamil"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-5 w-5" />
                  {t('stopAudio')}
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  {t('listenResult')}
                </>
              )}
            </Button>
          )}

          {/* Confidence */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-4">
            <span className="font-tamil text-sm text-muted-foreground">{t('confidence')}</span>
            <span className="font-bold text-primary">100%</span>
          </div>
        </CardContent>
      </Card>

      {/* Cause card - only if disease */}
      {!result.is_healthy && result.cause_ta && (
        <Card className="rustic-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-tamil text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              {t('cause')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-tamil text-foreground leading-relaxed">
              {getText(result.cause_ta, result.cause_en)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Remedies - only if disease */}
      {!result.is_healthy && (
        <div className="space-y-3">
          <h3 className="font-tamil text-lg font-semibold">{t('remedies')}</h3>

          {/* Organic remedy */}
          {result.remedy_organic_ta && (
            <Card className="border-l-4 border-l-leaf">
              <CardHeader className="pb-2">
                <CardTitle className="font-tamil text-base flex items-center gap-2 text-leaf">
                  <Sparkles className="h-5 w-5" />
                  {t('organicRemedy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-tamil text-sm leading-relaxed">
                  {getText(result.remedy_organic_ta, result.remedy_organic_en)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Traditional remedy */}
          {result.remedy_traditional_ta && (
            <Card className="border-l-4 border-l-clay">
              <CardHeader className="pb-2">
                <CardTitle className="font-tamil text-base flex items-center gap-2 text-clay">
                  <Home className="h-5 w-5" />
                  {t('traditionalRemedy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-tamil text-sm leading-relaxed">
                  {getText(result.remedy_traditional_ta, result.remedy_traditional_en)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Chemical remedy */}
          {result.remedy_chemical_ta && (
            <Card className="border-l-4 border-l-secondary">
              <CardHeader className="pb-2">
                <CardTitle className="font-tamil text-base flex items-center gap-2 text-secondary">
                  <FlaskConical className="h-5 w-5" />
                  {t('chemicalRemedy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-tamil text-sm leading-relaxed">
                  {getText(result.remedy_chemical_ta, result.remedy_chemical_en)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* New scan button */}
      <Button
        onClick={onNewScan}
        variant="outline"
        className="w-full mt-6 h-12 font-tamil"
      >
        <Leaf className="h-5 w-5 mr-2" />
        புதிய ஸ்கேன்
      </Button>
    </div>
  );
};

export default DetectionResult;