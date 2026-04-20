import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');

  if (!subreddit) {
    return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=10`,
      {
        headers: {
          // This "tricks" Reddit into thinking the request is from a regular Chrome browser
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        // This prevents Vercel from caching a "blocked" response
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      // If Reddit sends HTML (the error page), we capture it as text to avoid crashing
      const errorBody = await response.text();
      
      // Check if we got the HTML "scrim" instead of data
      if (errorBody.includes('<body')) {
        return NextResponse.json(
          { error: 'Reddit is temporarily blocking this IP. Try again in 2 minutes.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Reddit fetch failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { error: 'Server failed to connect to Reddit' },
      { status: 500 }
    );
  }
}