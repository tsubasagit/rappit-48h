import { useEffect, useState } from 'react';
import { subscribeProject } from '../lib/firestore';
import type { Project } from '../types';

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeProject(projectId, (data) => {
      setProject(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  return { project, loading };
}
