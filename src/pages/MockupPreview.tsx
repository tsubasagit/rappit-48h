import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useProject } from '../hooks/useProject';
import { getOrCreateProject, updateProjectStatus } from '../lib/firestore';
import { MockupGallery } from '../components/mockup/MockupGallery';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';

export function MockupPreviewPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<string | null>(null);
  const { project, loading } = useProject(projectId ?? '');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const id = await getOrCreateProject(user.uid);
      if (!cancelled) setProjectId(id);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleStartImplementation = async () => {
    if (!projectId) return;
    setIsStarting(true);
    setError('');
    try {
      await updateProjectStatus(projectId, 'implementing');
      navigate('/chat', { replace: true });
    } catch {
      setError('ステータスの更新に失敗しました。もう一度お試しください。');
      setIsStarting(false);
    }
  };

  if (loading || !projectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-rabit-500">プロジェクトが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/spec')}
            className="mb-2 inline-flex items-center gap-1 text-sm text-rabit-500 hover:text-rabit-700"
          >
            <ArrowLeft className="h-4 w-4" />
            仕様書に戻る
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-rabit-900">モックアッププレビュー</h1>
              <p className="mt-1 text-sm text-rabit-500">{project.title}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="gap-2"
              onClick={handleStartImplementation}
              disabled={isStarting}
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  処理中...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  承認して実装開始
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <MockupGallery urls={project.mockupUrls ?? []} />
      </div>
    </div>
  );
}
