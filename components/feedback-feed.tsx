'use client';

import { Heart, Smile, Meh, Frown, Angry, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedbackEntry {
  id: string;
  name: string;
  email: string;
  sentiment: number;
  message: string;
  timestamp: number;
}

interface FeedbackFeedProps {
  entries: FeedbackEntry[];
  onDelete: (id: string) => void;
}

const sentimentEmojis: Record<number, { icon: any; label: string; color: string; bg: string }> = {
  5: { icon: Heart, label: 'Love it', color: 'text-red-500', bg: 'bg-red-500/10' },
  4: { icon: Smile, label: 'Great', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  3: { icon: Meh, label: 'Okay', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  2: { icon: Frown, label: 'Poor', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  1: { icon: Angry, label: 'Terrible', color: 'text-red-600', bg: 'bg-red-500/10' },
};

export function FeedbackFeed({ entries, onDelete }: FeedbackFeedProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-8 text-center backdrop-blur-md">
        <div className="text-slate-400">No feedback yet. Start collecting responses!</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const sentimentData = sentimentEmojis[entry.sentiment] || sentimentEmojis[3];
        const IconComponent = sentimentData.icon;

        return (
          <div
            key={entry.id}
            className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 backdrop-blur-sm transition-all hover:border-slate-600"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-slate-100">{entry.name}</div>
                  <div className={`flex items-center gap-1 rounded-lg px-2.5 py-1 ${sentimentData.bg}`}>
                    <IconComponent className={`h-4 w-4 ${sentimentData.color}`} />
                    <span className="text-xs font-medium text-slate-300">{sentimentData.label}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">{entry.email}</div>
              </div>
              <button
                onClick={() => onDelete(entry.id)}
                className="rounded-lg p-1.5 hover:bg-slate-800 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-slate-500 hover:text-slate-300" />
              </button>
            </div>

            <p className="mb-2 text-sm text-slate-300">{entry.message}</p>

            <div className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
