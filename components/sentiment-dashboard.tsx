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
      const response = await fetch(`/api/reddit?subreddit=${encodeURIComponent(sub)}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch posts');
      }
      const data = await response.json();
      console.log('Number of posts fetched:', data.data.children.length);
      const fetchedPosts: RedditPost[] = data.data.children.map((child: any) => {
        const post = child.data;
        const text = post.title + ' ' + (post.selftext || '');
        const sent = analyzeSentiment(text);
        console.log('Post:', post.title.substring(0, 50), 'Sentiment:', sent);
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
      console.log('Average sentiment:', avgSentiment, 'Posts:', fetchedPosts.length);
      setSentimentScore(Math.round((avgSentiment + 5) / 10 * 100));
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err?.message || 'Failed to fetch or analyze posts.');
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
    .filter(p => Math.abs(p.sentiment) < 5) // Include all posts
    .sort((a, b) => b.num_comments - a.num_comments)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 to-orange-900 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Reddit Sentiment Tracker</h1>
          <p className="mt-2 text-slate-400">Monitor community sentiment across Reddit subreddits in real-time</p>
        </div>

        {/* Info Box */}
        <Card className="mb-8 bg-orange-900/60 border-orange-700">
          <CardContent>
            <h2 className="text-xl font-semibold text-white mb-3">What is a sentiment tracker?</h2>
            <p className="text-sm text-slate-300 mb-4">
              A sentiment tracker monitors how people feel about a topic on Reddit by analyzing words and phrases from posts. It helps you drill down into real-time conversations, understand public opinion, and see whether a topic is being talked about positively or negatively.
            </p>
            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li><strong>Why it’s useful:</strong> It turns raw Reddit chatter into actionable insight so you can spot trends, issues, or brand sentiment quickly.</li>
              <li><strong>How it collects data:</strong> The app fetches hot posts from a subreddit and analyzes the text in each post for sentiment.</li>
              <li><strong>How to use it:</strong> Type the topic or subreddit name you care about, then press Analyze to see how people are searching and talking about it.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Search Form */}
        <Card className="mb-8 bg-orange-900/50 border-orange-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="w-5 h-5" />
              Enter topic or subreddit name
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-3">
              Type words or a subreddit to analyze sentiment for that topic in real time.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="text"
                placeholder="e.g., mildlyinfuriating, technology, stocks"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="flex-1 bg-orange-800 border-orange-600 text-white"
              />
              <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                {loading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </form>
            {error && <p className="text-red-400 mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* Hero KPI */}
        {posts.length > 0 && (
          <Card className="mb-8 bg-orange-900/50 border-orange-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Current Community Sentiment</h2>
                <div className={`text-6xl font-bold ${sentimentScore > 60 ? 'text-green-400 glow-green' : sentimentScore < 40 ? 'text-red-400 glow-red' : 'text-yellow-400 glow-yellow'}`}>
                  {sentimentScore}%
                </div>
                <p className="text-slate-400 mt-2">
                  {sentimentScore > 60 ? 'Bullish/Happy' : sentimentScore < 40 ? 'Bearish/Angry' : 'Neutral'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Polarizing Posts */}
        {topPolarizingPosts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Top 5 Most Polarizing Posts</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topPolarizingPosts.map((post) => (
                <Card key={post.id} className="bg-orange-900/50 border-orange-700 hover:bg-orange-800/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-white text-sm leading-tight">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {post.num_comments} comments
                      </Badge>
                      <div className="flex items-center gap-1">
                        {post.sentiment > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-xs ${post.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {post.sentiment > 0 ? '+' : ''}{post.sentiment.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a href={post.url} target="_blank" rel="noopener noreferrer">
                        View on Reddit
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
