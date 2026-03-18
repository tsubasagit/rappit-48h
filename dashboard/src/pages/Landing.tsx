import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Github, Clock, Zap, Code2, MessageCircle, FileText, Rocket } from 'lucide-react'
import { FUNCTIONS_BASE_URL } from '../lib/firebase'
import { useScrollReveal } from '../hooks/useScrollReveal'

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
    <div className="bg-[#0a0e1a] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#538bb0] to-[#7ab5d6] flex items-center justify-center text-sm">
              🐇
            </div>
            <span className="font-bold text-lg tracking-wide">ラピットくん</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#concept" className="text-sm text-white/50 hover:text-white transition-colors hidden md:block">
              コンセプト
            </a>
            <a href="#flow" className="text-sm text-white/50 hover:text-white transition-colors hidden md:block">
              ご利用の流れ
            </a>
            <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors hidden md:block">
              特徴
            </a>
            <button
              onClick={handleStart}
              disabled={loading}
              className="text-sm bg-[#538bb0] hover:bg-[#3d6f94] px-5 py-2 rounded-full transition-colors disabled:opacity-50"
            >
              無料で始める
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection onStart={handleStart} loading={loading} />

      {/* Gradient Divider */}
      <div className="h-px gradient-line" />

      {/* Concept Section */}
      <ConceptSection />

      {/* Flow Section */}
      <FlowSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <CTASection onStart={handleStart} loading={loading} />

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">🐇</span>
            <span className="text-sm text-white/40">ラピットくん by AppTalentHub</span>
          </div>
          <p className="text-xs text-white/30">&copy; 2026 AppTalentHub株式会社</p>
        </div>
      </footer>
    </div>
  )
}

/* ===== Hero Section ===== */
function HeroSection({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(83,139,176,0.15)_0%,_transparent_70%)]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Particles */}
        <Particles />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20">
        {/* Badge */}
        <div className="hero-text-in inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/60">受付中 — 完全無料</span>
        </div>

        {/* Main headline */}
        <h1 className="hero-text-in hero-text-in-delay">
          <span className="block text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            48時間で、
          </span>
          <span className="block text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mt-2">
            あなたのアイデアを
          </span>
          <span className="block text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mt-2">
            <span className="bg-gradient-to-r from-[#538bb0] via-[#7ab5d6] to-[#538bb0] bg-clip-text text-transparent">
              動くプロダクト
            </span>
            に。
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-text-in hero-text-in-delay-2 mt-8 text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
          AIエージェント「ラピットくん」が要件をヒアリング。
          <br className="hidden md:block" />
          プロのエンジニアが48時間以内に開発・デプロイ。
          <br className="hidden md:block" />
          成果物はオープンソースとして公開。
        </p>

        {/* CTA */}
        <div className="hero-text-in hero-text-in-delay-3 mt-12 flex flex-col items-center gap-4">
          <button
            onClick={onStart}
            disabled={loading}
            className="group relative bg-gradient-to-r from-[#538bb0] to-[#3d6f94] hover:from-[#3d6f94] hover:to-[#538bb0] text-white font-bold py-4 px-10 rounded-full text-lg transition-all disabled:opacity-50 glow-pulse"
          >
            <span className="flex items-center gap-2">
              {loading ? '準備中...' : '無料で始める'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <span className="text-xs text-white/30">アカウント登録不要・クレジットカード不要</span>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/20">
            <span className="text-xs tracking-widest">SCROLL</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===== Particles ===== */
function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1,
    })),
  [])

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </>
  )
}

/* ===== Concept Section ===== */
function ConceptSection() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section id="concept" className="py-24 md:py-36 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(83,139,176,0.08)_0%,_transparent_60%)]" />
      <div ref={ref} className={`max-w-4xl mx-auto px-4 text-center reveal ${isVisible ? 'visible' : ''}`}>
        <span className="text-xs tracking-[0.3em] text-[#538bb0] uppercase mb-6 block">Concept</span>
        <h2 className="text-2xl md:text-4xl font-bold leading-relaxed">
          受託開発の価値が変わる時代に、
          <br />
          <span className="text-[#7ab5d6]">「まず動くもの」</span>を無料でお届けする。
        </h2>
        <div className="mt-8 h-px w-24 mx-auto gradient-line" />
        <p className="mt-8 text-white/40 text-sm md:text-base leading-loose max-w-2xl mx-auto">
          AI技術の進化により、プロトタイプ開発のスピードは劇的に向上しました。
          AppTalentHubは、その恩恵を最大限に活かし、
          あなたのアイデアを48時間で形にします。
          完成した成果物はオープンソースとして公開し、
          技術コミュニティに還元します。
        </p>
      </div>
    </section>
  )
}

/* ===== Flow Section ===== */
function FlowSection() {
  const { ref, isVisible } = useScrollReveal()

  const steps = [
    {
      num: '01',
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'ラピットくんと対話',
      description: 'チャットで作りたいものを伝えるだけ。AIエージェントが丁寧にヒアリングし、要件を整理します。',
    },
    {
      num: '02',
      icon: <FileText className="w-6 h-6" />,
      title: '設計書を自動生成',
      description: 'ヒアリング内容からSERVICE_SPECを自動作成。内容を確認し、修正を依頼することもできます。',
    },
    {
      num: '03',
      icon: <Code2 className="w-6 h-6" />,
      title: 'エンジニアが構築',
      description: '承認された設計書をもとに、プロのエンジニアが48時間以内に開発。AI開発ツールを駆使します。',
    },
    {
      num: '04',
      icon: <Rocket className="w-6 h-6" />,
      title: 'デプロイ・納品',
      description: '動くURLとGitHubリポジトリをお届け。すぐに使い始めることができます。',
    },
  ]

  return (
    <section id="flow" className="py-24 md:py-36 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d1225] to-transparent" />
      <div className="relative max-w-6xl mx-auto px-4">
        <div ref={ref} className={`text-center mb-16 reveal ${isVisible ? 'visible' : ''}`}>
          <span className="text-xs tracking-[0.3em] text-[#538bb0] uppercase mb-4 block">How It Works</span>
          <h2 className="text-2xl md:text-4xl font-bold">ご利用の流れ</h2>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children ${isVisible ? 'visible' : ''}`}>
          {steps.map((step) => (
            <FlowCard key={step.num} {...step} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FlowCard({ num, icon, title, description }: {
  num: string; icon: React.ReactNode; title: string; description: string
}) {
  return (
    <div className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-[#538bb0]/30 transition-all duration-500">
      {/* Step number */}
      <div className="text-5xl font-bold text-white/[0.04] absolute top-4 right-4 group-hover:text-[#538bb0]/10 transition-colors">
        {num}
      </div>
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-[#538bb0]/10 border border-[#538bb0]/20 flex items-center justify-center text-[#7ab5d6] mb-4 group-hover:bg-[#538bb0]/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </div>
  )
}

/* ===== Features Section ===== */
function FeaturesSection() {
  const { ref, isVisible } = useScrollReveal()

  const features = [
    {
      icon: <Clock className="w-7 h-7" />,
      title: '48時間以内に納品',
      description: '設計書の承認から48時間以内に、デプロイ済みのプロダクトを納品します。リアルタイムで進捗を確認できます。',
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: '完全無料',
      description: '開発費用は一切かかりません。AppTalentHubの技術力を無料でお試しいただけます。',
      gradient: 'from-amber-500/20 to-orange-500/20',
    },
    {
      icon: <Github className="w-7 h-7" />,
      title: 'OSS公開',
      description: '成果物はGitHubでオープンソースとして公開。ポートフォリオやプロトタイプとしても活用できます。',
      gradient: 'from-emerald-500/20 to-teal-500/20',
    },
  ]

  return (
    <section id="features" className="py-24 md:py-36 relative">
      <div className="relative max-w-6xl mx-auto px-4">
        <div ref={ref} className={`text-center mb-16 reveal ${isVisible ? 'visible' : ''}`}>
          <span className="text-xs tracking-[0.3em] text-[#538bb0] uppercase mb-4 block">Features</span>
          <h2 className="text-2xl md:text-4xl font-bold">特徴</h2>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children ${isVisible ? 'visible' : ''}`}>
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 hover:border-[#538bb0]/30 transition-all duration-500"
            >
              {/* Background glow */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${f.gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

              <div className="relative">
                <div className="text-[#7ab5d6] mb-5">{f.icon}</div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ===== Stats Section ===== */
function StatsSection() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="py-24 md:py-36 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#538bb0]/5 via-transparent to-[#538bb0]/5" />
      <div ref={ref} className={`max-w-6xl mx-auto px-4 reveal ${isVisible ? 'visible' : ''}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem value="48" unit="時間" label="最大開発期間" />
          <StatItem value="0" unit="円" label="開発費用" />
          <StatItem value="100" unit="%" label="ソースコード公開" />
          <StatItem value="3" unit="回" label="設計書修正可能回数" />
        </div>
      </div>
    </section>
  )
}

function StatItem({ value, unit, label }: { value: string; unit: string; label: string }) {
  const [displayed, setDisplayed] = useState(false)
  const { ref, isVisible } = useScrollReveal(0.5)

  useEffect(() => {
    if (isVisible && !displayed) {
      setDisplayed(true)
    }
  }, [isVisible, displayed])

  return (
    <div ref={ref} className="py-4">
      <div className="flex items-baseline justify-center gap-1">
        <span className={`text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent ${displayed ? 'count-up' : 'opacity-0'}`}>
          {value}
        </span>
        <span className="text-lg text-white/40">{unit}</span>
      </div>
      <p className="text-xs text-white/30 mt-2">{label}</p>
    </div>
  )
}

/* ===== CTA Section ===== */
function CTASection({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="py-24 md:py-36 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(83,139,176,0.12)_0%,_transparent_60%)]" />

      <div ref={ref} className={`relative max-w-3xl mx-auto px-4 text-center reveal ${isVisible ? 'visible' : ''}`}>
        <div className="text-5xl mb-6">🐇</div>
        <h2 className="text-2xl md:text-4xl font-bold leading-relaxed">
          アイデアを形にする準備は
          <br />
          できていますか？
        </h2>
        <p className="mt-6 text-white/40 max-w-lg mx-auto">
          ラピットくんがお手伝いします。
          まずはチャットであなたのアイデアを教えてください。
        </p>
        <div className="mt-10">
          <button
            onClick={onStart}
            disabled={loading}
            className="group relative bg-gradient-to-r from-[#538bb0] to-[#3d6f94] hover:from-[#3d6f94] hover:to-[#538bb0] text-white font-bold py-4 px-12 rounded-full text-lg transition-all disabled:opacity-50 glow-pulse"
          >
            <span className="flex items-center gap-2">
              {loading ? '準備中...' : 'ラピットくんと話す'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
        <p className="mt-4 text-xs text-white/20">
          完全無料・アカウント不要・30秒で開始
        </p>
      </div>
    </section>
  )
}
