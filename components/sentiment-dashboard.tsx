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
    try {
      // 1. Clean the subreddit name
      const cleanSub = sub.trim().replace(/^r\//, '');
      
      // 2. The direct Reddit JSON URL
      const redditUrl = `https://www.reddit.com/r/${cleanSub}/hot.json?limit=10`;
      
      // 3. Using AllOrigins proxy to bypass Reddit's data-center block
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(redditUrl)}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Could not connect to the data proxy.');
      
      const proxyData = await response.json();
      
      // 4. Parse the contents (AllOrigins returns data as a string)
      const data = JSON.parse(proxyData.contents);

      if (!data.data || !data.data.children) {
        throw new Error('Subreddit not found or private.');
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
      
      if (fetchedPosts.length > 0) {
        const avgSentiment = fetchedPosts.reduce((sum, p) => sum + p.sentiment, 0) / fetchedPosts.length;
        // Normalize score to a 0-100 percentage
        setSentimentScore(Math.min(Math.max(Math.round(((avgSentiment + 5) / 10) * 100), 0), 100));
      }

    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError('Reddit blocked the request or the subreddit does not exist.');
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subreddit.trim()) {
      fetchPosts(subreddit.trim());
    }
  };

  const topPolarizingPosts = posts
    .sort((a, b) => b.num_comments - a.num_comments)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 to-orange-900 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Reddit Sentiment Tracker</h1>
          <p className="mt-2 text-slate-400">Monitor community sentiment across Reddit subreddits in real-time</p>
        </div>

        <Card className="mb-8 bg-orange-900/60 border-orange-700">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-white mb-3">Student Project Note</h2>
            <p className="text-sm text-slate-300">
              This app uses client-side fetching with a CORS proxy to bypass provider-level IP blocking, ensuring high availability on cloud hosting.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-orange-900/50 border-orange-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="w-5 h-5" />
              Analyze Subreddit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                placeholder="e.g., technology, stocks, funny"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="flex-1 bg-orange-800 border-orange-600 text-white placeholder:text-slate-400"
              />
              <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
                {loading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </form>
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          </CardContent>
        </Card>

        {posts.length > 0 && (
          <div className="space-y-8">
            <Card className="bg-orange-900/50 border-orange-700">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Community Sentiment</h2>
                  <div className={`text-6xl font-bold ${sentimentScore > 60 ? 'text-green-400' : sentimentScore < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {sentimentScore}%
                  </div>
                  <p className="text-slate-400 mt-2">
                    {sentimentScore > 60 ? 'Positive' : sentimentScore < 40 ? 'Negative' : 'Neutral'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Top Posts Analyzed</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {topPolarizingPosts.map((post) => (
                  <Card key={post.id} className="bg-orange-900/50 border-orange-700 hover:bg-orange-800/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-white text-sm leading-tight line-clamp-2">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-orange-800 text-slate-200">
                          {post.num_comments} comments
                        </Badge>
                        <div className="flex items-center gap-1">
                          {post.sentiment > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className={`text-xs font-bold ${post.sentiment > 0 ? 'text-green-400' : post.sentiment < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                            {post.sentiment > 0 ? '+' : ''}{post.sentiment}
                          </span>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="w-full border-orange-600 text-orange-200 hover:bg-orange-700">
                        <a href={post.url} target="_blank" rel="noopener noreferrer">
                          View on Reddit
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}