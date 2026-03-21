import { useState, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 8;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="アプリのアイデアを教えてください..."
        disabled={disabled}
        rows={3}
        className="flex-1 resize-none rounded-2xl border border-gray-200 px-5 py-3 text-base leading-6 placeholder:text-gray-400 focus:border-rabit-500 focus:outline-none focus:ring-2 focus:ring-rabit-500/20 disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rabit-600 text-white transition-colors hover:bg-rabit-700 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="送信"
      >
        <SendHorizontal size={20} />
      </button>
    </div>
  );
}
