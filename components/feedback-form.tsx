'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Heart, Smile, Meh, Frown, Angry } from 'lucide-react';

interface FeedbackFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    sentiment: number;
    message: string;
  }) => void;
}

const sentimentEmojis = [
  { value: 5, icon: Heart, label: 'Love it', color: 'text-red-500' },
  { value: 4, icon: Smile, label: 'Great', color: 'text-emerald-500' },
  { value: 3, icon: Meh, label: 'Okay', color: 'text-yellow-500' },
  { value: 2, icon: Frown, label: 'Poor', color: 'text-orange-500' },
  { value: 1, icon: Angry, label: 'Terrible', color: 'text-red-600' },
];

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || sentiment === null || !message) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({ name, email, sentiment, message });
      setName('');
      setEmail('');
      setSentiment(null);
      setMessage('');
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-700 bg-slate-900/50 p-6 backdrop-blur-md"
    >
      <h2 className="mb-6 text-xl font-semibold text-slate-100">Share Your Feedback</h2>

      <div className="mb-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Name</label>
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-slate-600 bg-slate-800/50 text-slate-100 placeholder-slate-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-slate-600 bg-slate-800/50 text-slate-100 placeholder-slate-500"
            required
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-slate-300">How would you rate your experience?</label>
          <div className="flex gap-3">
            {sentimentEmojis.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSentiment(item.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                    sentiment === item.value
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                  title={item.label}
                >
                  <IconComponent className={`h-6 w-6 ${item.color}`} />
                  <span className="text-xs text-slate-400">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Your Feedback</label>
          <Textarea
            placeholder="Tell us what you think..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border-slate-600 bg-slate-800/50 text-slate-100 placeholder-slate-500"
            rows={4}
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
}
