import { useEffect, useState } from 'react';
import { subscribeProjects } from '../lib/firestore';
import type { Project } from '../types';

export function useProjects(userId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeProjects(userId, (data) => {
      setProjects(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { projects, loading };
}
