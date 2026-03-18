import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { CheckCircle, Circle, Clock, Github, ExternalLink, Settings } from 'lucide-react'
import Timer from '../components/Timer'
import { FUNCTIONS_BASE_URL } from '../lib/firebase'

type ExternalService = {
  name: string
  reason: string
  setupUrl: string
  requiredKeys: string[]
  customerAction: string
}

type ProjectData = {
  status: string
  name?: string
  description?: string
  approvedAt?: number
  githubUrl?: string
  deployUrl?: string
  specMarkdown?: string
  createdAt?: number
  requiredExternalServices?: ExternalService[]
  setupCompleted?: boolean
}

const STATUS_STEPS = [
  { key: 'hearing', label: 'ヒアリング' },
  { key: 'spec_review', label: '設計書レビュー' },
  { key: 'waiting_setup', label: '外部サービス準備' },
  { key: 'spec_approved', label: '構築準備完了' },
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

        {/* External Services Setup */}
        {project.status === 'waiting_setup' && project.requiredExternalServices && (
          <SetupChecklist
            services={project.requiredExternalServices}
            projectId={projectId!}
          />
        )}

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

function SetupChecklist({ services, projectId }: {
  services: ExternalService[]
  projectId: string
}) {
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const allChecked = services.every((_, i) => checked[i])

  const handleComplete = async () => {
    setSubmitting(true)
    try {
      await fetch(`${FUNCTIONS_BASE_URL}/completeSetup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
    } catch {
      alert('エラーが発生しました。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-amber-600" />
        <h2 className="font-bold text-amber-800">外部サービスの準備が必要です</h2>
      </div>
      <p className="text-sm text-amber-700 mb-4">
        以下のサービスのアカウント作成・設定を完了してください。すべて完了したら「準備完了」ボタンを押してください。
      </p>
      <div className="space-y-4">
        {services.map((service, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-amber-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked[i] || false}
                onChange={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="font-bold text-gray-900">{service.name}</div>
                <p className="text-sm text-gray-600 mt-1">{service.reason}</p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>やること:</strong> {service.customerAction}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {service.requiredKeys.map((key) => (
                    <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                      {key}
                    </span>
                  ))}
                </div>
                <a
                  href={service.setupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                >
                  公式サイトを開く <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </label>
          </div>
        ))}
      </div>
      <button
        onClick={handleComplete}
        disabled={!allChecked || submitting}
        className="mt-4 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? '送信中...' : 'すべて準備完了しました'}
      </button>
    </div>
  )
}
