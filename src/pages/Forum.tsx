import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BottomNav from '@/components/BottomNav';
import DarkModeToggle from '@/components/DarkModeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import {
  MessageSquare, Plus, ArrowLeft, Send, User, Clock, Leaf,
  MessageCircle, Sprout, Bug, CloudRain, HelpCircle, X
} from 'lucide-react';

interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  author_name: string | null;
  created_at: string;
  reply_count?: number;
}

interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  author_name: string | null;
  created_at: string;
}

const categories = [
  { value: 'general', labelTa: 'பொது', labelEn: 'General', icon: MessageCircle },
  { value: 'disease', labelTa: 'நோய் சந்தேகம்', labelEn: 'Disease Help', icon: Bug },
  { value: 'organic', labelTa: 'இயற்கை விவசாயம்', labelEn: 'Organic Farming', icon: Sprout },
  { value: 'weather', labelTa: 'வானிலை', labelEn: 'Weather', icon: CloudRain },
  { value: 'question', labelTa: 'கேள்வி', labelEn: 'Question', icon: HelpCircle },
];

const Forum: React.FC = () => {
  const { language } = useLanguage();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  // New post form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('forum-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_replies' }, () => {
        if (selectedPost) fetchReplies(selectedPost.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data: postsData } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsData) {
      // Get reply counts
      const postsWithCounts = await Promise.all(
        postsData.map(async (post) => {
          const { count } = await supabase
            .from('forum_replies')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);
          return { ...post, reply_count: count || 0 };
        })
      );
      setPosts(postsWithCounts);
    }
    setLoading(false);
  };

  const fetchReplies = async (postId: string) => {
    const { data } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (data) setReplies(data);
  };

  const handleCreatePost = async () => {
    if (!user || isGuest) {
      toast({ title: language === 'ta' ? 'உள்நுழையவும்' : 'Please login first', variant: 'destructive' });
      return;
    }
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const { error } = await supabase.from('forum_posts').insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category,
      author_name: profile?.full_name || user.email?.split('@')[0] || 'Farmer',
    });

    if (error) {
      toast({ title: language === 'ta' ? 'பிழை' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      setTitle('');
      setContent('');
      setCategory('general');
      setShowNewPost(false);
      toast({ title: language === 'ta' ? 'பதிவு வெற்றி!' : 'Post created!' });
      fetchPosts();
    }
    setSubmitting(false);
  };

  const handleReply = async () => {
    if (!user || isGuest || !selectedPost || !replyContent.trim()) return;

    setSubmitting(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const { error } = await supabase.from('forum_replies').insert({
      post_id: selectedPost.id,
      user_id: user.id,
      content: replyContent.trim(),
      author_name: profile?.full_name || user.email?.split('@')[0] || 'Farmer',
    });

    if (error) {
      toast({ title: language === 'ta' ? 'பிழை' : 'Error', description: error.message, variant: 'destructive' });
    } else {
      setReplyContent('');
      fetchReplies(selectedPost.id);
    }
    setSubmitting(false);
  };

  const openPost = (post: ForumPost) => {
    setSelectedPost(post);
    fetchReplies(post.id);
  };

  const getCategoryInfo = (value: string) => categories.find(c => c.value === value) || categories[0];

  const filteredPosts = filterCategory === 'all' ? posts : posts.filter(p => p.category === filterCategory);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  // Post detail view
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background pb-20 sm:pb-0">
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedPost(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-tamil font-bold text-foreground truncate flex-1">{selectedPost.title}</span>
          </div>
        </header>

        <main className="container mx-auto px-4 py-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-tamil">{selectedPost.author_name || 'Farmer'}</span>
                <Clock className="h-3 w-3 ml-auto" />
                <span>{timeAgo(selectedPost.created_at)}</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {language === 'ta' ? getCategoryInfo(selectedPost.category).labelTa : getCategoryInfo(selectedPost.category).labelEn}
              </Badge>
              <p className="font-tamil text-foreground whitespace-pre-wrap">{selectedPost.content}</p>
            </CardContent>
          </Card>

          <h3 className="font-tamil font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            {language === 'ta' ? 'பதில்கள்' : 'Replies'} ({replies.length})
          </h3>

          {replies.map((reply) => (
            <motion.div key={reply.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-l-4 border-l-primary/30">
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="font-tamil">{reply.author_name || 'Farmer'}</span>
                    <span className="ml-auto">{timeAgo(reply.created_at)}</span>
                  </div>
                  <p className="font-tamil text-sm text-foreground">{reply.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {user && !isGuest ? (
            <div className="flex gap-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={language === 'ta' ? 'பதில் எழுதுங்கள்...' : 'Write a reply...'}
                className="font-tamil flex-1 min-h-[60px]"
                maxLength={1000}
              />
              <Button onClick={handleReply} disabled={submitting || !replyContent.trim()} size="icon" className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground font-tamil">
              {language === 'ta' ? 'பதில் எழுத உள்நுழையவும்' : 'Login to reply'}
            </p>
          )}
        </main>
        <BottomNav />
      </div>
    );
  }

  // New post form
  if (showNewPost) {
    return (
      <div className="min-h-screen bg-background pb-20 sm:pb-0">
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowNewPost(false)}>
              <X className="h-5 w-5" />
            </Button>
            <span className="font-tamil font-bold text-foreground">
              {language === 'ta' ? 'புதிய பதிவு' : 'New Post'}
            </span>
          </div>
        </header>

        <main className="container mx-auto px-4 py-4 space-y-4">
          <div className="space-y-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="font-tamil">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="font-tamil">
                    {language === 'ta' ? c.labelTa : c.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'ta' ? 'தலைப்பு...' : 'Title...'}
              className="font-tamil"
              maxLength={200}
            />

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'ta' ? 'உங்கள் கேள்வி அல்லது அனுபவத்தை பகிருங்கள்...' : 'Share your question or experience...'}
              className="font-tamil min-h-[150px]"
              maxLength={2000}
            />

            <Button
              onClick={handleCreatePost}
              disabled={submitting || !title.trim() || !content.trim()}
              className="w-full font-tamil gap-2"
            >
              <Send className="h-4 w-4" />
              {language === 'ta' ? 'பதிவிடு' : 'Post'}
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Posts list view
  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-tamil font-bold text-lg">
              {language === 'ta' ? 'விவசாய சமூகம்' : 'Farmer Community'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DarkModeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <Badge
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer shrink-0 font-tamil"
            onClick={() => setFilterCategory('all')}
          >
            {language === 'ta' ? 'அனைத்தும்' : 'All'}
          </Badge>
          {categories.map((c) => (
            <Badge
              key={c.value}
              variant={filterCategory === c.value ? 'default' : 'outline'}
              className="cursor-pointer shrink-0 font-tamil"
              onClick={() => setFilterCategory(c.value)}
            >
              {language === 'ta' ? c.labelTa : c.labelEn}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Leaf className="h-8 w-8 text-primary animate-leaf-pulse mx-auto mb-2" />
            <p className="font-tamil text-muted-foreground">{language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-tamil text-muted-foreground">
              {language === 'ta' ? 'இதுவரை பதிவுகள் இல்லை. முதல் பதிவை உருவாக்குங்கள்!' : 'No posts yet. Create the first one!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post, i) => {
              const catInfo = getCategoryInfo(post.category);
              const CatIcon = catInfo.icon;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow border-border"
                    onClick={() => openPost(post)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CatIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-tamil font-semibold text-foreground text-sm leading-tight line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="font-tamil text-xs text-muted-foreground mt-1 line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author_name || 'Farmer'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(post.created_at)}
                        </span>
                        <span className="flex items-center gap-1 ml-auto text-primary">
                          <MessageCircle className="h-3 w-3" />
                          {post.reply_count || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* FAB to create post */}
      {user && !isGuest && (
        <button
          onClick={() => setShowNewPost(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-50 hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <BottomNav />
    </div>
  );
};

export default Forum;
