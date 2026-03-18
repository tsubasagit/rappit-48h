import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { CheckCircle, Circle, Clock, Github, ExternalLink } from 'lucide-react'
import Timer from '../components/Timer'

type ProjectData = {
  status: string
  name?: string
  description?: string
  approvedAt?: number
  githubUrl?: string
  deployUrl?: string
  specMarkdown?: string
  createdAt?: number
}

const STATUS_STEPS = [
  { key: 'hearing', label: 'ヒアリング' },
  { key: 'spec_review', label: '設計書レビュー' },
  { key: 'spec_approved', label: '設計書承認' },
  { key: 'building', label: '構築中' },
  { key: 'delivered', label: '納品完了' },
] as const

export default function ProjectStatus() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    const unsub = onSnapshot(doc(db, 'projects', projectId), (snap) => {
      if (snap.exists()) {
        setProject(snap.data() as ProjectData)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [projectId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-bounce">🐇</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">プロジェクトが見つかりません</p>
          <Link to="/" className="text-primary hover:underline">トップへ戻る</Link>
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === project.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-2">
          <span className="text-xl">🐇</span>
          <span className="font-bold text-gray-900">プロジェクト状況</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Project Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {project.name || 'プロジェクト'}
          </h1>
          {project.description && (
            <p className="text-gray-600 text-sm">{project.description}</p>
          )}
        </div>

        {/* Timer */}
        {project.approvedAt && project.status !== 'delivered' && (
          <Timer approvedAt={project.approvedAt} />
        )}

        {/* Status Steps */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="font-bold text-gray-700 mb-4">進捗</h2>
          <div className="space-y-4">
            {STATUS_STEPS.map((step, idx) => {
              const isDone = idx <= currentIdx
              const isCurrent = idx === currentIdx
              return (
                <div key={step.key} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle className={`w-6 h-6 ${isCurrent ? 'text-primary' : 'text-green-500'}`} />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                  <span className={`text-sm ${isCurrent ? 'font-bold text-primary' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  {isCurrent && (
                    <Clock className="w-4 h-4 text-primary animate-pulse ml-auto" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Deliverables */}
        {project.status === 'delivered' && (
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h2 className="font-bold text-green-800 mb-4">納品物</h2>
            <div className="space-y-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-700 hover:underline"
                >
                  <Github className="w-4 h-4" />
                  GitHubリポジトリ
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {project.deployUrl && (
                <a
                  href={project.deployUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-green-700 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  デプロイ済みURL
                </a>
              )}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-primary">
            トップページへ
          </Link>
        </div>
      </div>
    </div>
  )
}
