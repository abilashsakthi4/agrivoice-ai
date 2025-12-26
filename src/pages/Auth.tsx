import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import LanguageToggle from '@/components/LanguageToggle';
import { Leaf, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { signIn, signUp, continueAsGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: 'பிழை', description: error.message, variant: 'destructive' });
        } else {
          navigate('/home');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({ title: 'பிழை', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'வெற்றி!', description: 'கணக்கு உருவாக்கப்பட்டது' });
          navigate('/home');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    continueAsGuest();
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-background leaf-pattern flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <LanguageToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rustic-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="font-tamil text-2xl">
              {isLogin ? t('login') : t('register')}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-tamil">{t('fullName')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-tamil">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-tamil">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 font-tamil" disabled={isLoading}>
                {isLoading ? t('loading') : (isLogin ? t('login') : t('createAccount'))}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline font-tamil"
              >
                {isLogin ? t('noAccount') : t('alreadyHaveAccount')}
              </button>
            </div>

            <div className="mt-6">
              <Button variant="outline" onClick={handleSkip} className="w-full font-tamil">
                {t('skipLogin')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;