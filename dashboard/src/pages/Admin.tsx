import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../lib/firebase'
import { Clock, CheckCircle, Hammer, MessageCircle, FileText } from 'lucide-react'

type ProjectItem = {
  id: string
  status: string
  name?: string
  description?: string
  createdAt?: number
  approvedAt?: number
}

const STATUS_BADGE: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  hearing: { label: 'ヒアリング中', color: 'bg-blue-100 text-blue-700', icon: <MessageCircle className="w-3 h-3" /> },
  spec_review: { label: '設計書レビュー', color: 'bg-yellow-100 text-yellow-700', icon: <FileText className="w-3 h-3" /> },
  spec_approved: { label: '構築待ち', color: 'bg-orange-100 text-orange-700', icon: <Clock className="w-3 h-3" /> },
  building: { label: '構築中', color: 'bg-purple-100 text-purple-700', icon: <Hammer className="w-3 h-3" /> },
  delivered: { label: '納品完了', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
}

export default function Admin() {
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ProjectItem))
    })
    return () => unsub()
  }, [])

  const filtered = filter === 'all'
    ? projects
    : projects.filter((p) => p.status === filter)

  const formatDate = (ts?: number) => {
    if (!ts) return '-'
    return new Date(ts).toLocaleString('ja-JP', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const getRemainingTime = (approvedAt?: number) => {
    if (!approvedAt) return null
    const remaining = approvedAt + 48 * 60 * 60 * 1000 - Date.now()
    if (remaining <= 0) return '期限超過'
    const h = Math.floor(remaining / (1000 * 60 * 60))
    const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    return `残り ${h}h ${m}m`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐇</span>
            <span className="font-bold text-gray-900">管理画面</span>
          </div>
          <Link to="/" className="text-sm text-gray-500 hover:text-primary">LP</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(STATUS_BADGE).map(([key, { label, color }]) => {
            const count = projects.filter((p) => p.status === key).length
            return (
              <button
                key={key}
                onClick={() => setFilter(filter === key ? 'all' : key)}
                className={`rounded-xl p-4 text-center border transition-all ${
                  filter === key ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                } bg-white`}
              >
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${color}`}>
                  {label}
                </div>
              </button>
            )
          })}
        </div>

        {/* Project List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-700">
              プロジェクト一覧
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')} className="ml-2 text-xs text-primary hover:underline">
                  (すべて表示)
                </button>
              )}
            </h2>
            <span className="text-sm text-gray-400">{filtered.length}件</span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              プロジェクトはまだありません
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const badge = STATUS_BADGE[p.status] ?? STATUS_BADGE.hearing
                return (
                  <div key={p.id} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/chat/${p.id}`}
                            className="font-bold text-gray-900 hover:text-primary truncate"
                          >
                            {p.name || p.id.slice(0, 8)}
                          </Link>
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                        </div>
                        {p.description && (
                          <p className="text-sm text-gray-500 truncate">{p.description}</p>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          作成: {formatDate(p.createdAt)}
                          {p.approvedAt && (
                            <span className="ml-3">
                              {getRemainingTime(p.approvedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link
                          to={`/chat/${p.id}`}
                          className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          チャット
                        </Link>
                        <Link
                          to={`/status/${p.id}`}
                          className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          ステータス
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
