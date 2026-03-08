import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Droplets, Bug, Sprout, Sun } from 'lucide-react';

interface Tip {
  icon: React.ElementType;
  titleTa: string;
  titleEn: string;
  descTa: string;
  descEn: string;
  color: string;
}

const tips: Tip[] = [
  {
    icon: Droplets,
    titleTa: 'நீர் மேலாண்மை',
    titleEn: 'Water Management',
    descTa: 'காலை அல்லது மாலை நேரத்தில் நீர்ப்பாசனம் செய்யுங்கள். நீர் வீணாவதைத் தவிர்க்கவும்.',
    descEn: 'Irrigate during morning or evening. Avoid water wastage with drip irrigation.',
    color: 'text-[hsl(var(--water))]',
  },
  {
    icon: Bug,
    titleTa: 'பூச்சி கட்டுப்பாடு',
    titleEn: 'Pest Control',
    descTa: 'வேப்ப எண்ணெய் கலவை பூச்சிகளை இயற்கையாக கட்டுப்படுத்தும்.',
    descEn: 'Neem oil solution naturally controls pests without harmful chemicals.',
    color: 'text-destructive',
  },
  {
    icon: Sprout,
    titleTa: 'மண் வளம்',
    titleEn: 'Soil Health',
    descTa: 'உயிர் உரங்கள் மற்றும் பசுந்தாள் உரங்களை பயன்படுத்துங்கள்.',
    descEn: 'Use biofertilizers and green manure to improve soil health naturally.',
    color: 'text-primary',
  },
  {
    icon: Sun,
    titleTa: 'பருவகால குறிப்பு',
    titleEn: 'Seasonal Tip',
    descTa: 'கோடை காலத்தில் மல்ச்சிங் செய்து மண் ஈரப்பதத்தை பாதுகாக்கவும்.',
    descEn: 'Use mulching in summer to retain soil moisture and reduce evaporation.',
    color: 'text-accent',
  },
];

const FarmingTips: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-accent" />
        <h2 className="font-tamil text-lg font-bold text-foreground">
          {language === 'ta' ? 'விவசாய குறிப்புகள்' : 'Farming Tips'}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tips.map((tip, i) => (
          <Card key={i} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${tip.color}`}>
                  <tip.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-tamil font-semibold text-sm text-foreground mb-1">
                    {language === 'ta' ? tip.titleTa : tip.titleEn}
                  </p>
                  <p className="font-tamil text-xs text-muted-foreground leading-relaxed">
                    {language === 'ta' ? tip.descTa : tip.descEn}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FarmingTips;
