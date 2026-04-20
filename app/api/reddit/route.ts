import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');

  if (!subreddit) {
    return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=10`, {
      headers: {
        'User-Agent': 'RedditSentimentTracker/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json({ error: body || 'Reddit fetch failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Server fetch failed' }, { status: 500 });
  }
}
