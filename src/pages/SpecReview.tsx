import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useProject } from '../hooks/useProject';
import { getOrCreateProject, updateProjectStatus } from '../lib/firestore';
import { generateMockups, regenerateSpec } from '../lib/api';
import { SpecViewer } from '../components/spec/SpecViewer';
import { SpecFeedback } from '../components/spec/SpecFeedback';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

export function SpecReview() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<string | null>(null);
  const { project, loading } = useProject(projectId ?? '');
  const [isApproving, setIsApproving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
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

  const handleApprove = async () => {
    if (!projectId) return;
    setIsApproving(true);
    setError('');
    try {
      await updateProjectStatus(projectId, 'approved');
      await generateMockups(projectId);
      navigate('/mockup', { replace: true });
    } catch {
      setError('承認処理に失敗しました。もう一度お試しください。');
      setIsApproving(false);
    }
  };

  const handleFeedback = async (feedback: string) => {
    if (!projectId) return;
    setIsRegenerating(true);
    setError('');
    try {
      await regenerateSpec(projectId, feedback);
    } catch {
      setError('仕様書の再生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsRegenerating(false);
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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/chat')}
              className="mb-2 inline-flex items-center gap-1 text-sm text-rabit-500 hover:text-rabit-700"
            >
              <ArrowLeft className="h-4 w-4" />
              チャットに戻る
            </button>
            <h1 className="text-2xl font-bold text-rabit-900">仕様書レビュー</h1>
            <p className="mt-1 text-sm text-rabit-500">
              {project.title} - SERVICE_SPEC.md
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="gap-2"
            onClick={handleApprove}
            disabled={isApproving || isRegenerating}
          >
            {isApproving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                処理中...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                承認する
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isRegenerating && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-rabit-200 bg-rabit-50 px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-rabit-600" />
            <p className="text-sm text-rabit-700">フィードバックをもとに仕様書を再生成中...</p>
          </div>
        )}

        <div className="mb-8">
          <SpecViewer markdown={project.serviceSpecMd ?? ''} />
        </div>

        <div className="border-t border-rabit-100 pt-8">
          <SpecFeedback onSubmit={handleFeedback} loading={isRegenerating || isApproving} />
        </div>
      </div>
    </div>
  );
}
