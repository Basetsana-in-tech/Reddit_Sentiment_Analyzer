'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, TrendingUp, TrendingDown, Info, Zap, Globe } from 'lucide-react';
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
    const redditUrl = `https://www.reddit.com/r/${cleanSub}/hot.json?limit=10`;

    // SMART PROXY FALLBACK: If one is busy, the app tries the next automatically.
    const proxies = [
      `https://corsproxy.io/?${encodeURIComponent(redditUrl)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(redditUrl)}`
    ];

    for (const url of proxies) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue; // Try next proxy if this one is blocked

        const rawData = await response.json();
        // Handle different data formats from various proxies
        const data = typeof rawData.contents === 'string' ? JSON.parse(rawData.contents) : rawData;

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
          setLoading(false);
          return; // Success! Exit the loop.
        }
      } catch (err) {
        console.warn("Proxy attempt failed, trying next...");
      }
    }

    setError('Reddit is busy or rate-limited. Please wait 10 seconds and try again.');
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subreddit.trim()) fetchPosts(subreddit.trim());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 max-w-6xl mx-auto px-4 py-8">
      
      {/* Educational Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-orange-900/30 border-orange-800 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-orange-400 font-bold">
              <Info className="w-5 h-5" /> Sentiment Analysis
            </div>
            <p className="text-xs text-slate-300">Using NLP algorithms to score text as positive, negative, or neutral based on keyword impact.</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-900/30 border-orange-800 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-orange-400 font-bold">
              <Zap className="w-5 h-5" /> Live Fetching
            </div>
            <p className="text-xs text-slate-300">This data isn't cached; it's pulled directly from Reddit's "Hot" feed the moment you search.</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-900/30 border-orange-800 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-orange-400 font-bold">
              <Globe className="w-5 h-5" /> Global Mood
            </div>
            <p className="text-xs text-slate-300">Analyze any public community to gauge interest, excitement, or frustration instantly.</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Search */}
      <Card className="bg-orange-900/50 border-orange-700 shadow-2xl">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="e.g. technology, stocks, gaming"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              className="flex-1 bg-orange-950/50 border-orange-700 text-white"
            />
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-500 font-bold px-8 transition-all">
              {loading ? 'Analyzing...' : 'Analyze Now'}
            </Button>
          </form>
          
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mr-2">Try These:</span>
            {suggestions.map((s) => (
              <button key={s} onClick={() => { setSubreddit(s); fetchPosts(s); }}
                className="text-xs bg-orange-800/40 hover:bg-orange-600 text-orange-100 px-3 py-1.5 rounded-full border border-orange-700/50 transition-all">
                r/{s}
              </button>
            ))}
          </div>
          {error && <p className="text-red-400 mt-4 text-sm font-medium">⚠️ {error}</p>}
        </CardContent>
      </Card>

      {/* Results Display */}
      {posts.length > 0 && (
        <div className="space-y-6">
          <Card className="bg-orange-900/50 border-orange-700 py-10 text-center shadow-inner">
            <h2 className="text-xl text-slate-300 mb-2 font-medium">Community Consensus</h2>
            <div className={`text-8xl font-black mb-4 tracking-tighter ${sentimentScore > 60 ? 'text-green-400' : sentimentScore < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
              {sentimentScore}%
            </div>
            <p className="text-2xl font-bold text-white uppercase tracking-wider">
              {sentimentScore > 60 ? 'Positive Vibes 🚀' : sentimentScore < 40 ? 'Negative Energy 📉' : 'Purely Neutral ⚖️'}
            </p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} className="bg-orange-900/20 border-orange-800 hover:border-orange-600 transition-all group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm line-clamp-2 leading-snug group-hover:text-orange-300 transition-colors">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4 text-xs font-bold">
                    <Badge className="bg-orange-800/50 text-orange-200 border-none">{post.num_comments} comments</Badge>
                    <span className={post.sentiment > 0 ? 'text-green-400' : 'text-red-400'}>Score: {post.sentiment.toFixed(1)}</span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full border-orange-800 text-orange-300 hover:bg-orange-800 hover:text-white transition-all">
                    <a href={post.url} target="_blank" rel="noopener noreferrer">Original Post</a>
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