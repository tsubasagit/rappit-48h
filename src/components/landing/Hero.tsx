import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rabit-700 via-rabit-600 to-rabit-800">
      {/* 背景デコレーション */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32 lg:py-40">
        <div className="text-center">
          {/* マスコット */}
          <div className="mb-8">
            <img
              src="/images/rabit-hero.png"
              alt="ラピットくん"
              className="mx-auto h-40 w-40 drop-shadow-2xl sm:h-52 sm:w-52"
            />
          </div>

          {/* ヘッドライン */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            AIエージェント開発を体験する
          </h1>

          {/* サブタイトル */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-rabit-100 sm:text-xl">
            ラピットくんと一緒に、課題定義からUI設計、技術選定まで
            アプリ開発の全プロセスを体験。AIエージェントの使い方が
            48分で身につきます。
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-white shadow-lg">
                無料で体験する
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                学べることを見る
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
