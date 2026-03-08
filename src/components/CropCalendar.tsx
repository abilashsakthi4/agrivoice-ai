import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Sprout, Droplets, Scissors } from 'lucide-react';

interface CropSeason {
  monthTa: string;
  monthEn: string;
  cropsTa: string;
  cropsEn: string;
  activityTa: string;
  activityEn: string;
  icon: React.ElementType;
  active: boolean;
}

const getCurrentMonth = () => new Date().getMonth();

const seasons: CropSeason[] = [
  {
    monthTa: 'ஜன - மார்',
    monthEn: 'Jan - Mar',
    cropsTa: 'நெல், கரும்பு, வாழை',
    cropsEn: 'Rice, Sugarcane, Banana',
    activityTa: 'பொங்கல் பருவ அறுவடை',
    activityEn: 'Pongal harvest season',
    icon: Scissors,
    active: [0, 1, 2].includes(getCurrentMonth()),
  },
  {
    monthTa: 'ஏப் - ஜூன்',
    monthEn: 'Apr - Jun',
    cropsTa: 'எள், நிலக்கடலை, பருத்தி',
    cropsEn: 'Sesame, Groundnut, Cotton',
    activityTa: 'கோடை உழவு & விதைப்பு',
    activityEn: 'Summer plowing & sowing',
    icon: Sprout,
    active: [3, 4, 5].includes(getCurrentMonth()),
  },
  {
    monthTa: 'ஜூலை - செப்',
    monthEn: 'Jul - Sep',
    cropsTa: 'சாமை, கேழ்வரகு, உளுந்து',
    cropsEn: 'Millet, Ragi, Black Gram',
    activityTa: 'ஆடிப் பட்ட நடவு',
    activityEn: 'Aadi season planting',
    icon: Droplets,
    active: [6, 7, 8].includes(getCurrentMonth()),
  },
  {
    monthTa: 'அக் - டிச',
    monthEn: 'Oct - Dec',
    cropsTa: 'நெல், தட்டைப்பயறு, கடுகு',
    cropsEn: 'Rice, Flat Beans, Mustard',
    activityTa: 'சம்பா பருவ நடவு',
    activityEn: 'Samba season cultivation',
    icon: Sprout,
    active: [9, 10, 11].includes(getCurrentMonth()),
  },
];

const CropCalendar: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="font-tamil text-lg font-bold text-foreground">
          {language === 'ta' ? 'பயிர் காலண்டர்' : 'Crop Calendar'}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {seasons.map((season, i) => (
          <Card
            key={i}
            className={`border-border transition-all ${
              season.active
                ? 'ring-2 ring-primary shadow-md'
                : 'opacity-75'
            }`}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <season.icon className={`h-4 w-4 ${season.active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-bold text-foreground">
                  {language === 'ta' ? season.monthTa : season.monthEn}
                </span>
                {season.active && (
                  <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    {language === 'ta' ? 'இப்போது' : 'Now'}
                  </span>
                )}
              </div>
              <p className="font-tamil text-xs font-semibold text-foreground mb-1">
                {language === 'ta' ? season.cropsTa : season.cropsEn}
              </p>
              <p className="font-tamil text-[10px] text-muted-foreground">
                {language === 'ta' ? season.activityTa : season.activityEn}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CropCalendar;
