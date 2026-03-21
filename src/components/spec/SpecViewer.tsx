import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SpecViewerProps {
  markdown: string;
}

export function SpecViewer({ markdown }: SpecViewerProps) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-h1:text-2xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-a:text-rabit-600 prose-strong:text-gray-900 prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-rabit-700 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-li:text-gray-700 prose-table:border-collapse prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-gray-200 prose-td:px-3 prose-td:py-2">
      <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    </div>
  );
}
