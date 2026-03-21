import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useProject } from '../hooks/useProject';
import { useMessages } from '../hooks/useMessages';
import { useChatStore } from '../stores/useChatStore';
import { getOrCreateProject } from '../lib/firestore';
import { ChatContainer } from '../components/chat/ChatContainer';
import { Badge } from '../components/ui/Badge';
import { HEARING_PHASES } from '../types';

export function Chat() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const { project, loading: projectLoading } = useProject(projectId ?? '');
  const { messages, loading: messagesLoading } = useMessages(projectId ?? '');
  const isAiTyping = useChatStore((s) => s.isAiTyping);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const hasNavigated = useRef(false);

  // プロジェクトを自動取得/作成
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const id = await getOrCreateProject(user.uid);
        if (!cancelled) {
          setProjectId(id);
          setInitializing(false);
        }
      } catch (err) {
        console.error('getOrCreateProject failed:', err);
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // セッション完了 → 仕様書レビューへ自動遷移
  useEffect(() => {
    if (!project || hasNavigated.current) return;
    if (project.hearingPhase === 'next_steps' && project.status === 'generating') {
      hasNavigated.current = true;
      const timer = setTimeout(() => {
        navigate('/spec', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [project, navigate]);

  if (initializing || projectLoading || messagesLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <img src="/images/rabit-excited.png" alt="ラピットくん" className="h-20 w-20 object-contain animate-bounce" />
        <p className="text-sm text-rabit-500">準備中...</p>
      </div>
    );
  }

  if (!project || !projectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-rabit-500">プロジェクトの読み込みに失敗しました</p>
      </div>
    );
  }

  const isGenerating =
    project.hearingPhase === 'next_steps' && project.status === 'generating';

  const currentPhaseIndex = HEARING_PHASES.findIndex(
    (p) => p.key === project.hearingPhase,
  );

  return (
    <div className="flex h-full flex-col">
      {/* パンくずリスト（フェーズ表示） */}
      <div className="shrink-0 border-b border-rabit-100 bg-rabit-50/50 px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center gap-1.5 overflow-x-auto sm:gap-2">
          {HEARING_PHASES.map((phase, index) => {
            const isActive = index === currentPhaseIndex;
            const isComplete = index < currentPhaseIndex;

            return (
              <div key={phase.key} className="flex items-center gap-1.5 sm:gap-2">
                {index > 0 && (
                  <span className={`text-xs ${isComplete ? 'text-rabit-400' : 'text-gray-300'}`}>›</span>
                )}
                <Badge
                  className={`shrink-0 transition-colors ${
                    isActive
                      ? 'bg-rabit-600 text-white shadow-sm'
                      : isComplete
                        ? 'bg-rabit-200 text-rabit-800'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {phase.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* チャットエリア or 生成中 */}
      {isGenerating ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <img src="/images/rabit-deploy.png" alt="生成中" className="h-32 w-32 object-contain" />
          <p className="text-lg font-medium text-rabit-700">仕様書を生成中...</p>
          <p className="text-sm text-rabit-400">
            ヒアリング内容をもとにSERVICE_SPEC.mdを作成しています
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <ChatContainer
            projectId={projectId}
            messages={messages}
            currentPhase={project.hearingPhase}
            isTyping={isAiTyping}
            onSend={(msg) => sendMessage(projectId, msg)}
          />
        </div>
      )}
    </div>
  );
}
