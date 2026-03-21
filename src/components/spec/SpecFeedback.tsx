import { useState } from 'react';
import { Button } from '../ui/Button';

interface SpecFeedbackProps {
  onSubmit: (feedback: string) => void;
  loading?: boolean;
}

export function SpecFeedback({ onSubmit, loading = false }: SpecFeedbackProps) {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = feedback.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setFeedback('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="spec-feedback" className="block text-sm font-medium text-gray-700">
          フィードバック
        </label>
        <textarea
          id="spec-feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="仕様書に対するフィードバックを入力してください..."
          rows={4}
          disabled={loading}
          className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-rabit-500 focus:outline-none focus:ring-1 focus:ring-rabit-500 disabled:opacity-50"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !feedback.trim()}>
          {loading ? '送信中...' : 'フィードバックを送信'}
        </Button>
      </div>
    </form>
  );
}
