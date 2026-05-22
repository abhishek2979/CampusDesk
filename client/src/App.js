import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SubmitPage from './pages/SubmitPage';
import ComplaintsPage from './pages/ComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import UsersPage from './pages/UsersPage';
import { Spinner } from './components/StatCard';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
        <Spinner />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div className="page-container">
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}>
        <Spinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>
      } />
      <Route path="/submit" element={
        <ProtectedRoute roles={['student']}><Layout><SubmitPage /></Layout></ProtectedRoute>
      } />
      <Route path="/my-complaints" element={
        <ProtectedRoute roles={['student']}><Layout><ComplaintsPage /></Layout></ProtectedRoute>
      } />
      <Route path="/complaints" element={
        <ProtectedRoute roles={['admin', 'department']}><Layout><ComplaintsPage /></Layout></ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute roles={['admin']}><Layout><UsersPage /></Layout></ProtectedRoute>
      } />
      <Route path="/complaints/:id" element={
        <ProtectedRoute><Layout><ComplaintDetailPage /></Layout></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: 'Inter, Segoe UI, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 10,
                background: '#1C1714',
                color: '#fff',
                maxWidth: '90vw'
              },
              success: { iconTheme: { primary: '#1A6E3C', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#C84B2F', secondary: '#fff' } }
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
