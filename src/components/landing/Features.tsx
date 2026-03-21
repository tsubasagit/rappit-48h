import { MessageSquare, GraduationCap, Rocket } from 'lucide-react';
import type { ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <MessageSquare className="h-8 w-8 text-rabit-600" />,
    title: 'AIガイド付き学習',
    description: 'ラピットくんが課題定義からUI設計まで、アプリ開発の考え方を対話形式で教えます。初めてでも安心。',
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-rabit-600" />,
    title: '実践的なスキル習得',
    description: 'MoSCoW法、ペルソナ設計、SERVICE_SPEC.mdの書き方など、AIエージェントに指示を出すための実践スキルが身につきます。',
  },
  {
    icon: <Rocket className="h-8 w-8 text-accent-500" />,
    title: 'すぐに使えるテンプレート',
    description: 'セッション後にSERVICE_SPEC.mdテンプレートとプロンプト集をお渡し。Claude CodeやCursorですぐに開発を始められます。',
  },
];

export function Features() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            rabit48で学べること
          </h2>
          <p className="mt-4 text-gray-500">
            AIエージェント開発に必要な3つのスキルを、体験しながら学びます。
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-100 p-8 text-center transition-shadow hover:shadow-md"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rabit-50">
                {feature.icon}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
