import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import LanguageToggle from '@/components/LanguageToggle';
import { 
  ArrowLeft, Users, Leaf, BarChart3, AlertTriangle, 
  Calendar, TrendingUp, Activity, Shield
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

interface Detection {
  id: string;
  user_id: string | null;
  is_healthy: boolean;
  plant_type: string | null;
  disease_name_en: string | null;
  created_at: string;
}

interface DailyStats {
  date: string;
  count: number;
}

interface DiseaseStats {
  name: string;
  count: number;
}

const COLORS = ['hsl(142, 45%, 28%)', 'hsl(18, 55%, 50%)', 'hsl(42, 85%, 55%)', 'hsl(200, 50%, 50%)', 'hsl(0, 72%, 45%)'];

const Admin: React.FC = () => {
  const { t, getText } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [diseaseStats, setDiseaseStats] = useState<DiseaseStats[]>([]);
  const [healthyCount, setHealthyCount] = useState(0);
  const [diseasedCount, setDiseasedCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      toast({
        title: 'அணுகல் மறுக்கப்பட்டது',
        description: 'நிர்வாக அணுகல் மட்டுமே',
        variant: 'destructive',
      });
      navigate('/home');
      return;
    }
    fetchData();
  }, [user, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch all detections
      const { data: detectionsData, error: detectionsError } = await supabase
        .from('detections')
        .select('*')
        .order('created_at', { ascending: false });

      if (detectionsError) throw detectionsError;
      setDetections(detectionsData || []);

      // Process stats
      processStats(detectionsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'பிழை',
        description: 'தரவை ஏற்ற முடியவில்லை',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processStats = (detections: Detection[]) => {
    // Daily stats for last 7 days
    const last7Days: { [key: string]: number } = {};
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days[dateStr] = 0;
    }

    // Disease stats
    const diseases: { [key: string]: number } = {};
    let healthy = 0;
    let diseased = 0;

    detections.forEach(d => {
      // Daily count
      const dateStr = new Date(d.created_at).toISOString().split('T')[0];
      if (last7Days.hasOwnProperty(dateStr)) {
        last7Days[dateStr]++;
      }

      // Health stats
      if (d.is_healthy) {
        healthy++;
      } else {
        diseased++;
        const diseaseName = d.disease_name_en || 'Unknown';
        diseases[diseaseName] = (diseases[diseaseName] || 0) + 1;
      }
    });

    setDailyStats(
      Object.entries(last7Days).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('ta-IN', { weekday: 'short' }),
        count,
      }))
    );

    setDiseaseStats(
      Object.entries(diseases)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    );

    setHealthyCount(healthy);
    setDiseasedCount(diseased);
  };

  const getTodayScans = () => {
    const today = new Date().toISOString().split('T')[0];
    return detections.filter(d => d.created_at.startsWith(today)).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ta-IN', {
      year: 'numeric',
      month: 'short',
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

  const pieData = [
    { name: 'ஆரோக்கியம்', value: healthyCount },
    { name: 'நோய்', value: diseasedCount },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-tamil font-semibold">{t('adminDashboard')}</span>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-xs text-muted-foreground font-tamil">{t('totalUsers')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-leaf/5 border-leaf/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-leaf/20 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-leaf" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{detections.length}</p>
                  <p className="text-xs text-muted-foreground font-tamil">{t('totalScans')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-harvest/5 border-harvest/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-harvest/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-harvest" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getTodayScans()}</p>
                  <p className="text-xs text-muted-foreground font-tamil">{t('todayScans')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{diseasedCount}</p>
                  <p className="text-xs text-muted-foreground font-tamil">நோய்கள்</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="font-tamil gap-2">
              <BarChart3 className="h-4 w-4" />
              பகுப்பாய்வு
            </TabsTrigger>
            <TabsTrigger value="users" className="font-tamil gap-2">
              <Users className="h-4 w-4" />
              பயனர்கள்
            </TabsTrigger>
            <TabsTrigger value="activity" className="font-tamil gap-2">
              <Activity className="h-4 w-4" />
              செயல்பாடு
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {/* Daily Scans Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="font-tamil text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  கடந்த 7 நாட்கள் ஸ்கேன்கள்
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Health Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-tamil text-lg">ஆரோக்கிய விநியோகம்</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="hsl(142, 60%, 35%)" />
                          <Cell fill="hsl(32, 95%, 55%)" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Diseases */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-tamil text-lg">அதிகமாக கண்டறியப்பட்ட நோய்கள்</CardTitle>
                </CardHeader>
                <CardContent>
                  {diseaseStats.length > 0 ? (
                    <div className="space-y-3">
                      {diseaseStats.map((disease, index) => (
                        <div key={disease.name} className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="flex-1 text-sm truncate">{disease.name}</span>
                          <span className="font-semibold">{disease.count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8 font-tamil">
                      நோய்கள் எதுவும் இல்லை
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="font-tamil flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  பதிவு செய்த பயனர்கள் ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {users.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {(profile.full_name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{profile.full_name || 'பெயர் இல்லை'}</p>
                          <p className="text-xs text-muted-foreground">
                            {profile.phone || 'தொலைபேசி இல்லை'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(profile.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="font-tamil flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {t('recentActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {detections.slice(0, 50).map((detection) => (
                      <div
                        key={detection.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          detection.is_healthy ? 'bg-success/20' : 'bg-warning/20'
                        }`}>
                          {detection.is_healthy ? (
                            <Leaf className="h-5 w-5 text-success" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {detection.is_healthy 
                              ? 'ஆரோக்கியமான செடி' 
                              : detection.disease_name_en || 'நோய் கண்டறியப்பட்டது'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {detection.plant_type || 'Unknown plant'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(detection.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;