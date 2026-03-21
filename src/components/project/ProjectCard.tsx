import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types';
import { Card } from '../ui/Card';
import { StatusBadge } from './StatusBadge';
import { CountdownTimer } from './CountdownTimer';

interface ProjectCardProps {
  project: Project;
}

function getProjectPath(project: Project): string {
  switch (project.status) {
    case 'hearing':
    case 'generating':
      return `/project/${project.id}/chat`;
    case 'reviewing':
    case 'approved':
      return `/project/${project.id}/spec`;
    case 'implementing':
    case 'completed':
      return `/project/${project.id}/mockup`;
    default:
      return `/project/${project.id}/chat`;
  }
}

function formatDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <Card onClick={() => navigate(getProjectPath(project))}>
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          {project.title || '無題のプロジェクト'}
        </h3>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          作成日: {formatDate(project.createdAt)}
        </span>
        <CountdownTimer deadline={project.deadline} />
      </div>
    </Card>
  );
}
