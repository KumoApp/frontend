import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, Role } from '../types/auth';
import { authService } from '../services/api';

/** Errores específicos exportados para que los llamadores (LoginForm) los capturen */
export class InvalidCredentialsError extends Error {
  constructor(message = 'Usuario o contraseña inválidos') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}
export class TokenInvalidError extends Error {
  constructor(message = 'Token inválido o expirado') {
    super(message);
    this.name = 'TokenInvalidError';
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay un token guardado al cargar la app
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user_data');

      if (savedToken && savedUser) {
        try {
          // Verificar si el token sigue siendo válido
          const response = await authService.checkToken(savedToken);
          
          if (response.body?.valid && response.body?.payload) {
            setToken(savedToken);
            setUser(response.body.payload as User);
          } else {
            // Token inválido, limpiar datos
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        } catch (error) {
          console.error('Error verificando token:', error);
          // Error al verificar token, limpiar datos
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * login:
   * - Si la API responde que las credenciales son inválidas -> lanza InvalidCredentialsError
   * - Si el token devuelto no es válido -> lanza TokenInvalidError
   * - Si hay un error de red u otro -> relanza para que el caller lo maneje
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await authService.login({ username, password });

      // Si la API indica fallo (credenciales incorrectas), lanzamos excepción
      if (!response.body?.success || !response.body?.token) {
        throw new InvalidCredentialsError();
      }

      // Verificamos el token para obtener payload/user
      const tokenResponse = await authService.checkToken(response.body.token);

      if (!(tokenResponse.body?.valid && tokenResponse.body?.payload)) {
        throw new TokenInvalidError();
      }

      const userData = tokenResponse.body.payload as User;

      // Guardar en estado y localStorage
      setToken(response.body.token);
      setUser(userData);
      console.log('AuthProvider - userData from token:', userData);
      localStorage.setItem('auth_token', response.body.token);
      localStorage.setItem('user_data', JSON.stringify(userData));

      return true;
    } catch (error) {
      // No tragamos el error: lo re-lanzamos para que el caller (LoginForm) lo maneje
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  const demoLogin = (userType: 'student' | 'teacher'): boolean => {
    try {
      // Crear datos de usuario demo
      const demoUsers = {
        student: {
          id: 1,
          email: 'estudiante1@demo.com',
          name: 'Ana',
          lastname: 'García',
          username: 'estudiante1',
          role: Role.STUDENT
        },
        teacher: {
          id: 2,
          email: 'profesor1@demo.com',
          name: 'Dr. Carlos',
          lastname: 'Mendoza',
          username: 'profesor1',
          role: Role.TEACHER
        }
      };

      const demoUser = demoUsers[userType];
      const demoToken = 'demo-token-' + userType;
      
      // Simular login exitoso
      setUser(demoUser);
      setToken(demoToken);
      localStorage.setItem('auth_token', demoToken);
      localStorage.setItem('user_data', JSON.stringify(demoUser));
      
      return true;
    } catch (error) {
      console.error('Error en login demo:', error);
      return false;
    }
  };

  const isAuthenticated = user !== null && token !== null;

  const value: AuthContextType = {
    user,
    token,
    login,
    demoLogin,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
