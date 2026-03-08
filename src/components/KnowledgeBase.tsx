import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Leaf, Bug, FlaskConical } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface CropEntry {
  nameTa: string;
  nameEn: string;
  seasonTa: string;
  seasonEn: string;
  diseases: {
    nameTa: string;
    nameEn: string;
    symptomsTa: string;
    symptomsEn: string;
    remedyTa: string;
    remedyEn: string;
  }[];
}

const cropData: CropEntry[] = [
  {
    nameTa: 'நெல்', nameEn: 'Rice',
    seasonTa: 'ஜூன் - ஜனவரி', seasonEn: 'Jun - Jan',
    diseases: [
      { nameTa: 'இலைக் கருகல்', nameEn: 'Leaf Blast', symptomsTa: 'இலையில் வைரம் வடிவ புள்ளிகள்', symptomsEn: 'Diamond-shaped spots on leaves', remedyTa: 'டிரைசைக்ளசோல் 0.6 மி.லி/லிட்டர் தெளிக்கவும்', remedyEn: 'Spray Tricyclazole 0.6ml/L' },
      { nameTa: 'பழுப்பு புள்ளி', nameEn: 'Brown Spot', symptomsTa: 'இலையில் பழுப்பு நிற புள்ளிகள்', symptomsEn: 'Brown spots on leaves', remedyTa: 'மான்கோசெப் 2.5 கிராம்/லிட்டர் தெளிக்கவும்', remedyEn: 'Spray Mancozeb 2.5g/L' },
    ],
  },
  {
    nameTa: 'தக்காளி', nameEn: 'Tomato',
    seasonTa: 'அக்டோபர் - மார்ச்', seasonEn: 'Oct - Mar',
    diseases: [
      { nameTa: 'சாம்பல் நோய்', nameEn: 'Powdery Mildew', symptomsTa: 'இலையில் வெள்ளைப் பூசணம்', symptomsEn: 'White powdery coating on leaves', remedyTa: 'கந்தகத் தூள் 2 கிராம்/லிட்டர் தெளிக்கவும்', remedyEn: 'Spray Sulphur dust 2g/L' },
      { nameTa: 'இலை சுருட்டு', nameEn: 'Leaf Curl', symptomsTa: 'இலைகள் மேல்நோக்கி சுருளும்', symptomsEn: 'Leaves curl upward', remedyTa: 'வெள்ளை ஈ கட்டுப்படுத்த மஞ்சள் ஒட்டும் பொறி', remedyEn: 'Yellow sticky traps to control whiteflies' },
    ],
  },
  {
    nameTa: 'கத்தரி', nameEn: 'Brinjal',
    seasonTa: 'ஆண்டு முழுவதும்', seasonEn: 'Year-round',
    diseases: [
      { nameTa: 'காய் துளைப்பான்', nameEn: 'Fruit Borer', symptomsTa: 'காயில் துளைகள், புழுக்கள்', symptomsEn: 'Holes in fruits with larvae', remedyTa: 'வேப்பெண்ணெய் 5 மி.லி/லிட்டர் தெளிக்கவும்', remedyEn: 'Spray Neem oil 5ml/L' },
    ],
  },
  {
    nameTa: 'வாழை', nameEn: 'Banana',
    seasonTa: 'ஆண்டு முழுவதும்', seasonEn: 'Year-round',
    diseases: [
      { nameTa: 'பனாமா வாடல்', nameEn: 'Panama Wilt', symptomsTa: 'இலைகள் மஞ்சளாகி வாடும்', symptomsEn: 'Leaves turn yellow and wilt', remedyTa: 'டிரைக்கோடெர்மா விரிடி மண்ணில் இடவும்', remedyEn: 'Apply Trichoderma viride to soil' },
      { nameTa: 'சிகடோகா இலைப்புள்ளி', nameEn: 'Sigatoka Leaf Spot', symptomsTa: 'இலையில் நீள்வட்ட புள்ளிகள்', symptomsEn: 'Oval spots on leaves', remedyTa: 'கார்பெண்டாசிம் 1 கிராம்/லிட்டர் தெளிக்கவும்', remedyEn: 'Spray Carbendazim 1g/L' },
    ],
  },
  {
    nameTa: 'நிலக்கடலை', nameEn: 'Groundnut',
    seasonTa: 'ஜூன் - செப்டம்பர்', seasonEn: 'Jun - Sep',
    diseases: [
      { nameTa: 'இலைப்புள்ளி', nameEn: 'Tikka Disease', symptomsTa: 'இலையில் கருப்பு புள்ளிகள்', symptomsEn: 'Dark spots on leaves', remedyTa: 'மான்கோசெப் 2 கிராம்/லிட்டர் தெளிக்கவும்', remedyEn: 'Spray Mancozeb 2g/L' },
    ],
  },
  {
    nameTa: 'மிளகாய்', nameEn: 'Chilli',
    seasonTa: 'ஜூன் - பிப்ரவரி', seasonEn: 'Jun - Feb',
    diseases: [
      { nameTa: 'வாடல் நோய்', nameEn: 'Wilt Disease', symptomsTa: 'செடி திடீரென வாடும்', symptomsEn: 'Sudden wilting of plants', remedyTa: 'காப்பர் ஆக்ஸிகுளோரைடு 3 கிராம்/லிட்டர்', remedyEn: 'Copper oxychloride 3g/L' },
      { nameTa: 'இலை சுருட்டு', nameEn: 'Leaf Curl', symptomsTa: 'இலைகள் சுருண்டு சிறிதாகும்', symptomsEn: 'Leaves curl and become small', remedyTa: 'இமிடாகுளோபிரிட் 0.3 மி.லி/லிட்டர்', remedyEn: 'Imidacloprid 0.3ml/L' },
    ],
  },
];

const KnowledgeBase: React.FC = () => {
  const { language, getText } = useLanguage();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return cropData;
    const q = search.toLowerCase();
    return cropData.filter(c =>
      c.nameEn.toLowerCase().includes(q) ||
      c.nameTa.includes(q) ||
      c.diseases.some(d => d.nameEn.toLowerCase().includes(q) || d.nameTa.includes(q))
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="font-tamil text-lg font-bold text-foreground">
          {language === 'ta' ? 'பயிர் அறிவுத் தளம்' : 'Crop Knowledge Base'}
        </h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={language === 'ta' ? 'பயிர் அல்லது நோயை தேடுங்கள்...' : 'Search crop or disease...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 font-tamil"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground font-tamil py-8">
          {language === 'ta' ? 'முடிவுகள் இல்லை' : 'No results found'}
        </p>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {filtered.map((crop, i) => (
            <AccordionItem key={i} value={`crop-${i}`} className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Leaf className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-left">
                    <p className="font-tamil font-semibold text-foreground">
                      {language === 'ta' ? crop.nameTa : crop.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground font-tamil">
                      {language === 'ta' ? crop.seasonTa : crop.seasonEn}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-auto mr-2 text-[10px]">
                    {crop.diseases.length} {language === 'ta' ? 'நோய்கள்' : 'diseases'}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 space-y-3">
                {crop.diseases.map((disease, j) => (
                  <Card key={j} className="border-l-4 border-l-warning">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Bug className="h-4 w-4 text-warning shrink-0" />
                        <span className="font-tamil font-semibold text-sm text-foreground">
                          {language === 'ta' ? disease.nameTa : disease.nameEn}
                        </span>
                      </div>
                      <p className="font-tamil text-xs text-muted-foreground">
                        {language === 'ta' ? disease.symptomsTa : disease.symptomsEn}
                      </p>
                      <div className="flex items-start gap-2 bg-muted/50 rounded p-2">
                        <FlaskConical className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <p className="font-tamil text-xs text-foreground">
                          {language === 'ta' ? disease.remedyTa : disease.remedyEn}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default KnowledgeBase;
