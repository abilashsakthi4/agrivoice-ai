import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Lightbulb, Droplets, Bug, Sprout, Sun, Wind } from 'lucide-react';

const tips = [
  {
    icon: Droplets,
    titleTa: 'நீர் மேலாண்மை',
    titleEn: 'Water Management',
    tipTa: 'காலை அல்லது மாலை நேரத்தில் நீர் பாய்ச்சுவது நீர் ஆவியாவதைக் குறைக்கும்.',
    tipEn: 'Water plants in early morning or evening to reduce evaporation and improve absorption.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Bug,
    titleTa: 'பூச்சி கட்டுப்பாடு',
    titleEn: 'Pest Control',
    tipTa: 'வேப்ப எண்ணெய் கரைசல் இயற்கை பூச்சிக்கொல்லியாக பயன்படுத்தலாம்.',
    tipEn: 'Use neem oil solution as a natural pesticide to protect crops organically.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    icon: Sprout,
    titleTa: 'மண் ஆரோக்கியம்',
    titleEn: 'Soil Health',
    tipTa: 'பசுந்தாள் உரம் மண்ணின் வளத்தை இயற்கையாக அதிகரிக்கும்.',
    tipEn: 'Green manure crops naturally enrich soil fertility and improve structure.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Sun,
    titleTa: 'வெயில் பாதுகாப்பு',
    titleEn: 'Sun Protection',
    tipTa: 'கடும் வெயிலில் இளம் பயிர்களுக்கு நிழல் வலை பயன்படுத்துங்கள்.',
    tipEn: 'Use shade nets for young seedlings during intense summer heat.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Wind,
    titleTa: 'காற்றோட்டம்',
    titleEn: 'Air Circulation',
    tipTa: 'பயிர்களுக்கு இடையே போதுமான இடைவெளி பூஞ்சை நோயைத் தடுக்கும்.',
    tipEn: 'Proper spacing between plants prevents fungal diseases through better airflow.',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
  },
  {
    icon: Lightbulb,
    titleTa: 'அறுவடை நேரம்',
    titleEn: 'Harvest Timing',
    tipTa: 'காலை பனி காய்ந்த பின் அறுவடை செய்வது தரத்தை உயர்த்தும்.',
    tipEn: 'Harvest after morning dew dries to maintain crop quality and reduce spoilage.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
];

const QuickTipsCarousel: React.FC = () => {
  const { language } = useLanguage();
  const isTamil = language === 'ta';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="font-tamil text-lg font-bold text-foreground">
          {isTamil ? 'விரைவு குறிப்புகள்' : 'Quick Tips'}
        </h2>
      </div>

      <Carousel
        opts={{ align: 'start', loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <CarouselItem key={i} className="pl-2 basis-[80%] sm:basis-1/2 lg:basis-1/3">
                <Card className="border-border h-full">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg ${tip.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-4.5 w-4.5 ${tip.color}`} />
                      </div>
                      <h3 className="font-tamil font-semibold text-sm text-foreground">
                        {isTamil ? tip.titleTa : tip.titleEn}
                      </h3>
                    </div>
                    <p className="font-tamil text-xs text-muted-foreground leading-relaxed">
                      {isTamil ? tip.tipTa : tip.tipEn}
                    </p>
                  </CardContent>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="-left-3" />
          <CarouselNext className="-right-3" />
        </div>
      </Carousel>
    </div>
  );
};

export default QuickTipsCarousel;
