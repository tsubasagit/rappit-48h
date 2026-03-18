import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, FUNCTIONS_BASE_URL } from '../lib/firebase'
import ChatMessage, { type Message } from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import SpecPreview from '../components/SpecPreview'

type ProjectStatus = 'hearing' | 'spec_review' | 'spec_approved' | 'building' | 'delivered'

type Project = {
  status: ProjectStatus
  specMarkdown?: string
  revisionCount?: number
}

export default function Chat() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [sending, setSending] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Firestore リアルタイム監視
  useEffect(() => {
    if (!projectId) return
    const unsub = onSnapshot(doc(db, 'projects', projectId), (snap) => {
      if (snap.exists()) {
        setProject(snap.data() as Project)
      }
    })
    return () => unsub()
  }, [projectId])

  // 初回メッセージ取得
  useEffect(() => {
    if (!projectId) return
    const loadMessages = async () => {
      try {
        const res = await fetch(`${FUNCTIONS_BASE_URL}/getMessages?projectId=${projectId}`)
        const data = await res.json()
        if (data.messages?.length > 0) {
          setMessages(data.messages)
        } else {
          // 新規プロジェクト — ラピットくんの挨拶を送信
          await sendToAgent('', true)
        }
      } catch {
        // 初回挨拶をフォールバック
        setMessages([{
          role: 'assistant',
          content: 'こんにちは！ラピットくんです 🐇\n\nあなたのアイデアを48時間で形にするお手伝いをします！\n\nまずは、**どんなものを作りたいか**教えてください。ざっくりでOKです！',
        }])
      } finally {
        setInitialLoading(false)
      }
    }
    loadMessages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendToAgent = async (userMessage: string, isInitial = false) => {
    if (!projectId) return

    if (!isInitial && userMessage) {
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    }
    setSending(true)

    try {
      const res = await fetch(`${FUNCTIONS_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          message: userMessage,
          isInitial,
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'すみません、通信エラーが発生しました。もう一度お試しください。' },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleApproveSpec = async () => {
    if (!projectId) return
    setSending(true)
    try {
      await fetch(`${FUNCTIONS_BASE_URL}/approveSpec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      navigate(`/status/${projectId}`)
    } catch {
      alert('エラーが発生しました。')
    } finally {
      setSending(false)
    }
  }

  const handleReviseSpec = () => {
    sendToAgent('設計書の内容を修正してほしいです。')
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🐇</div>
          <p className="text-gray-500">ラピットくんを準備中...</p>
        </div>
      </div>
    )
  }

  const isHearing = !project || project.status === 'hearing'
  const isSpecReview = project?.status === 'spec_review'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-xl">🐇</span>
          <span className="font-bold text-gray-900">ラピットくん</span>
          <span className="text-xs text-gray-400 ml-auto">
            {isHearing && 'ヒアリング中'}
            {isSpecReview && '設計書レビュー'}
            {project?.status === 'spec_approved' && '承認済み'}
            {project?.status === 'building' && '構築中'}
            {project?.status === 'delivered' && '納品完了'}
          </span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}

          {/* 設計書プレビュー */}
          {isSpecReview && project?.specMarkdown && (
            <div className="my-4">
              <SpecPreview
                markdown={project.specMarkdown}
                onApprove={handleApproveSpec}
                onRevise={handleReviseSpec}
                revisionCount={project.revisionCount ?? 0}
                maxRevisions={3}
                disabled={sending}
              />
            </div>
          )}

          {/* Typing indicator */}
          {sending && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                <span className="text-sm">🐇</span>
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {(isHearing || isSpecReview) && (
        <div className="max-w-3xl mx-auto w-full">
          <ChatInput
            onSend={(msg) => sendToAgent(msg)}
            disabled={sending}
            placeholder={
              isSpecReview
                ? '修正内容を入力...'
                : 'どんなものを作りたいか教えてください...'
            }
          />
        </div>
      )}
    </div>
  )
}
