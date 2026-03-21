import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* ブランド */}
          <div className="flex items-center gap-2">
            <img src="/images/rabit-standing.png" alt="ラピットくん" className="h-6 w-6 object-contain" />
            <span className="text-sm font-bold text-rabit-700">rabit48</span>
          </div>

          {/* リンク */}
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-rabit-600 transition-colors">
              ホーム
            </Link>
            <a href="#how-it-works" className="hover:text-rabit-600 transition-colors">
              使い方
            </a>
            <Link to="/login" className="hover:text-rabit-600 transition-colors">
              ログイン
            </Link>
          </nav>

          {/* コピーライト */}
          <p className="text-xs text-gray-400">
            &copy; 2026 AppTalentHub株式会社
          </p>
        </div>
      </div>
    </footer>
  );
}
