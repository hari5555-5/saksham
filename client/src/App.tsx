import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import AccessibilityToolbar from './components/AccessibilityToolbar';

// APD EQUILEARN Portal Components & Pages
import { BioBridgeNavbar } from './components/biobridge/BioBridgeNavbar';
import { BioBridgeAIAssistant } from './components/biobridge/BioBridgeAIAssistant';
import { BioBridgeLandingPage } from './pages/biobridge/BioBridgeLandingPage';
import { BioBridgeDashboardPage } from './pages/biobridge/BioBridgeDashboardPage';
import { BioBridgeResearchPage } from './pages/biobridge/BioBridgeResearchPage';
import { BioBridgeBiomarkersPage } from './pages/biobridge/BioBridgeBiomarkersPage';
import { BioBridgeCompetitivePage } from './pages/biobridge/BioBridgeCompetitivePage';
import { BioBridgeInnovatePage } from './pages/biobridge/BioBridgeInnovatePage';
import { BioBridgeBiosensorsPage } from './pages/biobridge/BioBridgeBiosensorsPage';
import { BioBridgeExperimentsPage } from './pages/biobridge/BioBridgeExperimentsPage';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PastPapersPage from './pages/PastPapersPage';
import PracticeModePage from './pages/PracticeModePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 spinner mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Loading APD EQUILEARN...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function APDEquilearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <BioBridgeNavbar />
      <AccessibilityToolbar />
      <main className="flex-1" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <BioBridgeAIAssistant />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Hide splash screen immediately once React loads
    SplashScreen.hide().catch(() => {});
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#020617' }).catch(() => {});
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* APD EQUILEARN Main Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeLandingPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />

            <Route path="/biobridge" element={<Navigate to="/" replace />} />
            <Route path="/biobridge/home" element={<Navigate to="/" replace />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeDashboardPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />
            <Route path="/biobridge/dashboard" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeDashboardPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />

            <Route path="/research" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeResearchPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />
            <Route path="/biobridge/research" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeResearchPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />

            <Route path="/biomarkers" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeBiomarkersPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />
            <Route path="/biobridge/biomarkers" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeBiomarkersPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />

            <Route path="/competitive" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeCompetitivePage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />
            <Route path="/biobridge/competitive" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeCompetitivePage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />

            <Route path="/innovate" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeInnovatePage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />
            <Route path="/biobridge/innovate" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeInnovatePage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />

            <Route path="/biosensors" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeBiosensorsPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />
            <Route path="/biobridge/biosensors" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeBiosensorsPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />

            <Route path="/experiments" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeExperimentsPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />
            <Route path="/biobridge/experiments" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeExperimentsPage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />

            <Route path="/past-papers" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <BioBridgeCompetitivePage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />
            <Route path="/past-papers/:id/practice" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <PracticeModePage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <APDEquilearnLayout>
                  <ProfilePage />
                </APDEquilearnLayout>
              </ProtectedRoute>
            } />

            {/* Catch all redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
