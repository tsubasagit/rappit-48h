import { ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';

interface MockupPreviewProps {
  url: string;
  title?: string;
}

export function MockupPreview({ url, title }: MockupPreviewProps) {
  return (
    <Card className="overflow-hidden">
      {/* ブラウザ風フレーム */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
        {/* トラフィックライト */}
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        {/* アドレスバー */}
        <div className="flex flex-1 items-center gap-2 rounded-md bg-white px-3 py-1 text-xs text-gray-400">
          <span className="truncate">{url}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600"
          aria-label="新しいタブで開く"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* タイトル */}
      {title && (
        <div className="border-b border-gray-100 px-4 py-2">
          <p className="text-sm font-medium text-gray-700">{title}</p>
        </div>
      )}

      {/* iframe */}
      <div className="aspect-video w-full">
        <iframe
          src={url}
          title={title ?? 'モックアッププレビュー'}
          className="h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </Card>
  );
}
