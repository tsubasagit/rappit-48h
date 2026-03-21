import type { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
}

function formatTime(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { role, content, createdAt } = message;

  if (role === 'system') {
    return (
      <div className="flex justify-center">
        <p className="text-xs text-gray-400">{content}</p>
      </div>
    );
  }

  const isUser = role === 'user';

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* アシスタントアバター */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rabit-100 overflow-hidden">
          <img src="/images/rabit-standing.png" alt="ラピットくん" className="h-7 w-7 object-contain" />
        </div>
      )}

      {/* メッセージバブル */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-rabit-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        <p
          className={`mt-1 text-right text-xs ${
            isUser ? 'text-rabit-200' : 'text-gray-400'
          }`}
        >
          {formatTime(createdAt)}
        </p>
      </div>
    </div>
  );
}
