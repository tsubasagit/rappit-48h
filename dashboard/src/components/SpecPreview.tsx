import ReactMarkdown from 'react-markdown'
import { Check, RotateCcw } from 'lucide-react'

type Props = {
  markdown: string
  onApprove: () => void
  onRevise: () => void
  revisionCount: number
  maxRevisions: number
  disabled?: boolean
}

export default function SpecPreview({
  markdown,
  onApprove,
  onRevise,
  revisionCount,
  maxRevisions,
  disabled,
}: Props) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-sm text-gray-700">
          設計書プレビュー（SERVICE_SPEC.md）
        </h3>
        <span className="text-xs text-gray-500">
          修正回数: {revisionCount} / {maxRevisions}
        </span>
      </div>
      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex gap-3 justify-end">
        <button
          onClick={onRevise}
          disabled={disabled || revisionCount >= maxRevisions}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          修正を依頼 {revisionCount >= maxRevisions && '(上限)'}
        </button>
        <button
          onClick={onApprove}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          この内容で進める
        </button>
      </div>
    </div>
  )
}
