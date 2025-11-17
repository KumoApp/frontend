import React, { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginForm } from "./components/LoginForm";
import { StudentDashboard } from "./components/StudentDashboard";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Role } from "./types/auth";
import { AdminDashboard } from "./components/AdminDashboard";
import { SystemShopManager } from "./components/SystemShopManager";

type AppState = "landing" | "login";

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppState>("landing");

  const handleLogout = () => {
    logout();
    setCurrentView("landing");
  };

  if (user) {
    // Check if user is "system" - redirect to SystemShopManager
    if (user.username === "system") {
      return <SystemShopManager onLogout={handleLogout} />;
    }

    if (user.role === Role.STUDENT) {
      return (
        <ProtectedRoute allowedRoles={[Role.STUDENT]}>
          <StudentDashboard
            onLogout={handleLogout}
            userData={{
              name: user.name,
              email: user.email,
              class: "Clase por asignar",
            }}
          />
        </ProtectedRoute>
      );
    }

    if (user.role === Role.TEACHER) {
      return (
        <ProtectedRoute allowedRoles={[Role.TEACHER]}>
          <TeacherDashboard
            teacherData={{
              name: user.name,
              email: user.email,
              classes: [], // Integrar a futuro: GET /classes del profe
            }}
            onLogout={handleLogout}
          />
        </ProtectedRoute>
      );
    }

    if (user.role === Role.ADMIN) {
      return (
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <AdminDashboard
            adminData={{ name: user.name, email: user.email }}
            onLogout={handleLogout}
          />
        </ProtectedRoute>
      );
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "landing":
        return <LandingPage onGetStarted={() => setCurrentView("login")} />;
      case "login":
        return <LoginForm onBack={() => setCurrentView("landing")} />;
      default:
        return <LandingPage onGetStarted={() => setCurrentView("login")} />;
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
