import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Avatar } from './ui/Avatar';

export function ChatLayout() {
  const { user } = useAuthContext();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* ヘッダー */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <img src="/images/rabit-standing.png" alt="ラピットくん" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-rabit-700">rabit48</span>
        </div>
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.photoURL}
            name={user?.displayName}
            size="sm"
          />
          <span className="hidden text-sm text-gray-600 sm:inline">
            {user?.displayName ?? user?.email}
          </span>
          <button
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="サインアウト"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* コンテンツ（フル高さ） */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
