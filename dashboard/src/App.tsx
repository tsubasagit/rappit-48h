import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Chat from './pages/Chat'
import ProjectStatus from './pages/ProjectStatus'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/chat/:projectId" element={<Chat />} />
      <Route path="/status/:projectId" element={<ProjectStatus />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
