import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ProjectCard } from '../components/project/ProjectCard';
import { Plus, FolderOpen } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuthContext();
  const { projects, loading } = useProjects(user?.uid ?? '');
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-rabit-900">
          マイプロジェクト
        </h1>
        <Button
          variant="primary"
          onClick={() => navigate('/new')}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          新規プロジェクト
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rabit-200 bg-rabit-50/50 px-6 py-16 text-center">
          <FolderOpen className="mb-4 h-12 w-12 text-rabit-300" />
          <h2 className="mb-2 text-lg font-semibold text-rabit-700">
            まだプロジェクトがありません
          </h2>
          <p className="mb-6 text-sm text-rabit-500">
            最初のプロジェクトを作成して、48時間でアイデアをカタチにしましょう
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/new')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            プロジェクトを作成
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
