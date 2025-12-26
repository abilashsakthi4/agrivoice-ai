import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import LanguageToggle from '@/components/LanguageToggle';
import DetectionResult from '@/components/DetectionResult';
import { ArrowLeft, Leaf, AlertTriangle, Trash2, Calendar, ChevronRight, History as HistoryIcon } from 'lucide-react';

interface Detection {
  id: string;
  image_url: string;
  is_healthy: boolean;
  disease_name_ta: string | null;
  disease_name_en: string | null;
  plant_type: string | null;
  cause_ta: string | null;
  cause_en: string | null;
  remedy_organic_ta: string | null;
  remedy_organic_en: string | null;
  remedy_chemical_ta: string | null;
  remedy_chemical_en: string | null;
  remedy_traditional_ta: string | null;
  remedy_traditional_en: string | null;
  created_at: string;
}

const History: React.FC = () => {
  const { t, getText } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDetections();
  }, [user, navigate]);

  const fetchDetections = async () => {
    try {
      const { data, error } = await supabase
        .from('detections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDetections(data || []);
    } catch (error) {
      console.error('Error fetching detections:', error);
      toast({
        title: 'பிழை',
        description: 'வரலாற்றை ஏற்ற முடியவில்லை',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('detections')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setDetections(prev => prev.filter(d => d.id !== deleteId));
      toast({
        title: 'நீக்கப்பட்டது',
        description: 'பதிவு வெற்றிகரமாக நீக்கப்பட்டது',
      });
    } catch (error) {
      console.error('Error deleting detection:', error);
      toast({
        title: 'பிழை',
        description: 'நீக்க முடியவில்லை',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ta-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Detail view
  if (selectedDetection) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDetection(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-tamil font-semibold">{t('viewDetails')}</span>
            <LanguageToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {/* Image */}
          <div className="mb-6 rounded-xl overflow-hidden border border-border">
            <img
              src={selectedDetection.image_url}
              alt="Plant"
              className="w-full h-48 object-cover"
            />
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(selectedDetection.created_at)}</span>
          </div>

          {/* Result */}
          <DetectionResult
            result={{
              is_healthy: selectedDetection.is_healthy,
              disease_name_en: selectedDetection.disease_name_en,
              disease_name_ta: selectedDetection.disease_name_ta,
              plant_type: selectedDetection.plant_type || 'Unknown',
              cause_en: selectedDetection.cause_en,
              cause_ta: selectedDetection.cause_ta,
              remedy_organic_en: selectedDetection.remedy_organic_en,
              remedy_organic_ta: selectedDetection.remedy_organic_ta,
              remedy_chemical_en: selectedDetection.remedy_chemical_en,
              remedy_chemical_ta: selectedDetection.remedy_chemical_ta,
              remedy_traditional_en: selectedDetection.remedy_traditional_en,
              remedy_traditional_ta: selectedDetection.remedy_traditional_ta,
            }}
            onNewScan={() => navigate('/home')}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-tamil font-semibold">{t('history')}</span>
          <LanguageToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Leaf className="h-12 w-12 text-primary animate-spin" />
            <p className="font-tamil mt-4 text-muted-foreground">{t('loading')}</p>
          </div>
        ) : detections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <HistoryIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-tamil text-xl font-semibold mb-2">{t('noHistory')}</h2>
            <p className="font-tamil text-muted-foreground mb-6">
              செடிகளை ஸ்கேன் செய்து வரலாற்றைப் பாருங்கள்
            </p>
            <Button onClick={() => navigate('/home')} className="gap-2">
              <Leaf className="h-4 w-4" />
              <span className="font-tamil">{t('scanPlant')}</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {detections.map((detection) => (
              <Card
                key={detection.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedDetection(detection)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4">
                    {/* Image thumbnail */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={detection.image_url}
                        alt="Plant"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        {detection.is_healthy ? (
                          <Leaf className="h-4 w-4 text-success" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                        <span className="font-tamil font-medium text-sm">
                          {detection.is_healthy
                            ? t('healthyPlant')
                            : getText(detection.disease_name_ta, detection.disease_name_en) || t('diseaseDetected')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {detection.plant_type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(detection.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pr-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(detection.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-tamil">நீக்க விரும்புகிறீர்களா?</AlertDialogTitle>
            <AlertDialogDescription className="font-tamil">
              இந்த பதிவை நிரந்தரமாக நீக்க வேண்டுமா? இதை மீட்டெடுக்க முடியாது.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-tamil">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-tamil"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;