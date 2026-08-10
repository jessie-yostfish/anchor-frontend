import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './lib/ProtectedRoute'
import { HomeRoute } from './lib/HomeRoute'
import { InstallPrompt } from './components/InstallPrompt'
import {
  LoginScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  Onboarding,
  FosterCareIntro,
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
  DeleteAccount,
  TermsOfService,
  PrivacyPolicy,
  ContactSupport
} from './screens'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global watermark — sits behind all screens */}
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none' }}>
          <img src='/anchor-icon-only.png' alt='' aria-hidden='true' style={{ width: 360, height: 360, objectFit: 'contain', opacity: 0.13, filter: 'saturate(1.4) brightness(0.7)' }} />
        </div>
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
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route
            path="/foster-care-intro"
            element={
              <ProtectedRoute>
                <FosterCareIntro />
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
          <Route
            path="/terms"
            element={
              <ProtectedRoute>
                <TermsOfService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <ProtectedRoute>
                <PrivacyPolicy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact-support"
            element={
              <ProtectedRoute>
                <ContactSupport />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Analytics />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
