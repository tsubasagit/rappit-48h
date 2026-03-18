import { useState, useEffect } from 'react'

type Props = {
  approvedAt: number // Unix timestamp (ms)
  deadlineHours?: number
}

export default function Timer({ approvedAt, deadlineHours = 48 }: Props) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const deadline = approvedAt + deadlineHours * 60 * 60 * 1000
  const remaining = Math.max(0, deadline - now)
  const elapsed = now - approvedAt

  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

  const progress = Math.min(100, (elapsed / (deadlineHours * 60 * 60 * 1000)) * 100)
  const isUrgent = remaining < 6 * 60 * 60 * 1000 // 残り6時間未満

  if (remaining === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-red-600 font-bold">納品期限を過ぎています</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm font-bold text-gray-500 mb-3">納品までの残り時間</h3>
      <div className={`text-3xl font-mono font-bold text-center mb-4 ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${isUrgent ? 'bg-red-500' : 'bg-primary'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>承認</span>
        <span>48h</span>
      </div>
    </div>
  )
}
