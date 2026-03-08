import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, CalendarDays, CloudRain, Sprout } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPrefs {
  seasonal: boolean;
  weather: boolean;
  tips: boolean;
}

const NOTIF_KEY = 'notification_prefs';

const NotificationSettings: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [prefs, setPrefs] = useState<NotificationPrefs>({ seasonal: true, weather: true, tips: true });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    const saved = localStorage.getItem(NOTIF_KEY);
    if (saved) setPrefs(JSON.parse(saved));
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({ title: language === 'ta' ? 'அறிவிப்புகள் ஆதரிக்கப்படவில்லை' : 'Notifications not supported', variant: 'destructive' });
      return false;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      // Schedule sample notification
      scheduleNotification();
      return true;
    }
    return false;
  };

  const scheduleNotification = () => {
    if (Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification(language === 'ta' ? '🌾 பயிர் மருத்துவர்' : '🌾 Crop Doctor', {
          body: language === 'ta' ? 'அறிவிப்புகள் வெற்றிகரமாக இயக்கப்பட்டன!' : 'Notifications enabled successfully!',
          icon: '/app-logo.png',
        });
      }, 1000);
    }
  };

  const togglePref = async (key: keyof NotificationPrefs) => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    toast({
      title: language === 'ta' ? 'அமைப்பு புதுப்பிக்கப்பட்டது' : 'Setting updated',
    });
  };

  const items = [
    { key: 'seasonal' as const, icon: CalendarDays, labelTa: 'பருவகால நினைவூட்டல்', labelEn: 'Seasonal Reminders', descTa: 'விதைப்பு, அறுவடை நேரம்', descEn: 'Sowing & harvest time alerts' },
    { key: 'weather' as const, icon: CloudRain, labelTa: 'வானிலை எச்சரிக்கை', labelEn: 'Weather Alerts', descTa: 'மழை, வெப்பம் எச்சரிக்கைகள்', descEn: 'Rain & heat warnings' },
    { key: 'tips' as const, icon: Sprout, labelTa: 'விவசாய குறிப்புகள்', labelEn: 'Farming Tips', descTa: 'தினசரி பயிர் பராமரிப்பு', descEn: 'Daily crop care tips' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        <h2 className="font-tamil text-lg font-bold text-foreground">
          {language === 'ta' ? 'அறிவிப்பு அமைப்புகள்' : 'Notification Settings'}
        </h2>
      </div>

      {permission === 'denied' && (
        <p className="text-xs text-destructive font-tamil">
          {language === 'ta' ? 'அறிவிப்புகள் தடுக்கப்பட்டுள்ளன. உலாவி அமைப்புகளில் அனுமதிக்கவும்.' : 'Notifications blocked. Enable in browser settings.'}
        </p>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.key} className="border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <item.icon className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-tamil text-sm font-semibold text-foreground">
                  {language === 'ta' ? item.labelTa : item.labelEn}
                </p>
                <p className="font-tamil text-[10px] text-muted-foreground">
                  {language === 'ta' ? item.descTa : item.descEn}
                </p>
              </div>
              <Switch
                checked={prefs[item.key]}
                onCheckedChange={() => togglePref(item.key)}
                disabled={permission === 'denied'}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;
