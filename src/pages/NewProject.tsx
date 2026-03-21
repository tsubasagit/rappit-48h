import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { createProject } from '../lib/firestore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Rocket } from 'lucide-react';

export function NewProject() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) {
      setError('プロジェクト名を入力してください');
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      const projectId = await createProject(user.uid, trimmed);
      navigate(`/project/${projectId}/chat`);
    } catch {
      setError('プロジェクトの作成に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card className="p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rabit-100">
            <Rocket className="h-6 w-6 text-rabit-600" />
          </div>
          <h1 className="text-xl font-bold text-rabit-900">
            新しいプロジェクトを作成
          </h1>
          <p className="mt-1 text-sm text-rabit-500">
            プロジェクト名を入力して、AIヒアリングを開始しましょう
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="project-title"
              className="mb-2 block text-sm font-medium text-rabit-700"
            >
              プロジェクト名
            </label>
            <input
              id="project-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="例: 社内タスク管理アプリ"
              className="w-full rounded-lg border border-rabit-200 px-4 py-2.5 text-rabit-900 placeholder:text-rabit-300 focus:border-rabit-500 focus:outline-none focus:ring-2 focus:ring-rabit-500/20"
              disabled={isSubmitting}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? 'プロジェクトを作成中...' : 'プロジェクトを作成'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
