'use client';

import { Heart, Smile, Meh, Frown, Angry } from 'lucide-react';

interface KPICardsProps {
  totalResponses: number;
  averageSentiment: number;
  satisfactionRate: number;
}

const sentimentMap: Record<number, { icon: any; label: string; color: string }> = {
  5: { icon: Heart, label: 'Love it', color: 'text-red-500' },
  4: { icon: Smile, label: 'Great', color: 'text-emerald-500' },
  3: { icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  2: { icon: Frown, label: 'Poor', color: 'text-orange-500' },
  1: { icon: Angry, label: 'Terrible', color: 'text-red-600' },
};

export function KPICards({ totalResponses, averageSentiment, satisfactionRate }: KPICardsProps) {
  const sentimentLevel = Math.round(averageSentiment);
  const sentimentData = sentimentMap[sentimentLevel] || sentimentMap[3];
  const IconComponent = sentimentData.icon;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Responses */}
      <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900/70 to-slate-800/50 p-6 backdrop-blur-md">
        <div className="mb-2 text-sm font-medium text-slate-400">Total Responses</div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-slate-100">{totalResponses}</div>
          <div className="text-xs text-slate-500">feedback entries</div>
        </div>
      </div>

      {/* Average Sentiment */}
      <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900/70 to-slate-800/50 p-6 backdrop-blur-md">
        <div className="mb-2 text-sm font-medium text-slate-400">Average Sentiment</div>
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-emerald-500">{averageSentiment.toFixed(1)}</div>
            <div className="text-xs text-slate-500">/5</div>
          </div>
          <IconComponent className={`h-8 w-8 ${sentimentData.color}`} />
        </div>
      </div>

      {/* Satisfaction Rate */}
      <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900/70 to-slate-800/50 p-6 backdrop-blur-md">
        <div className="mb-2 text-sm font-medium text-slate-400">Satisfaction Rate</div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-emerald-500">{satisfactionRate}%</div>
          <div className="text-xs text-slate-500">positive</div>
        </div>
      </div>
    </div>
  );
}
