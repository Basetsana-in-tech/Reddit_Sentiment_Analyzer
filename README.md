# Reddit Sentiment Tracker

A **Reddit Sentiment Tracker** that lets you search a subreddit or topic and see how the Reddit community feels about it in real time.

This project is built with **Next.js** and uses a server-side proxy API to fetch live Reddit data, then performs sentiment analysis on Reddit post titles and content using the `sentiment` package.

---

## Features

- Search any subreddit or topic name
- Fetch live Reddit hot posts
- Analyze sentiment using natural language scoring
- Display a hero KPI for community sentiment
- Highlight top posts and show which are most discussed
- Dark orange theme with neon sentiment indicators

---

## How it works

1. **Enter a topic or subreddit** in the search field.
2. The app calls the local API route at `/api/reddit`.
3. The server fetches `https://www.reddit.com/r/{subreddit}/hot.json?limit=10`.
4. The client analyzes the post text and computes a sentiment score.
5. The dashboard shows the overall sentiment percentage and top posts.

---

## Getting Started

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Example input

Try these values:

- `mildlyinfuriating`
- `technology`
- `stocks`
- `cycling`

---

## Deployment

The repo is already connected to GitHub at:

`https://github.com/Basetsana-in-tech/Reddit_Sentiment_Analyzer`

For a public live deployment, the best option is to use **Vercel** or **Netlify** because this is a Next.js app. GitHub can host the source code, while Vercel is the recommended platform for automatic Next.js deployment.

---

## Notes

- The app uses a server-side API to avoid browser CORS issues with Reddit.
- The sentiment score is normalized to a percentage for easy interpretation.
- Green indicates positive sentiment, red indicates negative sentiment, and yellow means neutral.
