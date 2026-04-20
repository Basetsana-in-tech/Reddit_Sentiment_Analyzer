'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, Info, Zap, Globe, MessageSquare } from 'lucide-react';
import Sentiment from 'sentiment';

interface RedditPost {
  id: string;
  title: string;
  num_comments: number;
  sentiment: number;
  url: string;
}

export function SentimentDashboard() {
  const [subreddit, setSubreddit] = useState('');
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [sentimentScore, setSentimentScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const suggestions = ['technology', 'stocks', 'gaming', 'movies', 'science', 'worldnews'];
  const sentiment = new Sentiment();

  const analyzeSentiment = (text: string) => {
    const result = sentiment.analyze(text);
    return result.score;
  };

  const fetchPosts = async (sub: string) => {
    setLoading(true);
    setError('');
    setPosts([]);
    
    const cleanSub = sub.trim().replace(/^r\//, '');
    // Cache-busting prevents Vercel from serving an old 'Busy' response
    const targetUrl = `https://www.reddit.com/r/${cleanSub}/hot.json?limit=10&ts=${Date.now()}`;
    
    // Using AllOrigins with a clean fetch to bypass Vercel-specific blocking
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
      const response = await fetch(proxyUrl, { cache: 'no-store' });
      if (!response.ok) throw new Error('Network congestion.');

      const result = await response.json();
      const data = JSON.parse(result.contents);

      if (data.data?.children && data.data.children.length > 0) {
        const fetchedPosts: RedditPost[] = data.data.children.map((child: any) => {
          const post = child.data;
          return {
            id: post.id,
            title: post.title,
            num_comments: post.num_comments,
            sentiment: analyzeSentiment(post.title + ' ' + (post.selftext || '')),
            url: `https://reddit.com${post.permalink}`,
          };
        });

        setPosts(fetchedPosts);
        const avg = fetchedPosts.reduce((sum, p) => sum + p.sentiment, 0) / fetchedPosts.length;
        setSentimentScore(Math.min(Math.max(Math.round(((avg + 5) / 10) * 100), 0), 100));
      } else {
        throw new Error('No data returned. Check subreddit name.');
      }
    } catch (err: any) {
      console.error("Vercel Fetch Error:", err);
      setError('Reddit connection is tight on cloud servers. Try a different topic or wait 15 seconds.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subreddit.trim()) fetchPosts(subreddit.trim());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-700">
      
      {/* Header & Education Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Reddit Sentiment Tracker</h1>
        <p className="text-orange-200/70 max-w-2xl mx-auto">Analyze the live "pulse" of any Reddit community using Natural Language Processing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-orange-950/40 border-orange-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3 text-orange-400 font-bold uppercase text-xs tracking-widest">
              <Info className="w-4 h-4" /> Sentiment Analysis
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              We use a dictionary-based NLP algorithm to score posts. Higher scores mean the community is happy/excited; lower means they are frustrated.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-orange-950/40 border-orange-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3 text-orange-400 font-bold uppercase text-xs tracking-widest">
              <Zap className="w-4 h-4" /> Real-Time Feed
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Data is fetched directly from Reddit's "Hot" feed via an encrypted proxy, ensuring you see exactly what's trending <strong>right now</strong>.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-orange-950/40 border-orange-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3 text-orange-400 font-bold uppercase text-xs tracking-widest">
              <Globe className="w-4 h-4" /> Community Mood
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Great for investors (Bullish/Bearish sentiment), gamers (patch feedback), or tech enthusiasts (product launches).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Input Section */}
      <Card className="bg-orange-900/40 border-orange-700 shadow-2xl backdrop-blur-md">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400/50" />
              <Input
                placeholder="Enter subreddit (e.g. stocks, gaming, funny)"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="pl-10 bg-orange-950/50 border-orange-800 text-white focus:ring-orange-500"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-500 font-bold min-w-[140px] transition-all active:scale-95">
              {loading ? 'Analyzing...' : 'Analyze Now'}
            </Button>
          </form>
          
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-[10px] text-orange-400/60 uppercase font-black tracking-widest">Quick Ideas</span>
            {suggestions.map((s) => (
              <button key={s} onClick={() => { setSubreddit(s); fetchPosts(s); }}
                className="text-xs bg-orange-900/60 hover:bg-orange-700 text-orange-100 px-4 py-2 rounded-lg border border-orange-800 transition-all">
                r/{s}
              </button>
            ))}
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Section */}
      {posts.length > 0 && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000">
          <Card className="bg-orange-900/40 border-orange-700 py-12 text-center shadow-xl">
            <h2 className="text-slate-400 uppercase text-xs font-black tracking-[0.2em] mb-4">Overall Sentiment Verdict</h2>
            <div className={`text-9xl font-black mb-6 tracking-tighter ${sentimentScore > 60 ? 'text-green-400' : sentimentScore < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
              {sentimentScore}%
            </div>
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/20 border border-white/5 text-xl font-bold text-white uppercase italic tracking-wider">
              {sentimentScore > 60 ? '🔥 Positive / Bullish' : sentimentScore < 40 ? '❄️ Negative / Bearish' : '⚖️ Stable / Neutral'}
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} className="bg-orange-950/30 border-orange-800/50 hover:border-orange-600 transition-all group relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-1 h-full ${post.sentiment > 0 ? 'bg-green-500' : post.sentiment < 0 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-[15px] leading-tight line-clamp-3 group-hover:text-orange-200 transition-colors">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{post.num_comments}</span>
                    </div>
                    <Badge variant="outline" className={`border-none font-black ${post.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {post.sentiment > 0 ? '+' : ''}{post.sentiment.toFixed(1)}
                    </Badge>
                  </div>
                  <Button asChild variant="secondary" size="sm" className="w-full bg-orange-900/40 hover:bg-orange-800 text-orange-200 border-none shadow-none">
                    <a href={post.url} target="_blank" rel="noopener noreferrer">View Original Post</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}