// Tipos para autenticación basados en los DTOs del backend

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
}

export interface CheckTokenRequest {
  token: string;
}

export interface CheckTokenResponse {
  valid: boolean;
  payload?: JwtPayload;
}

export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  lastname: string;
  username: string;
  role: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  body: T;
}

// Enums para roles (debe coincidir con el backend)
export enum Role {
  STUDENT = 0,
  TEACHER = 1,
  ADMIN = 2,
  UNKNOWN = 3
}

// Tipos para el contexto de autenticación
export interface User {
  id: number;
  email: string;
  name: string;
  lastname: string;
  username: string;
  role: Role;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

