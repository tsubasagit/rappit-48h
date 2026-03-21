import { MessageCircle, GraduationCap, FileText, Rocket } from 'lucide-react';
import type { ReactNode } from 'react';

interface Step {
  number: number;
  icon: ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: <MessageCircle className="h-6 w-6 text-white" />,
    title: '体験する',
    description: 'ラピットくんと対話しながら、課題定義・ペルソナ設計・機能設計の考え方を学びます。',
  },
  {
    number: 2,
    icon: <GraduationCap className="h-6 w-6 text-white" />,
    title: 'スキルを身につける',
    description: 'MoSCoW法やUI設計、技術選定の判断基準など、AIに指示を出すための実践スキルを習得。',
  },
  {
    number: 3,
    icon: <FileText className="h-6 w-6 text-white" />,
    title: '仕様書を作る',
    description: 'SERVICE_SPEC.mdの書き方を学び、AIエージェントへの完璧な指示書を自分で作れるように。',
  },
  {
    number: 4,
    icon: <Rocket className="h-6 w-6 text-white" />,
    title: '開発を始める',
    description: 'テンプレートとプロンプト集を使って、Claude CodeやCursorで実際のアプリ開発をスタート。',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            学びの流れ
          </h2>
          <p className="mt-4 text-gray-500">
            4つのステップでAIエージェント開発スキルを習得
          </p>
        </div>

        {/* ステップ: デスクトップ横・モバイル縦 */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                {/* コネクターライン（デスクトップ） */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-rabit-200 md:block" />
                )}

                {/* コネクターライン（モバイル） */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-16 h-8 w-0.5 -translate-x-1/2 bg-rabit-200 md:hidden" />
                )}

                {/* アイコン */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-rabit-600 shadow-lg">
                  {step.icon}
                </div>

                {/* テキスト */}
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  <span className="text-rabit-600">STEP {step.number}.</span>{' '}
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
