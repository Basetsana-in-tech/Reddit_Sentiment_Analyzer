import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');

  if (!subreddit) return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });

  try {
    const cleanName = subreddit.trim().replace(/^r\//, '');
    
    // We use "allorigins.win" which is a free proxy specifically designed 
    // to bypass CORS and cloud IP blocks like the one Railway is hitting.
    const targetUrl = `https://www.reddit.com/r/${cleanName}/hot.json?limit=10`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl);
    const data = await response.json();

    // AllOrigins puts the Reddit JSON inside a "contents" string
    const redditData = JSON.parse(data.contents);

    if (redditData.error || !redditData.data) {
      return NextResponse.json({ error: 'Reddit blocked the request or subreddit not found' }, { status: 403 });
    }

    return NextResponse.json(redditData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'The cloud connection failed. Try again in a moment.' }, { status: 500 });
  }
}