import { useEffect, useRef } from 'react';
import type { Message, HearingPhase } from '../../types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';

interface ChatContainerProps {
  projectId: string;
  messages: Message[];
  currentPhase: HearingPhase;
  isTyping?: boolean;
  onSend: (message: string) => void;
  disabled?: boolean;
}

const WELCOME_MESSAGES: Record<HearingPhase, string> = {
  problem: 'こんにちは！ラピットくんです ⚡\n\nAIエージェントを使ったアプリ開発、一緒に体験してみましょう！\n\nまずは「課題定義」から。どんなアプリを作りたいか、どんな困りごとを解決したいか教えてください。\n考え方のコツも一緒にお伝えしますね！',
  users: 'いい課題定義ができましたね！\n\n次は「ペルソナ設計」です。誰がこのアプリを使うか、一緒に考えましょう。',
  features: 'ペルソナが見えてきました！\n\n次は「機能設計」。MoSCoW法という優先度分類を一緒にやってみましょう。',
  design: '機能の優先度が整理できました！\n\n次は「UI設計」。AIツールでデザインを作るコツを教えますね。',
  tech: 'デザインの方向性が見えてきました！\n\n次は「技術選定」。プラットフォームや技術の選び方を一緒に考えましょう。',
  confirm: 'ここまでの学びを振り返りましょう！\n\n6つのフェーズで整理した内容をまとめて確認します。',
  build_together: 'ここからが実践編です！\n\nSERVICE_SPEC.mdの書き方と、Claude CodeやCursorでの開発の始め方を教えますね。',
  next_steps: 'お疲れさまでした！\n\nここまでの学びをまとめて、さらにスキルアップするための選択肢をご紹介します。',
};

const PHASE_LEARNING_TIPS: Partial<Record<HearingPhase, string>> = {
  problem: '💡 学びのポイント: 「誰の・どんな・いつ起きる」で課題を具体化する',
  users: '💡 学びのポイント: ペルソナを具体的にすると、必要な機能が自然に見える',
  features: '💡 学びのポイント: MVPでは「Must」に絞ることが成功の鍵',
  design: '💡 学びのポイント: AIへのデザイン指示は「参考例 + 具体的な要望」',
  tech: '💡 学びのポイント: 技術選定の軸は「リーチ × 開発速度 × チーム力」',
  confirm: '💡 ここまでで、アプリ開発の要件定義プロセスを一通り体験しました',
  build_together: '💡 SERVICE_SPEC.md = AIエージェントへの完璧な指示書',
};

export function ChatContainer({
  messages,
  currentPhase,
  isTyping = false,
  onSend,
  disabled = false,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const showWelcome = messages.length === 0 && !isTyping;
  const learningTip = PHASE_LEARNING_TIPS[currentPhase];
  const isNextSteps = currentPhase === 'next_steps';

  return (
    <div className="flex h-full flex-col">
      {/* 学びのポイント バナー */}
      {learningTip && (
        <div className="shrink-0 border-b border-rabit-100 bg-rabit-50 px-4 py-2 sm:px-6">
          <p className="mx-auto max-w-3xl text-center text-xs text-rabit-600">
            {learningTip}
          </p>
        </div>
      )}

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {showWelcome && (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rabit-100 overflow-hidden">
                <img src="/images/rabit-standing.png" alt="ラピットくん" className="h-9 w-9 object-contain" />
              </div>
              <div className="max-w-[80%] rounded-2xl bg-gray-50 border border-gray-100 px-5 py-3">
                <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-900">
                  {WELCOME_MESSAGES[currentPhase]}
                </p>
              </div>
            </div>
          )}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}

          {/* DXBoost CTA — next_steps フェーズでメッセージが存在する場合 */}
          {isNextSteps && messages.length > 0 && !isTyping && (
            <div className="mt-8 rounded-2xl border-2 border-rabit-200 bg-gradient-to-br from-rabit-50 to-white p-6">
              <div className="text-center">
                <img src="/images/rabit-thumbsup.png" alt="ラピットくん" className="mx-auto mb-4 h-20 w-20 object-contain" />
                <h3 className="text-lg font-bold text-rabit-700">
                  もっと深く学びたい方へ
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  DXBoost研修なら、60時間でAIエージェント開発を本格的にマスターできます。
                  助成金活用で実質10.5万円から。
                </p>
                <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <a
                    href="https://dxboost.jp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-rabit-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rabit-700"
                  >
                    DXBoost研修を見る
                  </a>
                  <a
                    href="https://startpass.jp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-rabit-300 px-6 py-2.5 text-sm font-semibold text-rabit-600 transition-colors hover:bg-rabit-50"
                  >
                    無料ワークショップに参加
                  </a>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 入力エリア */}
      <div className="shrink-0 border-t border-gray-200 bg-gray-50/50 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <ChatInput onSend={onSend} disabled={disabled || isTyping} />
          <p className="mt-2 text-center text-xs text-gray-400">
            Shift+Enterで改行 / Enterで送信
          </p>
        </div>
      </div>
    </div>
  );
}
