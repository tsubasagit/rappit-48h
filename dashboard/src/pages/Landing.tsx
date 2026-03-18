import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Clock, Github, MessageCircle, FileText, Rocket } from 'lucide-react'
import { FUNCTIONS_BASE_URL } from '../lib/firebase'

export default function Landing() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${FUNCTIONS_BASE_URL}/createProject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'lp' }),
      })
      const data = await res.json()
      navigate(`/chat/${data.projectId}`)
    } catch {
      alert('プロジェクトの作成に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐇</span>
            <span className="font-bold text-lg text-gray-900">ラピットくん</span>
          </div>
          <a
            href="https://apptalenthub.co.jp"
            className="text-sm text-gray-500 hover:text-gray-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            AppTalentHub
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">🐇</div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            48時間で、あなたのアイデアを
            <br />
            <span className="text-primary">動くプロダクト</span>に。
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AIエージェント「ラピットくん」が要件をヒアリングし、
            プロのエンジニアが48時間以内に開発・デプロイ。
            <br />
            <strong className="text-gray-900">完全無料。成果物はOSSとして公開。</strong>
          </p>
          <button
            onClick={handleStart}
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-10 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '準備中...' : '無料で始める →'}
          </button>
          <p className="mt-4 text-sm text-gray-400">
            アカウント登録不要・クレジットカード不要
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            ご利用の流れ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step={1}
              icon={<MessageCircle className="w-8 h-8" />}
              title="ラピットくんと対話"
              description="チャットで作りたいものを伝えるだけ。ラピットくんが丁寧にヒアリングします。"
            />
            <StepCard
              step={2}
              icon={<FileText className="w-8 h-8" />}
              title="設計書を自動生成"
              description="ヒアリング内容から設計書（SERVICE_SPEC）を自動作成。内容を確認・修正できます。"
            />
            <StepCard
              step={3}
              icon={<Rocket className="w-8 h-8" />}
              title="48時間で開発・納品"
              description="承認後48時間以内に開発・デプロイ。GitHubリポジトリと動くURLをお届けします。"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            特徴
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="48時間以内に納品"
              description="設計書承認から48時間以内に、デプロイ済みのプロダクトを納品します。"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="完全無料"
              description="開発費用は一切かかりません。AppTalentHubの技術力をお試しください。"
            />
            <FeatureCard
              icon={<Github className="w-6 h-6" />}
              title="OSS公開"
              description="成果物はGitHubでオープンソースとして公開。ポートフォリオとしても活用可能です。"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            アイデアを形にしませんか？
          </h2>
          <p className="text-lg mb-8 opacity-90">
            ラピットくんがお手伝いします。まずはチャットでお話しましょう。
          </p>
          <button
            onClick={handleStart}
            disabled={loading}
            className="bg-white text-primary font-bold py-4 px-10 rounded-lg text-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading ? '準備中...' : '無料で始める →'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; 2026 AppTalentHub株式会社</p>
        </div>
      </footer>
    </div>
  )
}

function StepCard({ step, icon, title, description }: {
  step: number
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-light text-primary mb-4">
        {icon}
      </div>
      <div className="text-sm font-bold text-primary mb-2">STEP {step}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl p-6 border border-gray-200 hover:border-primary transition-colors">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
