import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, BookOpen, Users, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types/auth';

interface LoginFormProps {
  onBack: () => void;
}

export function LoginForm({ onBack }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const success = await login(username, password);
    
    if (!success) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleDemoLogin = async (username: string, password: string) => {
    setError('');
    const success = await login(username, password);
    
    if (!success) {
      setError('Error en el login de demostración');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Button>

        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
                <span className="text-2xl">🐱</span>
              </div>
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <p className="text-gray-600 mt-2">Accede a tu cuenta de Kumo</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu nombre de usuario"
                  required
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>


              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O prueba con</span>
              </div>
            </div>

            {/* Demo buttons */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleDemoLogin('estudiante1', 'password123')}
                disabled={isLoading}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Demo Estudiante
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleDemoLogin('profesor1', 'password123')}
                disabled={isLoading}
              >
                <Users className="h-4 w-4 mr-2" />
                Demo Profesor
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