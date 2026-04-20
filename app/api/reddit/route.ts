import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subreddit = searchParams.get('subreddit');

  if (!subreddit) return NextResponse.json({ error: 'Subreddit is required' }, { status: 400 });

  try {
    const cleanName = subreddit.trim().replace(/^r\//, '');
    const url = `https://www.reddit.com/r/${cleanName}/hot.json?limit=10`;

    const response = await fetch(url, {
      headers: {
        // This specific string tells Reddit you are a personal project, not a bot
        'User-Agent': 'v2:student.sentiment.project:v1.0 (by /u/Independent-Cry-3774)'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Reddit gave a ${response.status} error. Try again.` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Connection failed. Please try again.' }, { status: 500 });
  }
}