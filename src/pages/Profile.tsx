import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import LanguageToggle from '@/components/LanguageToggle';
import { ArrowLeft, User, Phone, Mail, Calendar, Globe, Save, Leaf, LogOut } from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().trim().max(100, 'பெயர் 100 எழுத்துக்களுக்குள் இருக்க வேண்டும்').optional(),
  phone: z.string().trim().max(20, 'தொலைபேசி எண் 20 எழுத்துக்களுக்குள் இருக்க வேண்டும்')
    .regex(/^[0-9+\-\s]*$/, 'சரியான தொலைபேசி எண் உள்ளிடவும்')
    .optional()
    .or(z.literal('')),
});

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  preferred_language: string | null;
  created_at: string;
  updated_at: string;
}

const Profile: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'ta' | 'en'>('ta');
  const [errors, setErrors] = useState<{ full_name?: string; phone?: string }>({});

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setPreferredLanguage((data.preferred_language as 'ta' | 'en') || 'ta');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'பிழை',
        description: 'சுயவிவரத்தை ஏற்ற முடியவில்லை',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate input
    const validation = profileSchema.safeParse({ full_name: fullName, phone });
    
    if (!validation.success) {
      const fieldErrors: { full_name?: string; phone?: string } = {};
      validation.error.errors.forEach(err => {
        const field = err.path[0] as string;
        fieldErrors[field as keyof typeof fieldErrors] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          preferred_language: preferredLanguage,
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      // Update app language
      setLanguage(preferredLanguage);

      toast({
        title: 'சேமிக்கப்பட்டது!',
        description: 'உங்கள் சுயவிவரம் புதுப்பிக்கப்பட்டது',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'பிழை',
        description: 'சுயவிவரத்தை புதுப்பிக்க முடியவில்லை',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ta-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Leaf className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="font-tamil mt-4 text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-tamil font-semibold">{t('profile')}</span>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-md">
        {/* User avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-tamil text-xl font-semibold">
            {fullName || 'பெயர் இல்லை'}
          </h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>

        {/* Profile form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-tamil text-lg">சுயவிவர தகவல்கள்</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-tamil flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('fullName')}
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="உங்கள் பெயர்"
                maxLength={100}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-tamil flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t('phone')}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                maxLength={20}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Language preference */}
            <div className="space-y-3">
              <Label className="font-tamil flex items-center gap-2">
                <Globe className="h-4 w-4" />
                மொழி விருப்பம்
              </Label>
              <RadioGroup
                value={preferredLanguage}
                onValueChange={(value) => setPreferredLanguage(value as 'ta' | 'en')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ta" id="lang-ta" />
                  <Label htmlFor="lang-ta" className="font-tamil cursor-pointer">தமிழ்</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en" className="cursor-pointer">English</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full mt-4 gap-2 font-tamil"
            >
              <Save className="h-4 w-4" />
              {isSaving ? t('loading') : t('save')}
            </Button>
          </CardContent>
        </Card>

        {/* Account details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-tamil text-lg">கணக்கு விவரங்கள்</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground font-tamil">{t('email')}</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>

            {profile && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground font-tamil">இணைந்த தேதி</p>
                  <p className="text-sm font-medium">{formatDate(profile.created_at)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout button */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full gap-2 font-tamil"
        >
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </Button>
      </main>
    </div>
  );
};

export default Profile;