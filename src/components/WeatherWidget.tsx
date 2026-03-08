import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly_cloudy';
  location: string;
}

const WeatherWidget: React.FC = () => {
  const { language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated weather data for Tamil Nadu region
    const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'partly_cloudy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    setTimeout(() => {
      setWeather({
        temperature: Math.floor(28 + Math.random() * 8),
        humidity: Math.floor(55 + Math.random() * 30),
        windSpeed: Math.floor(5 + Math.random() * 15),
        condition: randomCondition,
        location: language === 'ta' ? 'தமிழ்நாடு' : 'Tamil Nadu',
      });
      setLoading(false);
    }, 500);
  }, [language]);

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-8 w-8 text-accent" />;
      case 'cloudy': return <Cloud className="h-8 w-8 text-muted-foreground" />;
      case 'rainy': return <CloudRain className="h-8 w-8 text-[hsl(var(--water))]" />;
      case 'partly_cloudy': return <Cloud className="h-8 w-8 text-accent" />;
    }
  };

  const getConditionText = (condition: WeatherData['condition']) => {
    const texts = {
      sunny: { ta: 'வெயில்', en: 'Sunny' },
      cloudy: { ta: 'மேகமூட்டம்', en: 'Cloudy' },
      rainy: { ta: 'மழை', en: 'Rainy' },
      partly_cloudy: { ta: 'ஓரளவு மேகமூட்டம்', en: 'Partly Cloudy' },
    };
    return texts[condition][language];
  };

  const getFarmingTip = (condition: WeatherData['condition']) => {
    const tips = {
      sunny: { ta: '💡 நீர்ப்பாசனம் செய்ய நல்ல நாள்', en: '💡 Good day for irrigation' },
      cloudy: { ta: '💡 நடவு செய்ய ஏற்ற நாள்', en: '💡 Good day for planting' },
      rainy: { ta: '💡 வடிகால் வசதியை சரிபாருங்கள்', en: '💡 Check drainage facilities' },
      partly_cloudy: { ta: '💡 உர இடுவதற்கு நல்ல நாள்', en: '💡 Good day for fertilizing' },
    };
    return tips[condition][language];
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4 h-28" />
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="overflow-hidden border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {getWeatherIcon(weather.condition)}
            <div>
              <p className="text-2xl font-bold text-foreground">{weather.temperature}°C</p>
              <p className="text-sm text-muted-foreground font-tamil">{getConditionText(weather.condition)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="font-tamil">{weather.location}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Droplets className="h-4 w-4 text-[hsl(var(--water))]" />
            <span>{language === 'ta' ? 'ஈரப்பதம்' : 'Humidity'}: {weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wind className="h-4 w-4" />
            <span>{language === 'ta' ? 'காற்று' : 'Wind'}: {weather.windSpeed} km/h</span>
          </div>
        </div>

        <div className="bg-muted rounded-lg px-3 py-2">
          <p className="text-xs font-tamil text-muted-foreground">{getFarmingTip(weather.condition)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
