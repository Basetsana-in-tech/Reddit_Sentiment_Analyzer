import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');

  if (!subreddit) {
    return NextResponse.json({ error: 'Please enter a subreddit name' }, { status: 400 });
  }

  try {
    // Clean the input (remove spaces and 'r/')
    const cleanName = subreddit.trim().replace(/^r\//, '');
    const url = `https://www.reddit.com/r/${cleanName}/hot.json?limit=10`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      next: { revalidate: 0 }
    });

    // 1. Check if the subreddit exists or is public
    if (response.status === 404 || response.status === 403) {
      return NextResponse.json({ 
        error: `The subreddit 'r/${cleanName}' was not found or is private.` 
      }, { status: response.status });
    }

    const data = await response.json();

    // 2. Check if the subreddit is empty
    if (!data.data?.children || data.data.children.length === 0) {
      return NextResponse.json({ 
        error: `We found 'r/${cleanName}', but there are no recent posts to analyze.` 
      }, { status: 200 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Reddit is currently unreachable. Try again later.' }, { status: 500 });
  }
}