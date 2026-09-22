import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GuestRoute } from './components/auth/GuestRoute'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AuthProvider } from './providers/AuthProvider'
import { NotificationProvider } from './providers/NotificationProvider'
import { BoardPage } from './pages/BoardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/boards/:boardId" element={<BoardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
