import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResearchPage from './pages/ResearchPage';
import ResearchReaderPage from './pages/ResearchReaderPage';
import PastPapersPage from './pages/PastPapersPage';
import PracticeModePage from './pages/PracticeModePage';
import InnovatePage from './pages/InnovatePage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 spinner mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Loading SAKSHAM...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1" id="main-content" tabIndex={-1}>
        {children}
      </main>
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

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/research" element={
              <ProtectedRoute>
                <AppLayout>
                  <ResearchPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/research/:id" element={
              <ProtectedRoute>
                <AppLayout>
                  <ResearchReaderPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/past-papers" element={
              <ProtectedRoute>
                <AppLayout>
                  <PastPapersPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/past-papers/:id/practice" element={
              <ProtectedRoute>
                <AppLayout>
                  <PracticeModePage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/innovate" element={
              <ProtectedRoute>
                <AppLayout>
                  <InnovatePage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

