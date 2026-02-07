import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './lib/ProtectedRoute'
import { HomeRoute } from './lib/HomeRoute'
import { InstallPrompt } from './components/InstallPrompt'
import {
  LoginScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  Onboarding,
  Dashboard,
  Settings,
  Timeline,
  Notes,
  Resources,
  Legal,
  RightsScreen,
  Glossary,
  Contacts,
  Preparation,
} from './screens'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InstallPrompt />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/auth" element={<LoginScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline"
            element={
              <ProtectedRoute>
                <Timeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/legal"
            element={
              <ProtectedRoute>
                <Legal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rights"
            element={
              <ProtectedRoute>
                <RightsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/glossary"
            element={
              <ProtectedRoute>
                <Glossary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preparation"
            element={
              <ProtectedRoute>
                <Preparation />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
