import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, Role } from '../types/auth';
import { authService } from '../services/api';

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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await authService.login({ username, password });
      
      if (response.body?.success && response.body?.token) {
        // Obtener información del usuario del token
        const tokenResponse = await authService.checkToken(response.body.token);
        
        if (tokenResponse.body?.valid && tokenResponse.body?.payload) {
          const userData = tokenResponse.body.payload as User;
          
          // Guardar en estado y localStorage
          setToken(response.body.token);
          setUser(userData);
          localStorage.setItem('auth_token', response.body.token);
          localStorage.setItem('user_data', JSON.stringify(userData));
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
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

  const isAuthenticated = user !== null && token !== null;

  const value: AuthContextType = {
    user,
    token,
    login,
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

