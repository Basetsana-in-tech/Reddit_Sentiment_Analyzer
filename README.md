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

This project is a Next.js app with server-side API routes, so the best live hosting option is **Vercel**.

### Deploy to Vercel

1. Go to https://vercel.com and log in with your GitHub account.
2. Click **New Project**.
3. Select the `Basetsana-in-tech/Reddit_Sentiment_Analyzer` repository.
4. Keep the default settings and deploy.
5. If needed, set the root directory to `/` and the framework to **Next.js**.

### Deploy using Vercel CLI

If you want to deploy from the command line, run:

```bash
npm install -g vercel
vercel login
vercel --prod
```

If you prefer not to use Vercel, note that GitHub Pages is not suitable for this app because it cannot run Next.js server-side API routes.

---

## Notes

- The app uses a server-side API to avoid browser CORS issues with Reddit.
- The sentiment score is normalized to a percentage for easy interpretation.
- Green indicates positive sentiment, red indicates negative sentiment, and yellow means neutral.
