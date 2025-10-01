import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, BookOpen, Users, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onLogin: (userType: 'student' | 'teacher', userData: any) => void;
  onBack: () => void;
}

export function LoginForm({ onLogin, onBack }: LoginFormProps) {
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for classes
  const availableClasses = [
    'Matemáticas 10A',
    'Historia 9B', 
    'Ciencias 11C',
    'Literatura 10B',
    'Química 11A'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication
    if (userType === 'student') {
      onLogin('student', {
        name: 'Ana García',
        email,
        class: selectedClass,
        id: 'student_1'
      });
    } else {
      onLogin('teacher', {
        name: 'Prof. María González',
        email,
        id: 'teacher_1',
        classes: ['Matemáticas 10A', 'Matemáticas 11C', 'Álgebra 9A']
      });
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (type: 'student' | 'teacher') => {
    if (type === 'student') {
      onLogin('student', {
        name: 'Ana García',
        email: 'ana.garcia@estudiante.com',
        class: 'Matemáticas 10A',
        id: 'student_demo'
      });
    } else {
      onLogin('teacher', {
        name: 'Prof. María González',
        email: 'maria.gonzalez@profesor.com',
        id: 'teacher_demo',
        classes: ['Matemáticas 10A', 'Matemáticas 11C', 'Álgebra 9A']
      });
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

            {/* User Type Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-lg">
              <Button
                type="button"
                variant={userType === 'student' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUserType('student')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Estudiante
              </Button>
              <Button
                type="button"
                variant={userType === 'teacher' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUserType('teacher')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Profesor
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={userType === 'student' ? 'estudiante@colegio.edu' : 'profesor@colegio.edu'}
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

              {userType === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="class">Clase</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu clase" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableClasses.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                onClick={() => handleDemoLogin('student')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Demo Estudiante
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleDemoLogin('teacher')}
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