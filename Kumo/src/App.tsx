import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';

type AppState = 'landing' | 'login' | 'student' | 'teacher';

interface User {
  type: 'student' | 'teacher';
  data: any;
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userType: 'student' | 'teacher', userData: any) => {
    setUser({ type: userType, data: userData });
    setCurrentView(userType);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentView('login')} />;
      
      case 'login':
        return (
          <LoginForm
            onLogin={handleLogin}
            onBack={() => setCurrentView('landing')}
          />
        );
      
      case 'student':
        return (
          <StudentDashboard 
            onLogout={handleLogout}
            userData={user?.data}
          />
        );      
      case 'teacher':
        return (
          <TeacherDashboard
            teacherData={user?.data}
            onLogout={handleLogout}
          />
        );
      
      default:
        return <LandingPage onGetStarted={() => setCurrentView('login')} />;
    }
  };

  return renderCurrentView();
}