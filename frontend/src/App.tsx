import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { Layout } from './components/layout/Layout';
import { PulseLoader } from './components/ui/PulseLoader';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
        <PulseLoader size="lg" />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
    <Route path="/medicines" element={<ProtectedRoute><Layout><MedicinesPage /></Layout></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: '500',
            fontSize: '13px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid rgba(16,185,129,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 16px rgba(16,185,129,0.1)',
          },
          success: { style: { borderColor: 'rgba(52,211,153,0.3)', color: 'var(--emerald)' } },
          error:   { style: { borderColor: 'rgba(255,77,109,0.3)', color: '#ff4d6d' } },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
