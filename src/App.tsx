import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Role } from './types/auth';

type AppState = 'landing' | 'login';

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  console.log('AppContent user:', user);
  const [currentView, setCurrentView] = useState<AppState>('landing');

  const handleLogout = () => {
    logout();
    setCurrentView('landing');
  };

  // Si está cargando, mostrar spinner
  

  // Si el usuario está autenticado, mostrar el dashboard correspondiente
  if (user) {
    if (user.role === Role.STUDENT) {
      return (
        <ProtectedRoute allowedRoles={[Role.STUDENT]}>
          <StudentDashboard 
            onLogout={handleLogout}
            userData={{
              name: user.name,
              email: user.email,
              class: "Clase por asignar" // TODO: Fetch actual class from API
            }}
          />
        </ProtectedRoute>
      );
    } else if (user.role === Role.TEACHER) {
      return (
        <ProtectedRoute allowedRoles={[Role.TEACHER]}>
          <TeacherDashboard
            teacherData={{
              name: user.name,
              email: user.email,
              classes: [] // TODO: Fetch actual classes from API
            }}
            onLogout={handleLogout}
          />
        </ProtectedRoute>
      );
    } else if (user.role === Role.ADMIN) {
      return (
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
              <p className="text-gray-600 mb-4">Bienvenido, {user.name}</p>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </ProtectedRoute>
      );
    }
  }

  // Si no está autenticado, mostrar landing o login
  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentView('login')} />;
      
      case 'login':
        return (
          <LoginForm
            onBack={() => setCurrentView('landing')}
          />
        );
      
      default:
        return <LandingPage onGetStarted={() => setCurrentView('login')} />;
    }
  };

  return renderCurrentView();
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}