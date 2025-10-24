// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, BookOpen, Users, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth, InvalidCredentialsError, TokenInvalidError } from '../contexts/AuthContext';

interface LoginFormProps {
  onBack: () => void;
}

export function LoginForm({ onBack }: LoginFormProps) {
  const { login, demoLogin, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    const trimmedPass = password;

    if (!trimmedUser || !trimmedPass) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      const result = await login(trimmedUser, trimmedPass);
      // caso en que login devuelva false en vez de lanzar excepción
      if (result === false) {
        setPassword('');
        setError('error contraseña o usuario mal');
      }
      // si login fue exitoso, el contexto actualizará la UI
    } catch (err: any) {
      // errores específicos
      if (err instanceof InvalidCredentialsError || err instanceof TokenInvalidError || err?.response?.status === 401) {
        setPassword('');
        setError('error contraseña o usuario mal');
      } else {
        setError('Error del servidor. Intenta nuevamente más tarde.');
      }
    }
  };

  const handleDemoLogin = (userType: 'student' | 'teacher') => {
    setError('');
    try {
      const success = demoLogin(userType);
      if (!success) setError('Error en el login de demostración');
    } catch {
      setError('Error en el login de demostración');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={onBack} className="mb-6 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Button>

        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <img src="/src/assets/kumo_logo.svg" alt="Kumo Logo" className="h-12 w-auto" />
              </div>
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <p className="text-gray-600 mt-2">Accede a tu cuenta de Kumo</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu nombre de usuario"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* ERROR VISIBLE ABAJO DEL FORM (ROJO) */}
            {error && (
              <div role="alert" aria-live="assertive" className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O prueba con</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button type="button" variant="outline" className="w-full" onClick={() => handleDemoLogin('student')} disabled={isLoading}>
                <BookOpen className="h-4 w-4 mr-2" /> Demo Estudiante
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => handleDemoLogin('teacher')} disabled={isLoading}>
                <Users className="h-4 w-4 mr-2" /> Demo Profesor
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>¿Necesitas ayuda? <button className="text-primary hover:underline">Contacta soporte</button></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
