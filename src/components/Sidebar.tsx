import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Plus, LogOut } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Avatar } from './ui/Avatar';

interface SidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { to: '/new', label: '新規プロジェクト', icon: Plus },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuthContext();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex h-full flex-col border-r border-gray-200">
      {/* ブランド */}
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-6">
        <img src="/images/rabit-standing.png" alt="ラピットくん" className="h-8 w-8 object-contain" />
        <span className="text-lg font-bold text-rabit-700">rabit48</span>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-rabit-100 text-rabit-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ユーザーセクション */}
      <div className="border-t border-gray-200 px-3 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.photoURL}
            name={user?.displayName}
            size="sm"
          />
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-gray-900">
              {user?.displayName ?? 'ユーザー'}
            </p>
            <p className="truncate text-xs text-gray-500">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="サインアウト"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
