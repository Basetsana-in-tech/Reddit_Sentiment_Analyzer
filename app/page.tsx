import { SentimentDashboard } from '@/components/sentiment-dashboard'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Reddit Sentiment Tracker
          </h1>
          <p className="text-lg text-slate-400">
            Real-time sentiment analysis from Reddit communities
          </p>
        </div>
        <SentimentDashboard />
      </div>
    </main>
  )
}
