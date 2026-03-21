import { useEffect, useState } from 'react';
import { subscribeMessages } from '../lib/firestore';
import type { Message } from '../types';

export function useMessages(projectId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeMessages(projectId, (data) => {
      setMessages(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  return { messages, loading };
}
