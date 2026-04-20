import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');

  if (!subreddit) {
    return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });
  }

  try {
    const cleanName = subreddit.trim().replace(/^r\//, '').replace(/\s+/g, '');
    const url = `https://www.reddit.com/r/${cleanName}/hot.json?limit=10`;
    
    const response = await fetch(url, {
      headers: {
        // The "Holy Trinity" of headers to bypass bot detection:
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.reddit.com/',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 0 } // Ensures Vercel doesn't cache the "404" error
    });

    // Handle Reddit's "Lies" (When it sends 404/403 to servers)
    if (!response.ok) {
      if (response.status === 404 || response.status === 403) {
        return NextResponse.json({ 
          error: `Reddit is blocking the server request for 'r/${cleanName}'. This usually happens on cloud platforms. Please try again in a moment.` 
        }, { status: 429 }); // 429 is "Too Many Requests," which is more accurate
      }
      return NextResponse.json({ error: 'Reddit fetch failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Server connection failed' }, { status: 500 });
  }
}