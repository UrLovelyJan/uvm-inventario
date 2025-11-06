import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Sedes from './pages/Sedes';
import Laboratorios from './pages/Laboratorios';
import Equipos from './pages/Equipos';
import Movimientos from './pages/Movimientos';
import Historial from './pages/Historial';
import Usuarios from './pages/Usuarios';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.rol_nombre !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-uvm-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : 
            <Login onLogin={login} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Layout user={user} onLogout={logout}>
                <Dashboard user={user} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sedes" 
          element={
            <ProtectedRoute>
              <Layout user={user} onLogout={logout}>
                <Sedes />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/laboratorios" 
          element={
            <ProtectedRoute>
              <Layout user={user} onLogout={logout}>
                <Laboratorios />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/equipos" 
          element={
            <ProtectedRoute>
              <Layout user={user} onLogout={logout}>
                <Equipos />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/movimientos" 
          element={
            <ProtectedRoute>
              <Layout user={user} onLogout={logout}>
                <Movimientos />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/historial" 
          element={
            <ProtectedRoute>
              <Layout user={user} onLogout={logout}>
                <Historial />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requiredRole="JEFE">
              <Layout user={user} onLogout={logout}>
                <Usuarios />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;