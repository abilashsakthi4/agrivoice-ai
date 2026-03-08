import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Cloud, Sun, CloudRain, Wind, Droplets, MapPin, CloudSnow, CloudLightning, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  location: string;
}

const weatherCodeMap: Record<number, { icon: React.ElementType; ta: string; en: string; tip_ta: string; tip_en: string }> = {
  0: { icon: Sun, ta: 'தெளிவான வானம்', en: 'Clear Sky', tip_ta: '💡 நீர்ப்பாசனம் செய்ய நல்ல நாள்', tip_en: '💡 Good day for irrigation' },
  1: { icon: Sun, ta: 'பெரும்பாலும் தெளிவு', en: 'Mostly Clear', tip_ta: '💡 பூச்சிக்கொல்லி தெளிக்க ஏற்ற நாள்', tip_en: '💡 Good day for pest spraying' },
  2: { icon: Cloud, ta: 'ஓரளவு மேகமூட்டம்', en: 'Partly Cloudy', tip_ta: '💡 நடவு செய்ய ஏற்ற நாள்', tip_en: '💡 Good day for planting' },
  3: { icon: Cloud, ta: 'மேகமூட்டம்', en: 'Overcast', tip_ta: '💡 உர இடுவதற்கு நல்ல நாள்', tip_en: '💡 Good day for fertilizing' },
  45: { icon: Cloud, ta: 'மூடுபனி', en: 'Fog', tip_ta: '💡 பூஞ்சை நோய் கவனம் தேவை', tip_en: '💡 Watch for fungal diseases' },
  48: { icon: Cloud, ta: 'உறைபனி மூடுபனி', en: 'Rime Fog', tip_ta: '💡 பயிர்களை பாதுகாக்கவும்', tip_en: '💡 Protect crops from frost' },
  51: { icon: CloudRain, ta: 'லேசான தூறல்', en: 'Light Drizzle', tip_ta: '💡 வடிகால் சரிபாருங்கள்', tip_en: '💡 Check drainage' },
  53: { icon: CloudRain, ta: 'தூறல்', en: 'Drizzle', tip_ta: '💡 வடிகால் வசதியை சரிபாருங்கள்', tip_en: '💡 Check drainage facilities' },
  55: { icon: CloudRain, ta: 'கனமான தூறல்', en: 'Heavy Drizzle', tip_ta: '💡 நிலத்தில் நீர் தேங்காமல் பாருங்கள்', tip_en: '💡 Prevent waterlogging' },
  61: { icon: CloudRain, ta: 'லேசான மழை', en: 'Light Rain', tip_ta: '💡 மழைநீர் சேகரிக்கவும்', tip_en: '💡 Collect rainwater' },
  63: { icon: CloudRain, ta: 'மழை', en: 'Rain', tip_ta: '💡 வயலில் வேலை தவிர்க்கவும்', tip_en: '💡 Avoid fieldwork today' },
  65: { icon: CloudRain, ta: 'கனமழை', en: 'Heavy Rain', tip_ta: '💡 வெள்ள அபாயம் - பயிர்களை பாதுகாக்கவும்', tip_en: '💡 Flood risk - protect crops' },
  71: { icon: CloudSnow, ta: 'லேசான பனி', en: 'Light Snow', tip_ta: '💡 பயிர்களை மூடி பாதுகாக்கவும்', tip_en: '💡 Cover crops for protection' },
  80: { icon: CloudRain, ta: 'மழை பொழிவு', en: 'Rain Showers', tip_ta: '💡 வடிகால் சரிபாருங்கள்', tip_en: '💡 Check drainage' },
  95: { icon: CloudLightning, ta: 'இடியுடன் மழை', en: 'Thunderstorm', tip_ta: '⚠️ வெளியில் செல்ல வேண்டாம்', tip_en: '⚠️ Stay indoors' },
};

const getWeatherInfo = (code: number) => {
  // Find closest match
  const keys = Object.keys(weatherCodeMap).map(Number).sort((a, b) => a - b);
  let matched = keys[0];
  for (const k of keys) {
    if (k <= code) matched = k;
  }
  return weatherCodeMap[matched] || weatherCodeMap[0];
};

const WeatherWidget: React.FC = () => {
  const { language } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      if (!res.ok) throw new Error('Weather API failed');
      const data = await res.json();

      // Reverse geocode for location name
      let locationName = `${lat.toFixed(1)}°N, ${lon.toFixed(1)}°E`;
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${lat}&longitude=${lon}&count=1`
        );
        // Use a simple approach - just show coordinates or "Tamil Nadu" if in range
        if (lat >= 8 && lat <= 14 && lon >= 76 && lon <= 81) {
          locationName = language === 'ta' ? 'தமிழ்நாடு' : 'Tamil Nadu';
        }
      } catch {
        // Keep coordinate-based name
      }

      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code,
        location: locationName,
      });
    } catch (err) {
      setError(language === 'ta' ? 'வானிலை தரவை பெற முடியவில்லை' : 'Could not fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    setLoading(true);
    setError(null);
    setLocationDenied(false);

    if (!navigator.geolocation) {
      // Default to Chennai
      fetchWeather(13.08, 80.27);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => {
        // On denial, default to Chennai, Tamil Nadu
        setLocationDenied(true);
        fetchWeather(13.08, 80.27);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center justify-center gap-2 h-28">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-tamil text-sm text-muted-foreground">
            {language === 'ta' ? 'வானிலை ஏற்றுகிறது...' : 'Loading weather...'}
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error && !weather) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground font-tamil mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={requestLocation}>
            {language === 'ta' ? 'மீண்டும் முயற்சி' : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  const info = getWeatherInfo(weather.weatherCode);
  const WeatherIcon = info.icon;

  return (
    <Card className="overflow-hidden border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <WeatherIcon className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-foreground">{weather.temperature}°C</p>
              <p className="text-sm text-muted-foreground font-tamil">
                {language === 'ta' ? info.ta : info.en}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="font-tamil">{weather.location}</span>
            {locationDenied && (
              <button
                onClick={requestLocation}
                className="ml-1 underline text-primary text-[10px]"
              >
                📍
              </button>
            )}
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
          <p className="text-xs font-tamil text-muted-foreground">
            {language === 'ta' ? info.tip_ta : info.tip_en}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
