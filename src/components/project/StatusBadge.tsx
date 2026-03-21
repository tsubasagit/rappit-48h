import type { ProjectStatus } from '../../types';
import { PROJECT_STATUS_LABELS } from '../../types';
import { Badge } from '../ui/Badge';

interface StatusBadgeProps {
  status: ProjectStatus;
}

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const statusVariantMap: Record<ProjectStatus, BadgeVariant> = {
  hearing: 'info',
  generating: 'warning',
  reviewing: 'warning',
  approved: 'success',
  implementing: 'info',
  completed: 'success',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariantMap[status]}>
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  );
}
