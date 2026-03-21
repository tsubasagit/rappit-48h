import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './contexts/AuthContext';
import { ChatLayout } from './components/ChatLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Chat } from './pages/Chat';
import { SpecReview } from './pages/SpecReview';
import { MockupPreviewPage } from './pages/MockupPreview';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

export function App() {
  const { loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<ChatLayout />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/spec" element={<SpecReview />} />
          <Route path="/mockup" element={<MockupPreviewPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
