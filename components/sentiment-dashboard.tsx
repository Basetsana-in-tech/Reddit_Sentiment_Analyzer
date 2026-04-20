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
  selftext: string;
  num_comments: number;
  score: number;
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
    
    try {
      const cleanSub = sub.trim().replace(/^r\//, '');
      const redditUrl = `https://www.reddit.com/r/${cleanSub}/hot.json?limit=10`;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(redditUrl)}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Reddit is busy. Try again in a moment.');
      
      const data = await response.json();

      if (!data.data || !data.data.children || data.data.children.length === 0) {
        throw new Error('Subreddit not found.');
      }

      const fetchedPosts: RedditPost[] = data.data.children.map((child: any) => {
        const post = child.data;
        const text = post.title + ' ' + (post.selftext || '');
        return {
          id: post.id,
          title: post.title,
          selftext: post.selftext,
          num_comments: post.num_comments,
          score: post.score,
          sentiment: analyzeSentiment(text),
          url: `https://reddit.com${post.permalink}`,
        };
      });

      setPosts(fetchedPosts);
      const avgSentiment = fetchedPosts.reduce((sum, p) => sum + p.sentiment, 0) / fetchedPosts.length;
      setSentimentScore(Math.min(Math.max(Math.round(((avgSentiment + 5) / 10) * 100), 0), 100));

    } catch (err: any) {
      setError(err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subreddit.trim()) fetchPosts(subreddit.trim());
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      
      {/* 1. The "What is this?" Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-orange-900/30 border-orange-800 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-orange-400">
              <Info className="w-5 h-5" />
              <h3 className="font-bold">What is Sentiment?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              It's the process of using AI to determine if a piece of text is positive, negative, or neutral. This app "reads" the latest Reddit posts to judge the community's mood.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-900/30 border-orange-800 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-orange-400">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold">Real-Time Data</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every time you hit "Analyze," we pull the 10 freshest posts from Reddit. You aren't seeing old data; you're seeing what the internet is talking about right now.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-900/30 border-orange-800 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2 text-orange-400">
              <Globe className="w-5 h-5" />
              <h3 className="font-bold">Community Voice</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reddit is a global focus group. This tool helps you see if people are excited (Bullish) or upset (Bearish) about specific topics instantly.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. The Search Section */}
      <Card className="bg-orange-900/50 border-orange-700 shadow-2xl">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="Enter a topic or subreddit..."
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              className="flex-1 bg-orange-950/50 border-orange-700 text-white"
            />
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-500 font-bold">
              {loading ? 'Analyzing...' : 'Analyze Now'}
            </Button>
          </form>
          
          {/* Suggested Words */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Try these:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setSubreddit(s); fetchPosts(s); }}
                className="text-xs bg-orange-800/40 hover:bg-orange-700 text-orange-200 px-2 py-1 rounded border border-orange-700/50 transition-colors"
              >
                r/{s}
              </button>
            ))}
          </div>
          {error && <p className="text-red-400 mt-3 text-sm">⚠️ {error}</p>}
        </CardContent>
      </Card>

      {/* 3. Results Section */}
      {posts.length > 0 && (
        <div className="space-y-6">
          <Card className="bg-orange-900/50 border-orange-700 overflow-hidden text-center py-10">
            <h2 className="text-xl text-slate-300 mb-2">The Verdict</h2>
            <div className={`text-8xl font-black mb-4 ${sentimentScore > 60 ? 'text-green-400' : sentimentScore < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
              {sentimentScore}%
            </div>
            <p className="text-2xl font-bold text-white uppercase tracking-tighter">
              {sentimentScore > 60 ? 'Positive Vibes 🚀' : sentimentScore < 40 ? 'Negative Energy 📉' : 'Purely Neutral ⚖️'}
            </p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} className="bg-orange-900/20 border-orange-800 hover:bg-orange-800/40 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <Badge className="bg-orange-800/50 text-orange-200">{post.num_comments} comments</Badge>
                    <span className={`text-xs font-bold ${post.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Score: {post.sentiment.toFixed(1)}
                    </span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full border-orange-700 text-orange-200 hover:bg-orange-700">
                    <a href={post.url} target="_blank" rel="noopener noreferrer">Read Post</a>
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