'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
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
      // Direct link to Reddit's JSON
      const redditUrl = `https://www.reddit.com/r/${cleanSub}/hot.json?limit=10`;
      
      // Using Corsproxy.io - a more reliable bridge for browser-based requests
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(redditUrl)}`;

      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Reddit is currently limiting requests. Please try again in a moment.');
      }
      
      const data = await response.json();

      if (!data.data || !data.data.children || data.data.children.length === 0) {
        throw new Error('Subreddit not found or has no recent posts.');
      }

      const fetchedPosts: RedditPost[] = data.data.children.map((child: any) => {
        const post = child.data;
        const text = post.title + ' ' + (post.selftext || '');
        const sent = analyzeSentiment(text);
        
        return {
          id: post.id,
          title: post.title,
          selftext: post.selftext,
          num_comments: post.num_comments,
          score: post.score,
          sentiment: sent,
          url: `https://reddit.com${post.permalink}`,
        };
      });

      setPosts(fetchedPosts);
      
      const avgSentiment = fetchedPosts.reduce((sum, p) => sum + p.sentiment, 0) / fetchedPosts.length;
      // Calculate a 0-100 score based on sentiment (assuming -5 to +5 range)
      const normalized = Math.round(((avgSentiment + 5) / 10) * 100);
      setSentimentScore(Math.min(Math.max(normalized, 0), 100));

    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to connect to Reddit.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subreddit.trim()) {
      fetchPosts(subreddit.trim());
    }
  };

  const topPosts = [...posts].sort((a, b) => b.num_comments - a.num_comments).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Student Portfolio Note */}
      <Card className="bg-orange-900/40 border-orange-700/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <p className="text-sm text-orange-200/80 italic">
            <strong>Developer Note:</strong> This application utilizes client-side fetching via a CORS proxy to maintain 100% uptime by bypassing provider-level IP restrictions.
          </p>
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card className="bg-orange-900/50 border-orange-700 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-400" />
            Analyze Community Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="Enter subreddit (e.g. technology, space, gaming)"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              className="flex-1 bg-orange-950/50 border-orange-700 text-white placeholder:text-orange-300/30"
            />
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </form>
          {error && <p className="text-red-400 mt-3 text-sm font-medium">⚠️ {error}</p>}
        </CardContent>
      </Card>

      {/* Results Section */}
      {posts.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="mb-8 bg-orange-900/50 border-orange-700 overflow-hidden">
            <div className={`h-2 w-full ${sentimentScore > 60 ? 'bg-green-500' : sentimentScore < 40 ? 'bg-red-500' : 'bg-yellow-500'}`} />
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-xl font-medium text-orange-100 mb-2">Overall Sentiment Score</h2>
              <div className={`text-7xl font-black mb-2 ${sentimentScore > 60 ? 'text-green-400' : sentimentScore < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                {sentimentScore}%
              </div>
              <p className="text-lg font-semibold text-white uppercase tracking-widest">
                {sentimentScore > 60 ? '🚀 Bullish / Positive' : sentimentScore < 40 ? '📉 Bearish / Negative' : '⚖️ Neutral'}
              </p>
            </CardContent>
          </Card>

          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Top Discussions Analyzed
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topPosts.map((post) => (
              <Card key={post.id} className="bg-orange-900/30 border-orange-800 hover:border-orange-600 transition-all group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm line-clamp-2 group-hover:text-orange-300 transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="border-orange-700 text-orange-200">
                      {post.num_comments} comments
                    </Badge>
                    <div className="flex items-center gap-1">
                      {post.sentiment > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-xs font-bold ${post.sentiment > 0 ? 'text-green-400' : post.sentiment < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {post.sentiment > 0 ? '+' : ''}{post.sentiment.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="secondary" size="sm" className="w-full bg-orange-800/50 hover:bg-orange-700 text-orange-100 border-none">
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