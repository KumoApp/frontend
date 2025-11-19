import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType, Role } from "../types/auth";
import { authService } from "../services/api";

/** Errores específicos exportados para que los llamadores (LoginForm) los capturen */
export class InvalidCredentialsError extends Error {
  constructor(message = "Usuario o contraseña inválidos") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}
export class TokenInvalidError extends Error {
  constructor(message = "Token inválido o expirado") {
    super(message);
    this.name = "TokenInvalidError";
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
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("user_data");

      console.log(
        "[AuthContext] initializeAuth - savedToken:",
        savedToken ? savedToken.substring(0, 20) + "..." : "NO TOKEN",
      );
      console.log(
        "[AuthContext] initializeAuth - savedUser:",
        savedUser ? "EXISTS" : "NO USER",
      );

      if (savedToken && savedUser) {
        try {
          console.log("[AuthContext] Verificando token con backend...");
          // Verificar si el token sigue siendo válido
          const response = await authService.checkToken(savedToken);
          console.log("[AuthContext] Respuesta de checkToken:", response);

          if (response.body?.valid && response.body?.payload) {
            console.log("[AuthContext] Token válido, restaurando sesión");
            setToken(savedToken);
            setUser(response.body.payload as User);
          } else {
            console.warn(
              "[AuthContext] Token reportado como inválido por /auth/check",
            );
            console.warn(
              "[AuthContext] NO SE BORRARÁ EL TOKEN (temporalmente deshabilitado para debug)",
            );
            // Token inválido, limpiar datos
            // TEMPORALMENTE COMENTADO PARA DEBUG
            // localStorage.removeItem("auth_token");
            // localStorage.removeItem("user_data");

            // Intentar parsear el user guardado y usarlo aunque checkToken diga que es inválido
            try {
              const parsedUser = JSON.parse(savedUser);
              setToken(savedToken);
              setUser(parsedUser as User);
              console.log(
                "[AuthContext] Usando token/user guardado a pesar de que checkToken dice que es inválido",
              );
            } catch (parseError) {
              console.error(
                "[AuthContext] Error parseando user guardado:",
                parseError,
              );
            }
          }
        } catch (error) {
          console.error("[AuthContext] Error verificando token:", error);
          console.error(
            "[AuthContext] NO SE BORRARÁ EL TOKEN (temporalmente deshabilitado para debug)",
          );

          try {
            const parsedUser = JSON.parse(savedUser);
            setToken(savedToken);
            setUser(parsedUser as User);
            console.log(
              "[AuthContext] Usando token/user guardado a pesar del error",
            );
          } catch (parseError) {
            console.error(
              "[AuthContext] Error parseando user guardado:",
              parseError,
            );
          }
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
  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("[AuthContext LOGIN] Iniciando login para:", username);

      const response = await authService.login({ username, password });
      console.log("[AuthContext LOGIN] Respuesta de /auth/login:", response);

      // Si la API indica fallo (credenciales incorrectas), lanzamos excepción
      if (!response.body?.success || !response.body?.token) {
        console.error(
          "[AuthContext LOGIN] Login falló - no hay token en respuesta",
        );
        throw new InvalidCredentialsError();
      }

      console.log(
        "[AuthContext LOGIN] Token recibido:",
        response.body.token.substring(0, 20) + "...",
      );
      console.log("[AuthContext LOGIN] Verificando token con /auth/check...");

      // Verificamos el token para obtener payload/user
      const tokenResponse = await authService.checkToken(response.body.token);
      console.log(
        "[AuthContext LOGIN] Respuesta de /auth/check:",
        tokenResponse,
      );

      if (!(tokenResponse.body?.valid && tokenResponse.body?.payload)) {
        console.error("[AuthContext LOGIN] Token inválido según /auth/check");
        throw new TokenInvalidError();
      }

      const userData = tokenResponse.body.payload as User;
      console.log("[AuthContext LOGIN] Token válido. userData:", userData);

      // Guardar en estado y localStorage
      console.log(
        "[AuthContext LOGIN] Guardando token en estado y localStorage...",
      );
      setToken(response.body.token);
      setUser(userData);
      console.log("AuthProvider - userData from token:", userData);
      console.log(
        "AuthProvider - Guardando token en localStorage:",
        response.body.token.substring(0, 20) + "...",
      );
      localStorage.setItem("auth_token", response.body.token);
      localStorage.setItem("user_data", JSON.stringify(userData));
      console.log(
        "AuthProvider - Token guardado. Verificando:",
        localStorage.getItem("auth_token") ? "OK" : "ERROR",
      );

      return true;
    } catch (error) {
      // No tragamos el error: lo re-lanzamos para que el caller (LoginForm) lo maneje
      console.error("Error en login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  };

  const demoLogin = (userType: "student" | "teacher"): boolean => {
    try {
      // Crear datos de usuario demo
      const demoUsers = {
        student: {
          id: 1,
          email: "estudiante1@demo.com",
          name: "Ana",
          lastname: "García",
          username: "estudiante1",
          role: Role.STUDENT,
        },
        teacher: {
          id: 2,
          email: "profesor1@demo.com",
          name: "Dr. Carlos",
          lastname: "Mendoza",
          username: "profesor1",
          role: Role.TEACHER,
        },
      };

      const demoUser = demoUsers[userType];
      const demoToken = "demo-token-" + userType;

      // Simular login exitoso
      setUser(demoUser);
      setToken(demoToken);
      localStorage.setItem("auth_token", demoToken);
      localStorage.setItem("user_data", JSON.stringify(demoUser));

      return true;
    } catch (error) {
      console.error("Error en login demo:", error);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
